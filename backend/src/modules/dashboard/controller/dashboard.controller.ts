import { Response } from 'express';
import { col, fn, literal, Op } from 'sequelize';
import { AuthenticatedRequest } from '../../../common/middleware';
import { Audit, Capa, Department, Document, Ncr, User } from '../../../models';

export const getSummary = async (_req: AuthenticatedRequest, res: Response) => {
	const [totalUsers, departments, pendingApprovals, totalDocuments, openCapa, openNcr] = await Promise.all([
		User.count(),
		Department.count(),
		Document.count({ where: { status: { [Op.in]: ['Draft', 'In Review'] } } }),
		Document.count(),
		Capa.count({ where: { status: { [Op.ne]: 'Closed' } } }),
		Ncr.count({ where: { status: { [Op.ne]: 'Closed' } } }),
	]);

	res.json({
		success: true,
		data: {
			totalUsers,
			departments,
			pendingApprovals,
			totalDocuments,
			openCapa,
			openNcr,
		},
	});
};

export const getCharts = async (_req: AuthenticatedRequest, res: Response) => {
	const monthlyCapa = await Capa.findAll({
		attributes: [[fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'], [fn('COUNT', col('id')), 'count']],
		group: ['month'],
		order: [[literal('month'), 'ASC']],
		raw: true,
	});

	const departmentIssues = await Department.findAll({
		attributes: [
			'name',
			[fn('COUNT', literal('DISTINCT users.id')), 'users'],
		],
		include: [{ association: 'users', attributes: [] }],
		group: ['DepartmentModel.id', 'DepartmentModel.name'],
		raw: true,
	});

	const documentStatus = await Document.findAll({
		attributes: ['status', [fn('COUNT', literal('*')), 'count']],
		group: ['status'],
		raw: true,
	});

	const auditScores = await Audit.findAll({
		attributes: ['title', 'score', 'status'],
		order: [['createdAt', 'DESC']],
		limit: 6,
		raw: true,
	});

	res.json({
		success: true,
		data: {
			monthlyCapa,
			departmentIssues,
			documentStatus,
			auditScores,
		},
	});
};
