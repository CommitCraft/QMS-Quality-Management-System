import { Response } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { AuthenticatedRequest } from '../middleware/auth';
import { Audit, Capa, Department, Document, Ncr, User } from '../models';

export const exportReport = async (req: AuthenticatedRequest, res: Response) => {
  const format = String(req.query.format || 'excel').toLowerCase();
  const type = String(req.query.type || 'summary').toLowerCase();

  const payload = {
    users: await User.count(),
    departments: await Department.count(),
    documents: await Document.count(),
    capa: await Capa.count(),
    ncr: await Ncr.count(),
    audits: await Audit.count(),
  };

  if (format === 'pdf') {
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=qms-${type}.pdf`);
    doc.pipe(res);
    doc.fontSize(20).text('QMS Report', { underline: true });
    doc.moveDown();
    Object.entries(payload).forEach(([label, value]) => {
      doc.fontSize(12).text(`${label.toUpperCase()}: ${value}`);
    });
    doc.end();
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Report');
  sheet.columns = [
    { header: 'Metric', key: 'metric', width: 24 },
    { header: 'Value', key: 'value', width: 16 },
  ];
  Object.entries(payload).forEach(([metric, value]) => sheet.addRow({ metric, value }));

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=qms-${type}.xlsx`);
  const buffer = await workbook.xlsx.writeBuffer();
  res.send(buffer);
};
