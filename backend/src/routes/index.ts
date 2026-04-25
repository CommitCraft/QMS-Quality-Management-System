import { Router } from 'express';
import { buildCrudRouter } from './crudRoutes';
import authRoutes from './authRoutes';
import dashboardRoutes from './dashboardRoutes';
import reportRoutes from './reportRoutes';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { User, Role, Permission, Department, Capa, Ncr, Audit, Document, RolePermission, SmtpSetting, StorageSetting, CompanyProfile } from '../models';
import { body } from 'express-validator';
import { hashPassword } from '../utils/password';
import { upload, createDocument, download, listTree, preview, uploadVersion } from '../controllers/documentController';
import { authenticate, requirePermission } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { Op } from 'sequelize';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';

const router = Router();

const companyAssetStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    void (async () => {
    try {
      const activeStorage = await StorageSetting.findOne({
        where: { isActive: true, isDefault: true },
        order: [['updatedAt', 'DESC']],
      });

      const configuredBasePath = String(activeStorage?.basePath || env.uploadDir).replace(/\\/g, '/');
      const normalizedBasePath = configuredBasePath.replace(/^\/+/, '').replace(/^uploads\/?/i, '');
      const baseUploadPath = path.join(process.cwd(), env.uploadDir, normalizedBasePath);

      const assetType = String(req.body.type || 'general').replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'general';
      const destination = path.join(baseUploadPath, 'company-assets', assetType);
      fs.mkdirSync(destination, { recursive: true });
      cb(null, destination);
    } catch (error) {
      cb(error as Error, '');
    }
    })();
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const companyAssetUpload = multer({ storage: companyAssetStorage });

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);

router.get(
  '/public/company-profile',
  asyncHandler(async (_req, res) => {
    const profile = await CompanyProfile.findOne({
      where: { isActive: true },
      order: [['isDefault', 'DESC'], ['updatedAt', 'DESC']],
    });

    res.json({ success: true, data: profile });
  }),
);

router.post(
  '/company-profiles/upload-asset',
  authenticate,
  requirePermission('settings.write'),
  companyAssetUpload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('Image file is required', 400);
    }

    const relativePath = req.file.path.replace(process.cwd(), '').replace(/\\/g, '/').replace(/^\/+/, '');
    const uploadsIndex = relativePath.toLowerCase().indexOf('uploads/');
    const publicPath = uploadsIndex >= 0 ? relativePath.slice(uploadsIndex) : relativePath;
    const url = `/${publicPath}`;

    res.status(201).json({
      success: true,
      data: {
        fileName: req.file.filename,
        path: req.file.path,
        url,
      },
    });
  }),
);

router.post(
  '/roles/with-permissions',
  authenticate,
  requirePermission('roles.write'),
  [body('name').notEmpty(), body('permissionIds').isArray()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { name, description, permissionIds } = req.body as {
      name: string;
      description?: string;
      permissionIds: number[];
    };

    const [role] = await Role.findOrCreate({
      where: { name: name.trim() },
      defaults: { name: name.trim(), description: description?.trim() || null },
    });

    if (description !== undefined) {
      role.description = description?.trim() || null;
      await role.save();
    }

    const uniquePermissionIds = [...new Set(permissionIds.map((id) => Number(id)).filter((id) => Number.isFinite(id)))];

    if (uniquePermissionIds.length) {
      const count = await Permission.count({ where: { id: { [Op.in]: uniquePermissionIds } } });
      if (count !== uniquePermissionIds.length) {
        throw new AppError('One or more permission IDs are invalid', 400);
      }
    }

    await RolePermission.destroy({ where: { roleId: role.id } });
    if (uniquePermissionIds.length) {
      await RolePermission.bulkCreate(uniquePermissionIds.map((permissionId) => ({ roleId: role.id, permissionId })));
    }

    const updatedRole = await Role.findByPk(role.id, {
      include: [{ association: 'permissions', attributes: ['id', 'module', 'action', 'name'] }],
    });

    res.status(201).json({ success: true, data: updatedRole, message: 'Role and permissions saved successfully' });
  }),
);

