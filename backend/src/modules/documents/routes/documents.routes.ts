import { Router } from 'express';
import {
  createDocument,
  download,
  listTree,
  preview,
  upload,
  uploadVersion,
} from '../controller/documents.controller';
import { authenticate, requirePermission } from '../../../common/middleware';

const documentsRoutes = Router();

documentsRoutes.use(authenticate);
documentsRoutes.get('/tree', requirePermission('documents.read'), listTree);
documentsRoutes.get('/:id', requirePermission('documents.read'), preview);
documentsRoutes.get('/:id/download', requirePermission('documents.read'), download);
documentsRoutes.post('/', requirePermission('documents.write'), upload.single('file'), createDocument);
documentsRoutes.post('/:id/versions', requirePermission('documents.write'), upload.single('file'), uploadVersion);

export default documentsRoutes;
