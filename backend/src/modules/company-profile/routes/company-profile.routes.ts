import { Router } from 'express';
import { asyncHandler } from '../../../common/utils';
import { authenticate, requirePermission } from '../../../common/middleware';
import {
  createCompanyProfileRouter,
  companyAssetUpload,
  getPublicCompanyProfile,
  uploadCompanyAsset,
} from '../controller/company-profile.controller';

const companyProfileRoutes = Router();

companyProfileRoutes.get('/public/company-profile', asyncHandler(getPublicCompanyProfile));
companyProfileRoutes.post(
  '/company-profiles/upload-asset',
  authenticate,
  requirePermission('settings.write'),
  companyAssetUpload.single('file'),
  asyncHandler(uploadCompanyAsset),
);
companyProfileRoutes.use('/company-profiles', createCompanyProfileRouter());

export default companyProfileRoutes;
