export type ActivityItem = {
  id: string;
  type: string;
  user: string;
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
    isCompleted: activity.isCompleted ?? (activity.status === 'completed'),
    completedAt: activity.completedAt ?? null,
    createdAt: activity.createdAt ?? now,
    nextActionDate: activity.nextActionDate,
    projectName: activity.projectName,
    dealCode: activity.dealCode,
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
    status: (formData.get('status') as ActivityItem['status']) ?? 'planned',
    isCompleted: formData.get('status') === 'completed',
    completedAt: formData.get('status') === 'completed' ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
    nextActionDate: String(formData.get('nextActionDate') ?? '').trim() || undefined,
  };

  const activities = [activity, ...getActivities()];
  saveActivities(activities);
  return activity;
}

export function markActivityCompleted(id: string) {
  const activities = getActivities();
  const currentActivity = activities.find((activity) => activity.id === id);
  if (!currentActivity) return null;

  const updatedActivity: ActivityItem = {
    ...currentActivity,
    status: 'completed',
    completedAt: new Date().toISOString(),
  };

  const updatedActivities = activities.map((activity) => activity.id === id ? updatedActivity : activity);
  saveActivities(updatedActivities);
  return updatedActivity;
}
