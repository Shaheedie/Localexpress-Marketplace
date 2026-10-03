const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const UPLOAD_BASE = import.meta.env.VITE_UPLOAD_BASE || 'http://localhost:5000';

export function getImageUrl(url) {
  if (!url) return 'https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=900&q=80';
  if (url.startsWith('http')) return url;
  return `${UPLOAD_BASE}${url}`;
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('localexpress_token');
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }
  return data;
}
