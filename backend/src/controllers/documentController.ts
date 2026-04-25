import fs from 'fs';
import path from 'path';
import { Response } from 'express';
import multer from 'multer';
import { Op } from 'sequelize';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { Document, DocumentVersion } from '../models';
import { env } from '../config/env';
import { logActivity } from '../utils/activity';

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const folder = (req.body.folderPath || 'General').toString().replace(/[^a-z0-9/_-]/gi, '_');
    const destination = path.join(process.cwd(), env.uploadDir, 'documents', folder);
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const upload = multer({ storage });

export const listTree = async (_req: AuthenticatedRequest, res: Response) => {
  const documents = await Document.findAll({ order: [['folderPath', 'ASC'], ['title', 'ASC']] });
  const tree = documents.reduce<Record<string, typeof documents>>((accumulator, document) => {
    const folder = document.folderPath || 'General';
    accumulator[folder] = accumulator[folder] || [];
    accumulator[folder].push(document);
    return accumulator;
  }, {});
  res.json({ success: true, data: tree });
};

export const createDocument = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('File upload is required', 400);
  }
  const payload = req.body as Record<string, string>;
  const folderPath = payload.folderPath || 'General';
  const document = await Document.create({
    title: payload.title,
    folderPath,
    fileName: req.file.filename,
    filePath: req.file.path,
    version: 1,
    currentVersion: 1,
    status: payload.status || 'Draft',
    ownerId: req.user?.id ?? null,
    expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : null,
  });

  await DocumentVersion.create({
    documentId: document.id,
    version: 1,
    fileName: req.file.filename,
    filePath: req.file.path,
    changeNote: payload.changeNote || 'Initial upload',
    uploadedBy: req.user?.id ?? null,
  });

  await logActivity({ userId: req.user?.id, entity: 'document', entityId: document.id, action: 'create', description: 'Uploaded document', meta: { title: document.title } });
  res.status(201).json({ success: true, data: document });
};

export const uploadVersion = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('File upload is required', 400);
  }
  const document = await Document.findByPk(Number(req.params.id));
  if (!document) {
    throw new AppError('Document not found', 404);
  }
  const nextVersion = document.currentVersion + 1;
  document.currentVersion = nextVersion;
  document.version = nextVersion;
  document.fileName = req.file.filename;
  document.filePath = req.file.path;
  if (req.body.status) {
    document.status = req.body.status;
  }
  await document.save();

  await DocumentVersion.create({
    documentId: document.id,
    version: nextVersion,
    fileName: req.file.filename,
    filePath: req.file.path,
    changeNote: req.body.changeNote || `Version ${nextVersion}`,
    uploadedBy: req.user?.id ?? null,
  });

  await logActivity({ userId: req.user?.id, entity: 'document', entityId: document.id, action: 'version', description: 'Uploaded document version', meta: { version: nextVersion } });
  res.json({ success: true, data: document });
};

export const preview = async (req: AuthenticatedRequest, res: Response) => {
  const document = await Document.findByPk(Number(req.params.id));
  if (!document) {
    throw new AppError('Document not found', 404);
  }
  res.json({ success: true, data: document });
};

export const download = async (req: AuthenticatedRequest, res: Response) => {
  const document = await Document.findByPk(Number(req.params.id));
  if (!document) {
    throw new AppError('Document not found', 404);
  }
  res.download(document.filePath, document.fileName);
};

export const searchDocuments = async (req: AuthenticatedRequest, res: Response) => {
  const search = (req.query.search as string) || '';
  const documents = await Document.findAll({
    where: search ? { title: { [Op.like]: `%${search}%` } } : undefined,
  });
  res.json({ success: true, data: documents });
};
