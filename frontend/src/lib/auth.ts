import { defaultAdminUsers, getAdminUsers, type AdminUser } from './admin-users';

const CURRENT_USER_KEY = 'solar-crm-current-user';

export function getCurrentUser(): AdminUser {
  if (typeof window === 'undefined') return defaultAdminUsers[0];

  const rawUser = window.localStorage.getItem(CURRENT_USER_KEY);
  if (!rawUser) return defaultAdminUsers[0];

  try {
    const user = JSON.parse(rawUser) as AdminUser;
    return user;
  } catch {
    return defaultAdminUsers[0];
  }
}

export function isCurrentUserAdmin() {
  return getCurrentUser().role === 'Admin';
}

export function setCurrentUserByEmail(email: string) {
  if (typeof window === 'undefined') return defaultAdminUsers[0];

  const normalizedEmail = email.trim().toLocaleLowerCase('tr-TR');
  const user = getAdminUsers().find((item) => item.email.toLocaleLowerCase('tr-TR') === normalizedEmail) ?? defaultAdminUsers[0];
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}
