import { SmtpSetting, StorageSetting } from '../../../models';

export const smtpCrudConfig = {
  path: '/smtp-settings',
  entityName: 'smtp setting',
  model: SmtpSetting,
  permissionBase: 'settings',
  searchFields: ['name', 'host', 'username', 'fromEmail', 'fromName'],
  transformCreate: async (payload: Record<string, unknown>) => ({
    ...payload,
    port: Number(payload.port),
    secure: String(payload.secure) === 'true' || payload.secure === true,
    isActive: String(payload.isActive ?? true) === 'true' || payload.isActive === true,
  }),
  transformUpdate: async (payload: Record<string, unknown>) => ({
    ...payload,
    ...(payload.port !== undefined ? { port: Number(payload.port) } : {}),
    ...(payload.secure !== undefined ? { secure: String(payload.secure) === 'true' || payload.secure === true } : {}),
    ...(payload.isActive !== undefined ? { isActive: String(payload.isActive) === 'true' || payload.isActive === true } : {}),
  }),
};

export const storageCrudConfig = {
  path: '/storage-settings',
  entityName: 'storage setting',
  model: StorageSetting,
  permissionBase: 'settings',
  searchFields: ['name', 'provider', 'basePath', 'bucketName', 'region', 'endpoint'],
  transformCreate: async (payload: Record<string, unknown>) => {
    const provider = String(payload.provider || 'local').toLowerCase();
    const isLocal = provider === 'local';
    return {
      ...payload,
      provider,
      basePath: isLocal ? String(payload.basePath || '/uploads') : payload.basePath ? String(payload.basePath) : null,
      bucketName: isLocal ? null : payload.bucketName ? String(payload.bucketName) : null,
      region: isLocal ? null : payload.region ? String(payload.region) : null,
      endpoint: isLocal ? null : payload.endpoint ? String(payload.endpoint) : null,
      accessKey: isLocal ? null : payload.accessKey ? String(payload.accessKey) : null,
      secretKey: isLocal ? null : payload.secretKey ? String(payload.secretKey) : null,
      isActive: String(payload.isActive ?? true) === 'true' || payload.isActive === true,
      isDefault: String(payload.isDefault ?? false) === 'true' || payload.isDefault === true,
    };
  },
  transformUpdate: async (payload: Record<string, unknown>) => {
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
};
