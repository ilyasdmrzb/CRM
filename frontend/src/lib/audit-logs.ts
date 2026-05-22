import { api } from './api';

export type AuditLogItem = {
  id: string;
  tableName: string;
  recordId: string;
  actionType: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedByName: string;
  changedByEmail: string;
  changedAt: string;
};

export async function getAuditLogs(params: { userId?: string; actionType?: string; tableName?: string; take?: number } = {}) {
  const searchParams = new URLSearchParams();
  if (params.userId) searchParams.set('userId', params.userId);
  if (params.actionType) searchParams.set('actionType', params.actionType);
  if (params.tableName) searchParams.set('tableName', params.tableName);
  if (params.take) searchParams.set('take', String(params.take));

  const query = searchParams.toString();
  const response = await api.get(`/AuditLogs${query ? `?${query}` : ''}`);
  if (!response.ok) return [];

  return await response.json() as AuditLogItem[];
}