router.get(
  '/roles/:id/permissions',
  authenticate,
  requirePermission('roles.read'),
  asyncHandler(async (req, res) => {
    const roleId = Number(req.params.id);
    if (!Number.isFinite(roleId)) {
      throw new AppError('Invalid role id', 400);
    }

    const role = await Role.findByPk(roleId, {
      include: [{ association: 'permissions', attributes: ['id', 'module', 'action', 'name'] }],
    });

    if (!role) {
      throw new AppError('Role not found', 404);
    }

    const permissionIds = (role.permissions || []).map((permission) => permission.id);
    res.json({ success: true, data: { roleId: role.id, roleName: role.name, permissionIds } });
  }),
);

router.put(
  '/roles/:id/permissions',
  authenticate,
  requirePermission('roles.write'),
  [body('permissionIds').isArray()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const roleId = Number(req.params.id);
    if (!Number.isFinite(roleId)) {
      throw new AppError('Invalid role id', 400);
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    const { permissionIds } = req.body as { permissionIds: number[] };
    const uniquePermissionIds = [...new Set(permissionIds.map((id) => Number(id)).filter((id) => Number.isFinite(id)))];

    if (uniquePermissionIds.length) {
      const count = await Permission.count({ where: { id: { [Op.in]: uniquePermissionIds } } });
      if (count !== uniquePermissionIds.length) {
        throw new AppError('One or more permission IDs are invalid', 400);
      }
    }

    await RolePermission.destroy({ where: { roleId } });
    if (uniquePermissionIds.length) {
      await RolePermission.bulkCreate(uniquePermissionIds.map((permissionId) => ({ roleId, permissionId })));
    }

    res.json({ success: true, message: 'Role permissions updated successfully' });
  }),
);

router.use('/users', buildCrudRouter({
  path: '/users',
  entityName: 'user',
  model: User,
  permissionBase: 'users',
  searchFields: ['name', 'username', 'email', 'mobile'],
  createValidators: [body('name').notEmpty(), body('username').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 }), body('roleId').isInt()],
  updateValidators: [body('name').optional().notEmpty(), body('email').optional().isEmail(), body('password').optional().isLength({ min: 6 })],
  transformCreate: async (payload) => ({
    ...payload,
    password: await hashPassword(String(payload.password)),
  }),
  transformUpdate: async (payload) => {
    if (payload.password) {
      return { ...payload, password: await hashPassword(String(payload.password)) };
    }
    return payload;
  },
  include: [{ association: 'role' }, { association: 'department' }],
}));

router.use('/roles', buildCrudRouter({
  path: '/roles',
  entityName: 'role',
  model: Role,
  permissionBase: 'roles',
  searchFields: ['name', 'description'],
  createValidators: [body('name').notEmpty()],
  updateValidators: [body('name').optional().notEmpty()],
}));

router.use('/permissions', buildCrudRouter({
  path: '/permissions',
  entityName: 'permission',
  model: Permission,
  permissionBase: 'permissions',
  searchFields: ['module', 'action', 'name'],
  createValidators: [body('module').notEmpty(), body('action').notEmpty(), body('name').notEmpty()],
  updateValidators: [body('module').optional().notEmpty(), body('action').optional().notEmpty(), body('name').optional().notEmpty()],
}));

router.use('/departments', buildCrudRouter({
  path: '/departments',
  entityName: 'department',
  model: Department,
  permissionBase: 'departments',
  searchFields: ['name', 'code', 'manager'],
  createValidators: [body('name').notEmpty(), body('code').notEmpty()],
  updateValidators: [body('name').optional().notEmpty(), body('code').optional().notEmpty()],
}));

router.use('/capa', buildCrudRouter({
  path: '/capa',
  entityName: 'capa',
  model: Capa,
  permissionBase: 'capa',
  searchFields: ['title', 'issue', 'rootCause', 'status'],
  createValidators: [body('title').notEmpty(), body('issue').notEmpty()],
  updateValidators: [body('title').optional().notEmpty(), body('issue').optional().notEmpty()],
}));

