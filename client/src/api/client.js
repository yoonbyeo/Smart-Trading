// VITE_API_URL: Render 백엔드 URL (예: https://smart-trading.onrender.com/api)
// 비워두면 동일 서버 /api 로 요청 (로컬 및 단일 서버 배포 시)
const API = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const auth = {
  register: (email, password, name) => api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name })
  }),
  login: (email, password) => api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  me: () => api('/auth/me')
};

export const stock = {
  get: (symbol) => api(`/stock/${encodeURIComponent(symbol)}`),
  chart: (symbol, period = '1mo') => api(`/stock/${encodeURIComponent(symbol)}/chart?period=${period}`),
  technical: (symbol) => api(`/stock/${encodeURIComponent(symbol)}/technical`)
};

export const analysis = {
  daily: (strategy) => api(strategy ? `/daily-analysis?strategy=${strategy}` : '/daily-analysis'),
  search: (q) => api(`/search?q=${encodeURIComponent(q)}`),
  marketRegime: () => api('/market-regime')
};

export const portfolio = {
  get: () => api('/portfolio'),
  add: (symbol, quantity, avg_cost, purchased_at) => api('/portfolio', {
    method: 'POST',
    body: JSON.stringify({ symbol, quantity, avg_cost, purchased_at })
  }),
  update: (id, data) => api(`/portfolio/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  remove: (id) => api(`/portfolio/${id}`, { method: 'DELETE' })
};
