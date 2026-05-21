const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5296/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('crm-token') : null;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crm-token');
      localStorage.removeItem('crm-user');
      window.location.href = '/login';
    }
  }

  return response;
}

export const api = {
  get: (url: string) => apiFetch(url, { method: 'GET' }),
  post: (url: string, body: any) => apiFetch(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url: string, body: any) => apiFetch(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (url: string, body: any) => apiFetch(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url: string) => apiFetch(url, { method: 'DELETE' }),
};
