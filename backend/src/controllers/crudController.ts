import { Request, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logActivity } from '../utils/activity';
import { parsePagination } from '../utils/pagination';

interface CrudOptions<T extends { id: number }> {
  model: {
    findAndCountAll: (options: unknown) => Promise<{ rows: T[]; count: number }>;
    findByPk: (id: number) => Promise<T | null>;
    create: (values: Partial<T>) => Promise<T>;
    update: (values: Partial<T>, options: { where: { id: number } }) => Promise<[number]>;
    destroy: (options: { where: { id: number } }) => Promise<number>;
  };
  entityName: string;
  searchFields: string[];
  permissionBase: string;
  include?: unknown[];
  transformCreate?: (payload: Record<string, unknown>, req: AuthenticatedRequest) => Promise<Record<string, unknown>> | Record<string, unknown>;
  transformUpdate?: (payload: Record<string, unknown>, req: AuthenticatedRequest) => Promise<Record<string, unknown>> | Record<string, unknown>;
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

export const createCrudController = <T extends { id: number }>(options: CrudOptions<T>) => {
  const list = async (req: AuthenticatedRequest, res: Response) => {
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

  const getOne = async (req: AuthenticatedRequest, res: Response) => {
    const item = await options.model.findByPk(Number(req.params.id));
    if (!item) {
      throw new AppError(`${options.entityName} not found`, 404);
    }
    res.json({ success: true, data: item });
  };

  const create = async (req: AuthenticatedRequest, res: Response) => {
    const payload = options.transformCreate ? await options.transformCreate(req.body as Record<string, unknown>, req) : (req.body as Record<string, unknown>);
    const item = await options.model.create(payload as Partial<T>);
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

  const update = async (req: AuthenticatedRequest, res: Response) => {
    const payload = options.transformUpdate ? await options.transformUpdate(req.body as Record<string, unknown>, req) : (req.body as Record<string, unknown>);
    const [updated] = await options.model.update(payload as Partial<T>, { where: { id: Number(req.params.id) } });
    if (!updated) {
      throw new AppError(`${options.entityName} not found`, 404);
    }
    const item = await options.model.findByPk(Number(req.params.id));
    await logActivity({
      userId: req.user?.id,
      entity: options.entityName,
      entityId: Number(req.params.id),
      action: 'update',
      description: `Updated ${options.entityName}`,
      meta: payload,
    });
    res.json({ success: true, data: item });
  };

  const remove = async (req: AuthenticatedRequest, res: Response) => {
    const deleted = await options.model.destroy({ where: { id: Number(req.params.id) } });
    if (!deleted) {
      throw new AppError(`${options.entityName} not found`, 404);
    }
    await logActivity({
      userId: req.user?.id,
      entity: options.entityName,
      entityId: Number(req.params.id),
      action: 'delete',
      description: `Deleted ${options.entityName}`,
    });
    res.json({ success: true, message: `${options.entityName} deleted` });
  };

  return { list, getOne, create, update, remove };
};