router.use('/ncr', buildCrudRouter({
  path: '/ncr',
  entityName: 'ncr',
  model: Ncr,
  permissionBase: 'ncr',
  searchFields: ['title', 'product', 'lotNo', 'issue', 'severity', 'status'],
  createValidators: [body('title').notEmpty(), body('product').notEmpty(), body('lotNo').notEmpty(), body('issue').notEmpty()],
  updateValidators: [body('title').optional().notEmpty(), body('product').optional().notEmpty(), body('lotNo').optional().notEmpty()],
}));

router.use('/audits', buildCrudRouter({
  path: '/audits',
  entityName: 'audit',
  model: Audit,
  permissionBase: 'audits',
  searchFields: ['title', 'status'],
  createValidators: [body('title').notEmpty()],
  updateValidators: [body('title').optional().notEmpty()],
}));

router.use('/smtp-settings', buildCrudRouter({
  path: '/smtp-settings',
  entityName: 'smtp setting',
  model: SmtpSetting,
  permissionBase: 'settings',
  searchFields: ['name', 'host', 'username', 'fromEmail', 'fromName'],
  createValidators: [
    body('name').notEmpty(),
    body('host').notEmpty(),
    body('port').isInt({ min: 1, max: 65535 }),
    body('username').notEmpty(),
    body('password').notEmpty(),
    body('fromEmail').isEmail(),
    body('secure').optional().isBoolean(),
    body('isActive').optional().isBoolean(),
  ],
  updateValidators: [
    body('name').optional().notEmpty(),
    body('host').optional().notEmpty(),
    body('port').optional().isInt({ min: 1, max: 65535 }),
    body('username').optional().notEmpty(),
    body('password').optional().notEmpty(),
    body('fromEmail').optional().isEmail(),
    body('secure').optional().isBoolean(),
    body('isActive').optional().isBoolean(),
  ],
  transformCreate: async (payload) => ({
    ...payload,
    port: Number(payload.port),
    secure: String(payload.secure) === 'true' || payload.secure === true,
    isActive: String(payload.isActive ?? true) === 'true' || payload.isActive === true,
  }),
  transformUpdate: async (payload) => ({
    ...payload,
    ...(payload.port !== undefined ? { port: Number(payload.port) } : {}),
    ...(payload.secure !== undefined ? { secure: String(payload.secure) === 'true' || payload.secure === true } : {}),
    ...(payload.isActive !== undefined ? { isActive: String(payload.isActive) === 'true' || payload.isActive === true } : {}),
  }),
}));

router.use('/storage-settings', buildCrudRouter({
  path: '/storage-settings',
  entityName: 'storage setting',
  model: StorageSetting,
  permissionBase: 'settings',
  searchFields: ['name', 'provider', 'basePath', 'bucketName', 'region', 'endpoint'],
  createValidators: [
    body('name').notEmpty(),
    body('provider').notEmpty(),
    body('basePath').optional().isString(),
    body('bucketName').optional().isString(),
    body('region').optional().isString(),
    body('endpoint').optional().isString(),
    body('accessKey').optional().isString(),
    body('secretKey').optional().isString(),
    body('isActive').optional().isBoolean(),
    body('isDefault').optional().isBoolean(),
  ],
  updateValidators: [
    body('name').optional().notEmpty(),
    body('provider').optional().notEmpty(),
    body('basePath').optional().isString(),
    body('bucketName').optional().isString(),
    body('region').optional().isString(),
    body('endpoint').optional().isString(),
    body('accessKey').optional().isString(),
    body('secretKey').optional().isString(),
    body('isActive').optional().isBoolean(),
    body('isDefault').optional().isBoolean(),
  ],
  transformCreate: async (payload) => {
    const provider = String(payload.provider || 'local').toLowerCase();
    const isLocal = provider === 'local';
    return {
      ...payload,
      provider,
      basePath: isLocal ? String(payload.basePath || '/uploads') : payload.basePath ? String(payload.basePath) : null,
      bucketName: isLocal ? null : (payload.bucketName ? String(payload.bucketName) : null),
      region: isLocal ? null : (payload.region ? String(payload.region) : null),
      endpoint: isLocal ? null : (payload.endpoint ? String(payload.endpoint) : null),
      accessKey: isLocal ? null : (payload.accessKey ? String(payload.accessKey) : null),
      secretKey: isLocal ? null : (payload.secretKey ? String(payload.secretKey) : null),
      isActive: String(payload.isActive ?? true) === 'true' || payload.isActive === true,
      isDefault: String(payload.isDefault ?? false) === 'true' || payload.isDefault === true,
    };
  },
  transformUpdate: async (payload) => {
    const provider = payload.provider !== undefined ? String(payload.provider).toLowerCase() : undefined;
    const isLocal = provider === 'local';
    return {
      ...payload,
      ...(provider !== undefined ? { provider } : {}),
      ...(isLocal ? { bucketName: null, region: null, endpoint: null, accessKey: null, secretKey: null } : {}),
      ...(payload.basePath !== undefined ? { basePath: payload.basePath ? String(payload.basePath) : null } : {}),
      ...(payload.bucketName !== undefined ? { bucketName: payload.bucketName ? String(payload.bucketName) : null } : {}),
      ...(payload.region !== undefined ? { region: payload.region ? String(payload.region) : null } : {}),
      ...(payload.endpoint !== undefined ? { endpoint: payload.endpoint ? String(payload.endpoint) : null } : {}),
      ...(payload.accessKey !== undefined ? { accessKey: payload.accessKey ? String(payload.accessKey) : null } : {}),
      ...(payload.secretKey !== undefined ? { secretKey: payload.secretKey ? String(payload.secretKey) : null } : {}),
      ...(payload.isActive !== undefined ? { isActive: String(payload.isActive) === 'true' || payload.isActive === true } : {}),
      ...(payload.isDefault !== undefined ? { isDefault: String(payload.isDefault) === 'true' || payload.isDefault === true } : {}),
    };
  },
}));

