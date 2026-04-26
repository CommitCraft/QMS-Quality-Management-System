import { Response } from 'express';
import { createCrudModuleRouter } from '../../shared/crudModule';
import { AppError, AuthenticatedRequest } from '../../../common/middleware';
import {
  companyAssetUpload,
  companyProfileCrudConfig,
  getActiveCompanyProfile,
} from '../service/company-profile.service';
import {
  createCompanyProfileValidators,
  updateCompanyProfileValidators,
} from '../validation/company-profile.validation';

export const createCompanyProfileRouter = () =>
  createCrudModuleRouter({
    ...companyProfileCrudConfig,
    createValidators: createCompanyProfileValidators,
    updateValidators: updateCompanyProfileValidators,
  });

export { companyAssetUpload };

export const getPublicCompanyProfile = async (_req: AuthenticatedRequest, res: Response) => {
  const profile = await getActiveCompanyProfile();
  res.json({ success: true, data: profile });
};

export const uploadCompanyAsset = async (req: AuthenticatedRequest, res: Response) => {
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
};
