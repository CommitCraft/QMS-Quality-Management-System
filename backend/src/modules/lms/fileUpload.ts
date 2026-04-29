import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { env } from '../../config/env';

const allowedExtensions = new Set(['.mp4', '.webm', '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp', '.zip']);

const sanitizeName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');

const createStorage = (subFolder: string) => multer.diskStorage({
  destination: (_req, _file, cb) => {
    const destination = path.join(process.cwd(), env.uploadDir, subFolder);
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${sanitizeName(file.originalname)}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.has(ext)) {
    cb(new Error('File type not allowed'));
    return;
  }
  cb(null, true);
};

const maxSize = Number(process.env.LMS_MAX_UPLOAD_MB || '50') * 1024 * 1024;

export const courseContentUpload = multer({ storage: createStorage('course-content'), fileFilter, limits: { fileSize: maxSize } });
export const assignmentAttachmentUpload = multer({ storage: createStorage('assignment-attachments'), fileFilter, limits: { fileSize: maxSize } });
export const assignmentSubmissionUpload = multer({ storage: createStorage('assignment-submissions'), fileFilter, limits: { fileSize: maxSize } });

export const toPublicUploadUrl = (filePath: string) => {
  const baseUrl = (env.uploadBaseUrl || '').replace(/\/$/, '');
  const relative = filePath.replace(process.cwd(), '').replace(/\\/g, '/').replace(/^\/+/, '');
  return baseUrl ? `${baseUrl}/${relative}` : `/${relative}`;
};

export const detectContentType = (source?: string | null, mimeType?: string | null) => {
  const value = `${source || ''} ${mimeType || ''}`.toLowerCase();
  if (/youtube\.com|youtu\.be|vimeo\.com/.test(value)) {
    return 'video';
  }
  if (/pdf/.test(value)) {
    return 'pdf';
  }
  if (/(docx?|word)/.test(value)) {
    return 'doc';
  }
  if (/(pptx?|powerpoint)/.test(value)) {
    return 'ppt';
  }
  if (/image|jpg|jpeg|png|webp/.test(value)) {
    return 'image';
  }
  if (/mp4|webm|video/.test(value)) {
    return 'video';
  }
  if (/http/.test(value)) {
    return 'link';
  }
  return 'other';
};
