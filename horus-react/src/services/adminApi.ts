import type { AdminItem, AdminUser } from '../types/admin';

const API_BASE = 'http://localhost:3000/api/admin';

const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export async function loginAdmin(payload: { email: string; password: string }) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return response.json();
}

export async function registerAdmin(payload: { nombre: string; email: string; password: string }) {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return response.json();
}

export async function getCurrentAdmin(token: string) {
  const response = await fetch(`${API_BASE}/me`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  return response.json() as Promise<{ ok: boolean; user?: AdminUser; mensaje?: string }>;
}

export async function getAdminItems(token: string) {
  const response = await fetch(`${API_BASE}/items`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  return response.json() as Promise<{ ok: boolean; items?: AdminItem[]; mensaje?: string }>;
}

export async function createAdminItem(token: string, payload: Partial<AdminItem>) {
  const response = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return response.json() as Promise<{ ok: boolean; item?: AdminItem; mensaje?: string }>;
}

export async function updateAdminItem(token: string, id: number, payload: Partial<AdminItem>) {
  const response = await fetch(`${API_BASE}/items/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return response.json() as Promise<{ ok: boolean; item?: AdminItem; mensaje?: string }>;
}

export async function deleteAdminItem(token: string, id: number) {
  const response = await fetch(`${API_BASE}/items/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  return response.json() as Promise<{ ok: boolean; mensaje?: string }>;
}
