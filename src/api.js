const API_URL = 'http://localhost:5000/api';

export const getToken = () => localStorage.getItem('token');
export const setToken = (t) => localStorage.setItem('token', t);
export const clearToken = () => localStorage.removeItem('token');

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: (identifier, password, role) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password, role }) }),
  changePassword: (newPassword) =>
    request('/auth/change-password', { method: 'POST', body: JSON.stringify({ newPassword }) }),
  getMe: () => request('/auth/me'),

  getMaterials: (courseId) => request(`/materials/course/${courseId}`),
  uploadMaterial: (formData) => request('/materials/upload', { method: 'POST', body: formData }),
  toggleLock: (id) => request(`/materials/${id}/lock`, { method: 'PATCH' }),
  deleteMaterial: (id) => request(`/materials/${id}`, { method: 'DELETE' }),

  getPublications: () => request('/publications'),
  addPublication: (formData) => request('/publications', { method: 'POST', body: formData }),
  deletePublication: (id) => request(`/publications/${id}`, { method: 'DELETE' }),

  getNews: () => request('/news'),
  addNews: (formData) => request('/news', { method: 'POST', body: formData }),
  deleteNews: (id) => request(`/news/${id}`, { method: 'DELETE' }),

  uploadProfilePhoto: (formData) => request('/profile/photo', { method: 'POST', body: formData }),
  updateProfile: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getAchievements: (userId) => request(`/profile/${userId}/achievements`),
  addAchievement: (text) => request('/profile/achievements', { method: 'POST', body: JSON.stringify({ text }) }),
  deleteAchievement: (id) => request(`/profile/achievements/${id}`, { method: 'DELETE' }),
  getDocuments: (userId) => request(`/profile/${userId}/documents`),
  uploadDocument: (formData) => request('/profile/documents', { method: 'POST', body: formData }),
  deleteDocument: (id) => request(`/profile/documents/${id}`, { method: 'DELETE' }),

  fileUrl: (path) => (path ? `http://localhost:5000${path}` : null),
};