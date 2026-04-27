import { Response } from 'express';
import dns from 'node:dns/promises';
import { Op, WhereOptions } from 'sequelize';
import { AuthenticatedRequest } from '../../../common/middleware';
import { parsePagination } from '../../../common/utils';
import { ActivityLog, User } from '../../../models';

type ParsedMeta = {
  ipAddress?: string;
  clientName?: string;
  userAgent?: string;
  username?: string;
  method?: string;
  path?: string;
  statusCode?: number;
};

const safeParseMeta = (value: string | null): ParsedMeta => {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as ParsedMeta;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const normalizeIp = (ip?: string) => {
  if (!ip) {
    return undefined;
  }

  if (ip.startsWith('::ffff:')) {
    return ip.replace('::ffff:', '');
  }

  return ip;
};

const resolveClientName = async (ip?: string) => {
  const normalizedIp = normalizeIp(ip);
  if (!normalizedIp) {
    return undefined;
  }

  try {
    const names = await dns.reverse(normalizedIp);
    return names[0];
  } catch {
    return undefined;
  }
};

export const getLoginAudits = async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, offset, search } = parsePagination(req.query as Record<string, string | undefined>);

  const where: WhereOptions = {
    entity: 'auth',
    action: { [Op.in]: ['login', 'login_failed'] },
    ...(search
      ? {
          [Op.and]: [
            {
              [Op.or]: [
                { action: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { meta: { [Op.like]: `%${search}%` } },
              ],
            },
          ],
        }
      : {}),
  };

  const { rows, count } = await ActivityLog.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  const userIds = Array.from(new Set(rows.map((row) => row.userId).filter((id): id is number => Boolean(id))));
  const users = userIds.length
    ? await User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: ['id', 'username', 'email'],
      })
    : [];
  const userMap = new Map(users.map((user) => [user.id, user]));

  const data = await Promise.all(
    rows.map(async (row) => {
      const meta = safeParseMeta(row.meta);
      const user = row.userId ? userMap.get(row.userId) : undefined;
      const ipAddress = normalizeIp(meta.ipAddress);
      const clientName = meta.clientName || (await resolveClientName(ipAddress)) || '-';

      return {
        id: row.id,
        username: user?.username || meta.username || '-',
        email: user?.email || '-',
        ipAddress: ipAddress || '-',
        clientName,
        status: row.action === 'login' ? 'Success' : 'Failed',
        userAgent: meta.userAgent || '-',
        createdAt: row.get('createdAt') as Date | string,
      };
    }),
  );

  res.json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total: count,
      totalPages: Math.max(1, Math.ceil(count / limit)),
    },
  });
};

export const getErrorLogs = async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, offset, search } = parsePagination(req.query as Record<string, string | undefined>);

  const where: WhereOptions = {
    [Op.or]: [
      { entity: 'error' },
      { action: { [Op.like]: '%error%' } },
      { action: { [Op.like]: '%exception%' } },
      { action: { [Op.like]: '%failed%' } },
    ],
    ...(search
      ? {
          [Op.and]: [
            {
              [Op.or]: [
                { entity: { [Op.like]: `%${search}%` } },
                { action: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { meta: { [Op.like]: `%${search}%` } },
              ],
            },
          ],
        }
      : {}),
  };

  const { rows, count } = await ActivityLog.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  const data = rows.map((row) => {
    const meta = safeParseMeta(row.meta);
    const action = String(row.action || '').toLowerCase();
    const level = action.includes('warn') ? 'WARN' : action.includes('info') ? 'INFO' : 'ERROR';

    return {
      id: row.id,
      level,
      message: row.description,
      method: meta.method || '-',
      path: meta.path || '-',
      statusCode: meta.statusCode || '-',
      createdAt: row.get('createdAt') as Date | string,
    };
  });

  res.json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total: count,
      totalPages: Math.max(1, Math.ceil(count / limit)),
    },
  });
};
