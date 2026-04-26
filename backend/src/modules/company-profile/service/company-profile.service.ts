import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { CompanyProfile, StorageSetting } from '../../../models';
import { env } from '../../../config/env';

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

export const companyAssetUpload = multer({ storage: companyAssetStorage });

export const companyProfileCrudConfig = {
  path: '/company-profiles',
  entityName: 'company profile',
  model: CompanyProfile,
  permissionBase: 'settings',
  searchFields: ['companyTitle'],
  transformCreate: async (payload: Record<string, unknown>) => ({
    ...payload,
    logoUrl: payload.logoUrl ? String(payload.logoUrl) : null,
    faviconUrl: payload.faviconUrl ? String(payload.faviconUrl) : null,
    bannerUrl: payload.bannerUrl ? String(payload.bannerUrl) : null,
    isActive: String(payload.isActive ?? true) === 'true' || payload.isActive === true,
    isDefault: String(payload.isDefault ?? false) === 'true' || payload.isDefault === true,
  }),
  transformUpdate: async (payload: Record<string, unknown>) => ({
    ...payload,
    ...(payload.logoUrl !== undefined ? { logoUrl: payload.logoUrl ? String(payload.logoUrl) : null } : {}),
    ...(payload.faviconUrl !== undefined ? { faviconUrl: payload.faviconUrl ? String(payload.faviconUrl) : null } : {}),
    ...(payload.bannerUrl !== undefined ? { bannerUrl: payload.bannerUrl ? String(payload.bannerUrl) : null } : {}),
    ...(payload.isActive !== undefined ? { isActive: String(payload.isActive) === 'true' || payload.isActive === true } : {}),
    ...(payload.isDefault !== undefined ? { isDefault: String(payload.isDefault) === 'true' || payload.isDefault === true } : {}),
  }),
};

export const getActiveCompanyProfile = async () =>
  CompanyProfile.findOne({
    where: { isActive: true },
    order: [['isDefault', 'DESC'], ['updatedAt', 'DESC']],
  });
