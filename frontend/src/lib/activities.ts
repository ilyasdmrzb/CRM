export type ActivityItem = {
  id: string;
  type: string;
  user: string;
  company: string;
  subject: string;
  time: string;
  date: string;
  status: 'completed' | 'pending';
  createdAt: string;
};

const STORAGE_KEY = 'solar-crm-activities';

export const defaultActivities: ActivityItem[] = [];

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeStatus = (value: FormDataEntryValue | null): ActivityItem['status'] => {
  return value === 'pending' ? 'pending' : 'completed';
};

const normalizeActivity = (activity: Partial<ActivityItem>): ActivityItem => {
  const now = new Date().toISOString();

  return {
    id: activity.id ?? createId(),
    type: activity.type ?? 'Arama',
    user: activity.user ?? 'Sistem Yöneticisi',
    company: activity.company ?? '',
    subject: activity.subject ?? '',
    time: activity.time ?? '',
    date: activity.date ?? '',
    status: activity.status ?? 'completed',
    createdAt: activity.createdAt ?? now,
  };
};

const readStoredActivities = () => {
  if (typeof window === 'undefined') return defaultActivities;

  const rawActivities = window.localStorage.getItem(STORAGE_KEY);
  if (!rawActivities) return defaultActivities;

  try {
    const activities = JSON.parse(rawActivities) as Partial<ActivityItem>[];
    return activities.map(normalizeActivity);
  } catch {
    return defaultActivities;
  }
};

const saveActivities = (activities: ActivityItem[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
};

export function getActivities() {
  return readStoredActivities().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function addActivity(formData: FormData) {
  const activity: ActivityItem = {
    id: createId(),
    type: String(formData.get('type') ?? 'Arama'),
    user: String(formData.get('user') ?? 'Sistem Yöneticisi').trim(),
    company: String(formData.get('company') ?? '').trim(),
    subject: String(formData.get('subject') ?? '').trim(),
    time: String(formData.get('time') ?? '').trim(),
    date: String(formData.get('date') ?? '').trim(),
    status: normalizeStatus(formData.get('status')),
    createdAt: new Date().toISOString(),
  };

  const activities = [activity, ...getActivities()];
  saveActivities(activities);
  return activity;
}
