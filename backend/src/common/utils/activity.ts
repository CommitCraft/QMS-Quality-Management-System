import { ActivityLog } from '../../models';

export const logActivity = async (input: {
  userId?: number | null;
  entity: string;
  entityId?: number | null;
  action: string;
  description: string;
  meta?: Record<string, unknown>;
}) => {
  await ActivityLog.create({
    userId: input.userId ?? null,
    entity: input.entity,
    entityId: input.entityId ?? null,
    action: input.action,
    description: input.description,
    meta: input.meta ? JSON.stringify(input.meta) : null,
  });
};