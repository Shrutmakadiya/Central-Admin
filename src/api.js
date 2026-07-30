// Thin fetch wrapper that attaches the JWT and base URL.
const BASE = import.meta.env.VITE_API_BASE || '';

function token() {
  return localStorage.getItem('hm_token') || '';
}

async function request(method, path, body, isForm) {
  const headers = {};
  if (token()) headers.Authorization = `Bearer ${token()}`;
  let payload;
  if (isForm) {
    payload = body; // FormData
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  if (res.status === 401) {
    localStorage.removeItem('hm_token');
    localStorage.removeItem('hm_user');
    if (!location.pathname.startsWith('/login')) location.href = '/login';
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  del: (p) => request('DELETE', p),
  upload: (p, formData) => request('POST', p, formData, true),
};
