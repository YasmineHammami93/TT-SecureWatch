import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const alertService = {
  getAll: (params?: any) => api.get('/alerts', { params }).then((res) => res.data),
  getById: (id: string) => api.get(`/alerts/${id}`).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/alerts/${id}`, data).then((res) => res.data),
  analyze: (id: string) => api.post(`/alerts/${id}/analyze`).then((res) => res.data),
};

export const userService = {
  getAll: () => api.get('/users').then((res) => res.data),
  getById: (id: string) => api.get(`/users/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/users', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/users/${id}`).then((res) => res.data),
  changeRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }).then((res) => res.data),
};

export const statsService = {
  getGlobal: () => api.get('/stats').then((res) => res.data),
  getDetailed: (period?: string) => api.get('/stats/detailed', { params: { period } }).then((res) => res.data),
  getMLDatasetStats: () => api.get('/stats/ml-dataset').then((res) => res.data),
};


export const collectorService = {
  getAll: () => api.get('/collectors').then((res) => res.data),
  create: (data: any) => api.post('/collectors', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/collectors/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/collectors/${id}`).then((res) => res.data),
  sync: (source?: string) => source ? api.post(`/collectors/sync/${source}`) : api.post('/collectors/sync'),
  getStatus: () => api.get('/collectors/status').then((res) => res.data),
};

export const playbookService = {
  getAll: () => api.get('/playbooks').then((res) => res.data),
  create: (data: any) => api.post('/playbooks', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/playbooks/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/playbooks/${id}`).then((res) => res.data),
  execute: (id: string, alertId: string) => api.post(`/playbooks/${id}/execute`, { alertId }).then((res) => res.data),
};

export const reportService = {
  getAll: () => api.get('/reports').then((res) => res.data),
  generate: (data: { name: string, type: string, startDate?: string, endDate?: string }) => api.post('/reports', data).then((res) => res.data),
  exportCSV: (startDate?: string, endDate?: string) => {
    let url = `${api.defaults.baseURL}/reports/export-csv?token=${localStorage.getItem('token')}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return url;
  },
};

export const assetService = {
  getAll: () => api.get('/assets').then((res) => res.data),
  create: (data: any) => api.post('/assets', data).then((res) => res.data),
  update: (id: string, data: any) => api.put(`/assets/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/assets/${id}`).then((res) => res.data),
};

export const notificationService = {
  getAll: () => api.get('/notifications').then((res) => res.data),
  notifySOC: (alertId: string, alertData: any, message?: string) => 
    api.post('/notify-soc', { alertId, alertData, message }).then((res) => res.data),
};

export default api;
