import { api } from './api';

export type ActivityItem = {
  id: string;
  type: string;
  user: string;
  customerId?: string;
  company: string;
  subject: string;
  time: string;
  date: string;
  status: 'planned' | 'completed' | 'cancelled';
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  nextActionDate?: string;
  projectName?: string;
  dealCode?: string;
};

type ApiActivity = {
  id: string;
  customerId: string;
  customerName: string;
  dealId: string | null;
  dealCode: string | null;
  projectName: string | null;
  userName: string;
  activityType: string;
  subject: string;
  description: string | null;
  activityDate: string;
  nextActionDate: string | null;
  isCompleted: boolean;
  status: ActivityItem['status'] | 'pending' | string;
  completedAt: string | null;
  createdAt: string;
};

const normalizeStatus = (value: ApiActivity['status'] | FormDataEntryValue | null): ActivityItem['status'] => {
  if (value === 'completed' || value === 'cancelled') return value;
  return 'planned';
};

const splitDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: '', time: '' };

  // Yerel saat dilimine göre yıl-ay-gün formatı (YYYY-MM-DD)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;

  return {
    date: dateStr,
    time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
};

const getActivityDateTimeValue = (formData: FormData) => {
  const date = String(formData.get('date') ?? '').trim();
  const time = String(formData.get('time') ?? '').trim() || '00:00';
  // ISO formatında (Z olmadan) gönderiyoruz ki backend yerel saat olarak algılasın
  return `${date}T${time}`;
};

const mapApiActivity = (activity: ApiActivity): ActivityItem => {
  const activityDate = splitDateTime(activity.activityDate);

  return {
    id: activity.id,
    type: activity.activityType || 'Arama',
    user: activity.userName || 'Sistem Yöneticisi',
    customerId: activity.customerId,
    company: activity.customerName,
    subject: activity.subject,
    time: activityDate.time,
    date: activityDate.date,
    status: normalizeStatus(activity.status),
    isCompleted: activity.isCompleted,
    completedAt: activity.completedAt,
    createdAt: activity.createdAt,
    nextActionDate: activity.nextActionDate ?? undefined,
    projectName: activity.projectName ?? undefined,
    dealCode: activity.dealCode ?? undefined,
  };
};

export async function getActivitiesFromDb() {
  const response = await api.get('/Activities');
  if (!response.ok) throw new Error('Aktiviteler veritabanından alınamadı.');

  const activities = await response.json() as ApiActivity[];
  return activities.map(mapApiActivity);
}

export async function addActivityToDb(formData: FormData) {
  const status = normalizeStatus(formData.get('status'));
  const activityDate = getActivityDateTimeValue(formData);
  const response = await api.post('/Activities', {
    customerId: String(formData.get('customerId') ?? ''),
    activityType: String(formData.get('type') ?? 'Arama'),
    subject: String(formData.get('subject') ?? '').trim(),
    description: null,
    activityDate,
    nextActionDate: status === 'planned' ? activityDate : null,
    isCompleted: status === 'completed',
    status,
  });

  if (!response.ok) throw new Error('Aktivite veritabanına kaydedilemedi.');
  return mapApiActivity(await response.json() as ApiActivity);
}

export async function markActivityCompletedInDb(id: string) {
  const response = await api.post(`/Activities/${id}/complete`, {});
  if (!response.ok) throw new Error('Aktivite tamamlandı olarak işaretlenemedi.');
  return mapApiActivity(await response.json() as ApiActivity);
}

export async function deleteActivityFromDb(id: string) {
  const response = await api.delete(`/Activities/${id}`);
  if (!response.ok) throw new Error('Aktivite silinemedi.');
  return true;
}

