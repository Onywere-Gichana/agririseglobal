const API_BASE = import.meta.env.VITE_API_URL || '';

export const assetUrl = (path) => `${API_BASE}${path}`;

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  
  // Set Content-Type for POST/PUT requests with body
  if ((options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  try {
    const fetchOptions = {
      method: options.method || 'GET',
      headers,
      ...(options.body && { body: options.body }),
    };
    
    const res = await fetch(url, fetchOptions);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = { 
        status: res.status, 
        error: data.error || data.message || `Server error (${res.status})`,
        ...data 
      };
      console.error('API Error:', error);
      throw error;
    }
    return data;
  } catch (err) {
    // Network error or JSON parse error
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      console.error('Network error:', err);
      throw { error: 'Cannot connect to server. Make sure the backend is running on port 5000.' };
    }
    throw err;
  }
}

export const authApi = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  createUser: (body) => request('/api/auth/users', { method: 'POST', body: JSON.stringify(body) }),
  listUsers: () => request('/api/auth/users'),
};

export const postsApi = {
  list: (page = 1, limit = 10, params = {}) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (params.category) query.append('category', params.category);
    return request(`/api/posts?${query.toString()}`);
  },
  getBySlug: (slug) => request(`/api/posts/slug/${slug}`),
  getAll: () => request('/api/posts/admin/all'),
  getById: (id) => request(`/api/posts/admin/${id}`),
  create: (body) => request('/api/posts', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/api/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/api/posts/${id}`, { method: 'DELETE' }),
};

export const uploadApi = {
  image: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) throw data;
    return { url: data.file.url };
  },
};

export const wordpressApi = {
  sync: () => request('/api/wordpress/sync', { method: 'POST' }),
};