router.use('/company-profiles', buildCrudRouter({
  path: '/company-profiles',
  entityName: 'company profile',
  model: CompanyProfile,
  permissionBase: 'settings',
  searchFields: ['companyTitle'],
  createValidators: [
    body('companyTitle').notEmpty(),
    body('logoUrl').optional().isString(),
    body('faviconUrl').optional().isString(),
    body('bannerUrl').optional().isString(),
    body('isActive').optional().isBoolean(),
    body('isDefault').optional().isBoolean(),
  ],
  updateValidators: [
    body('companyTitle').optional().notEmpty(),
    body('logoUrl').optional().isString(),
    body('faviconUrl').optional().isString(),
    body('bannerUrl').optional().isString(),
    body('isActive').optional().isBoolean(),
    body('isDefault').optional().isBoolean(),
  ],
  transformCreate: async (payload) => ({
    ...payload,
    logoUrl: payload.logoUrl ? String(payload.logoUrl) : null,
    faviconUrl: payload.faviconUrl ? String(payload.faviconUrl) : null,
    bannerUrl: payload.bannerUrl ? String(payload.bannerUrl) : null,
    isActive: String(payload.isActive ?? true) === 'true' || payload.isActive === true,
    isDefault: String(payload.isDefault ?? false) === 'true' || payload.isDefault === true,
  }),
  transformUpdate: async (payload) => ({
    ...payload,
    ...(payload.logoUrl !== undefined ? { logoUrl: payload.logoUrl ? String(payload.logoUrl) : null } : {}),
    ...(payload.faviconUrl !== undefined ? { faviconUrl: payload.faviconUrl ? String(payload.faviconUrl) : null } : {}),
    ...(payload.bannerUrl !== undefined ? { bannerUrl: payload.bannerUrl ? String(payload.bannerUrl) : null } : {}),
    ...(payload.isActive !== undefined ? { isActive: String(payload.isActive) === 'true' || payload.isActive === true } : {}),
    ...(payload.isDefault !== undefined ? { isDefault: String(payload.isDefault) === 'true' || payload.isDefault === true } : {}),
  }),
}));

router.use('/documents', authenticate);
router.get('/documents/tree', requirePermission('documents.read'), listTree);
router.get('/documents/:id', requirePermission('documents.read'), preview);
router.get('/documents/:id/download', requirePermission('documents.read'), download);
router.post('/documents', requirePermission('documents.write'), upload.single('file'), createDocument);
router.post('/documents/:id/versions', requirePermission('documents.write'), upload.single('file'), uploadVersion);

export default router;
