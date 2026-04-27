import { Response } from 'express';
import { body } from 'express-validator';
import crypto from 'crypto';
import dns from 'node:dns/promises';
import { Op } from 'sequelize';
import { comparePassword, hashPassword, signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../common/utils';
import { AppError, AuthenticatedRequest } from '../../../common/middleware';
import { User } from '../../../models';
import { logActivity } from '../../../common/utils';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: false,
};

export const loginValidators = [
  body('username').trim().notEmpty(),
  body('password').trim().notEmpty(),
];

export const login = async (req: AuthenticatedRequest, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };
  const user = await User.findOne({ where: { username }, include: [{ association: 'role', include: [{ association: 'permissions' }] }] });
  const ipAddress = req.ip;
  const userAgent = req.get('user-agent') || undefined;
  const normalizedIp = ipAddress?.startsWith('::ffff:') ? ipAddress.replace('::ffff:', '') : ipAddress;

  const clientName = normalizedIp
    ? await dns.reverse(normalizedIp).then((names) => names[0]).catch(() => undefined)
    : undefined;

  if (!user || user.status !== 'Active') {
    await logActivity({
      userId: null,
      entity: 'auth',
      entityId: null,
      action: 'login_failed',
      description: 'Login failed: invalid credentials',
      meta: {
        username,
        ipAddress,
        clientName,
        userAgent,
      },
    });
    throw new AppError('Invalid credentials', 401);
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    await logActivity({
      userId: user.id,
      entity: 'auth',
      entityId: user.id,
      action: 'login_failed',
      description: 'Login failed: invalid credentials',
      meta: {
        username: user.username,
        ipAddress,
        clientName,
        userAgent,
      },
    });
    throw new AppError('Invalid credentials', 401);
  }

  const permissions = (user.role?.permissions || []).map((permission) => permission.name);
  const payload = {
    userId: user.id,
    roleId: user.roleId,
    roleName: user.role?.name || 'User',
    username: user.username,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  user.refreshTokenHash = await hashPassword(refreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  await logActivity({
    userId: user.id,
    entity: 'auth',
    entityId: user.id,
    action: 'login',
    description: 'User logged in',
    meta: {
      username: user.username,
      ipAddress,
      clientName,
      userAgent,
    },
  });

  res.cookie('qms_refresh_token', refreshToken, cookieOptions);
  res.json({
    success: true,
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name,
      permissions,
    },
  });
};

export const refresh = async (req: AuthenticatedRequest, res: Response) => {
  const token = req.cookies?.qms_refresh_token || req.body?.refreshToken;
  if (!token) {
    throw new AppError('Refresh token missing', 401);
  }
  const payload = verifyRefreshToken(token);
  const user = await User.findByPk(payload.userId, { include: [{ association: 'role', include: [{ association: 'permissions' }] }] });
  if (!user || !user.refreshTokenHash) {
    throw new AppError('Session expired', 401);
  }
  const valid = await comparePassword(token, user.refreshTokenHash);
  if (!valid) {
    throw new AppError('Session expired', 401);
  }
  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);
  user.refreshTokenHash = await hashPassword(newRefreshToken);
  await user.save();
  res.cookie('qms_refresh_token', newRefreshToken, cookieOptions);
  res.json({ success: true, accessToken: newAccessToken });
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  const token = req.cookies?.qms_refresh_token;
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      const user = await User.findByPk(payload.userId);
      if (user) {
        user.refreshTokenHash = null;
        await user.save();
      }
    } catch {
      // Ignore invalid logout token.
    }
  }
  res.clearCookie('qms_refresh_token', cookieOptions);
  res.json({ success: true, message: 'Logged out' });
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  const user = await User.findByPk(req.user.id, { include: [{ association: 'role' }, { association: 'department' }] });
  res.json({ success: true, data: user });
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  const valid = await comparePassword(currentPassword, user.password);
  if (!valid) {
    throw new AppError('Current password is incorrect', 400);
  }
  user.password = await hashPassword(newPassword);
  await user.save();
  await logActivity({ userId: user.id, entity: 'auth', entityId: user.id, action: 'change_password', description: 'Password changed' });
  res.json({ success: true, message: 'Password updated successfully' });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { name, email, mobile } = req.body as {
    name?: string;
    email?: string;
    mobile?: string;
  };

  const user = await User.findByPk(req.user.id, { include: [{ association: 'role' }] });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (name !== undefined) {
    user.name = String(name).trim();
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingEmail = await User.findOne({
      where: {
        email: normalizedEmail,
        id: { [Op.ne]: user.id },
      },
    });

    if (existingEmail) {
      throw new AppError('Email is already in use', 400);
    }

    user.email = normalizedEmail;
  }

  if (mobile !== undefined) {
    const normalizedMobile = String(mobile).trim();
    user.mobile = normalizedMobile || null;
  }

  await user.save();

  await logActivity({
    userId: user.id,
    entity: 'auth',
    entityId: user.id,
    action: 'update_profile',
    description: 'Profile updated',
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      roleId: user.roleId,
      roleName: user.role?.name,
    },
  });
};

export const forgotPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body as { email: string };
  const user = await User.findOne({ where: { email } });
  if (!user) {
    res.json({ success: true, message: 'If the email exists, a reset link has been generated.' });
    return;
  }
  const token = crypto.randomBytes(24).toString('hex');
  user.passwordResetToken = token;
  user.passwordResetExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();
  res.json({
    success: true,
    message: 'Password reset token created.',
    resetToken: token,
  });
};
