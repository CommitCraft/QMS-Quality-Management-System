import { Router } from 'express';
import { body } from 'express-validator';
import { Op, WhereOptions } from 'sequelize';
import { AppError, authenticate, requirePermission, validateRequest, AuthenticatedRequest } from '../../common/middleware';
import { asyncHandler, logActivity, parsePagination } from '../../common/utils';

interface CrudRouteOptions {
	path: string;
	entityName: string;
	model: any;
	permissionBase: string;
	searchFields: string[];
	transformCreate?: (payload: Record<string, unknown>, req: AuthenticatedRequest) => Promise<Record<string, unknown>> | Record<string, unknown>;
	transformUpdate?: (payload: Record<string, unknown>, req: AuthenticatedRequest) => Promise<Record<string, unknown>> | Record<string, unknown>;
	createValidators?: Array<ReturnType<typeof body>>;
	updateValidators?: Array<ReturnType<typeof body>>;
	include?: unknown[];
}

const buildSearchWhere = (fields: string[], search: string, status?: string): WhereOptions => {
	const where: Record<PropertyKey, unknown> = {};
	if (search) {
		where[Op.or] = fields.map((field) => ({ [field]: { [Op.like]: `%${search}%` } }));
	}
	if (status) {
		where.status = status;
	}
	return where as WhereOptions;
};

const createCrudController = (options: CrudRouteOptions) => {
	const list = async (req: AuthenticatedRequest, res: any) => {
		const { page, limit, offset, search, status } = parsePagination(req.query as { page?: string; limit?: string; search?: string; status?: string });
		const where = buildSearchWhere(options.searchFields, search, status);
		const result = await options.model.findAndCountAll({
			where,
			limit,
			offset,
			order: [['createdAt', 'DESC']],
			include: options.include,
		});

		res.json({
			success: true,
			data: result.rows,
			meta: {
				page,
				limit,
				total: result.count,
				totalPages: Math.ceil(result.count / limit),
			},
		});
	};

	const getOne = async (req: AuthenticatedRequest, res: any) => {
		const id = Number(req.params.id);
		if (!Number.isInteger(id) || id <= 0) {
			throw new AppError(`Invalid ${options.entityName} ID`, 400);
		}
		const item = await options.model.findByPk(id);
		if (!item) {
			throw new AppError(`${options.entityName} not found`, 404);
		}
		res.json({ success: true, data: item });
	};

	const create = async (req: AuthenticatedRequest, res: any) => {
		const payload = options.transformCreate ? await options.transformCreate(req.body as Record<string, unknown>, req) : (req.body as Record<string, unknown>);
		const item = await options.model.create(payload as Record<string, unknown>);
		await logActivity({
			userId: req.user?.id,
			entity: options.entityName,
			entityId: item.id,
			action: 'create',
			description: `Created ${options.entityName}`,
			meta: payload,
		});
		res.status(201).json({ success: true, data: item });
	};

	const update = async (req: AuthenticatedRequest, res: any) => {
		const id = Number(req.params.id);
		if (!Number.isInteger(id) || id <= 0) {
			throw new AppError(`Invalid ${options.entityName} ID`, 400);
		}
		const payload = options.transformUpdate ? await options.transformUpdate(req.body as Record<string, unknown>, req) : (req.body as Record<string, unknown>);
		const [updated] = await options.model.update(payload as Record<string, unknown>, { where: { id } });
		if (!updated) {
			throw new AppError(`${options.entityName} not found`, 404);
		}
		const item = await options.model.findByPk(id);
		await logActivity({
			userId: req.user?.id,
			entity: options.entityName,
			entityId: id,
			action: 'update',
			description: `Updated ${options.entityName}`,
			meta: payload,
		});
		res.json({ success: true, data: item });
	};

	const remove = async (req: AuthenticatedRequest, res: any) => {
		const id = Number(req.params.id);
		if (!Number.isInteger(id) || id <= 0) {
			throw new AppError(`Invalid ${options.entityName} ID`, 400);
		}
		const deleted = await options.model.destroy({ where: { id } });
		if (!deleted) {
			throw new AppError(`${options.entityName} not found`, 404);
		}
		await logActivity({
			userId: req.user?.id,
			entity: options.entityName,
			entityId: id,
			action: 'delete',
			description: `Deleted ${options.entityName}`,
		});
		res.json({ success: true, message: `${options.entityName} deleted` });
	};

	return { list, getOne, create, update, remove };
};

export type CrudModuleOptions = CrudRouteOptions;

export const buildCrudRouter = (options: CrudRouteOptions) => {
	const router = Router();
	const controller = createCrudController(options);

	router.use(authenticate);
	router.get('/', requirePermission(`${options.permissionBase}.read`), asyncHandler(controller.list));
	router.get('/:id', requirePermission(`${options.permissionBase}.read`), asyncHandler(controller.getOne));
	router.post('/', options.createValidators || [], validateRequest, requirePermission(`${options.permissionBase}.write`), asyncHandler(controller.create));
	router.put('/:id', options.updateValidators || [], validateRequest, requirePermission(`${options.permissionBase}.write`), asyncHandler(controller.update));
	router.delete('/:id', requirePermission(`${options.permissionBase}.delete`), asyncHandler(controller.remove));
	return router;
};

export const createCrudModuleRouter = (options: CrudModuleOptions) => buildCrudRouter(options);
