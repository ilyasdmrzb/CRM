import { api } from './api';

export type AdminUser = {
  id: string;
  fullName: string;
  initials: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Sales';
  phone: string | null;
  isActive: boolean;
  createdAt: string;
};

const createInitials = (fullName: string) => {
  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toLocaleUpperCase('tr-TR');
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get('/auth/users');
  if (!response.ok) return [];
  
  const users = await response.json();
  return users.map((u: any) => ({
    ...u,
    initials: createInitials(u.fullName)
  }));
}

export async function addAdminUser(data: any) {
  const response = await api.post('/auth/users', data);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Kullanıcı oluşturulamadı');
  }
  return await response.json();
}

export async function setAdminUserStatus(id: string, isActive: boolean) {
  const response = await api.put(`/auth/users/${id}`, { isActive });
  return response.ok;
}

export async function deleteAdminUser(id: string) {
  // Using POST as a fallback for DELETE verb which might be blocked in some environments
  const response = await api.post(`/auth/users/${id}/delete`, {});
  if (!response.ok) {
    console.error(`Delete failed with status: ${response.status} ${response.statusText}`);
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Hata (${response.status}): Kullanıcı silinemedi`);
  }
  return true;
}

export async function updateAdminUser(id: string, data: any) {
  const response = await api.put(`/auth/users/${id}`, data);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Kullanıcı güncellenemedi');
  }
  return await response.json();
}
