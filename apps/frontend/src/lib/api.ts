import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/refresh`,
            { refreshToken },
          );
          useAuthStore.getState().setTokens(res.data.accessToken, res.data.refreshToken);
          error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api.request(error.config);
        } catch {
          useAuthStore.getState().logout();
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  gosuslugiUrl: () => api.get('/auth/gosuslugi/url'),
  verifyBiometric: (biometricData: string) => api.post('/auth/biometric/verify', { biometricData }),
  sendSmsCode: (phone: string) => api.post('/auth/sms/send', { phone }),
  verifySmsCode: (phone: string, code: string) => api.post('/auth/sms/verify', { phone, code }),
};

// Orders
export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  publish: (id: string) => api.post(`/orders/${id}/publish`),
  findAvailable: (workTypes?: string[]) => api.get('/orders/available', { params: { workTypes } }),
  findMy: () => api.get('/orders/my'),
  findOne: (id: string) => api.get(`/orders/${id}`),
  assignExecutor: (orderId: string, executorId: string) =>
    api.post(`/orders/${orderId}/assign`, { executorId }),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
};

// Defect Statements
export const defectsApi = {
  create: (orderId: string, data: any) => api.post(`/orders/${orderId}/defects`, data),
  findByOrder: (orderId: string) => api.get(`/orders/${orderId}/defects`),
  submit: (id: string) => api.post(`/defects/${id}/submit`),
  approve: (id: string) => api.post(`/defects/${id}/approve`),
  reject: (id: string, comment: string) => api.post(`/defects/${id}/reject`, { comment }),
  uploadPhoto: (defectItemId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/defects/items/${defectItemId}/photos`, form);
  },
};

// Acceptance
export const acceptanceApi = {
  create: (orderId: string, data: any) => api.post(`/orders/${orderId}/acceptance`, data),
  findByOrder: (orderId: string) => api.get(`/orders/${orderId}/acceptance`),
  approve: (id: string, biometricData: string) =>
    api.post(`/acceptance/${id}/approve`, { biometricData }),
  reject: (id: string, data: any) => api.post(`/acceptance/${id}/reject`, data),
  generateKS2: (id: string) => api.post(`/acceptance/${id}/generate-ks2`),
  generateKS3: (ks2ActId: string) => api.post(`/acts/${ks2ActId}/generate-ks3`),
};

// Materials
export const materialsApi = {
  findByObject: (objectId: string) => api.get(`/objects/${objectId}/materials`),
  createMovement: (data: any) => api.post('/materials/movements', data),
  findMovements: (stockId: string) => api.get(`/materials/${stockId}/movements`),
};

// Work Orders (Наряд-допуски)
export const workOrdersApi = {
  create: (orderId: string, data: any) => api.post(`/orders/${orderId}/work-orders`, data),
  findByOrder: (orderId: string) => api.get(`/orders/${orderId}/work-orders`),
  sign: (id: string, biometricData: string) =>
    api.post(`/work-orders/${id}/sign`, { biometricData }),
};

// Weather
export const weatherApi = {
  report: (orderId: string, data: any) => api.post(`/orders/${orderId}/weather-stop`, data),
  approve: (id: string) => api.post(`/weather-stops/${id}/approve`),
};

// Rating
export const ratingApi = {
  submit: (orderId: string, data: any) => api.post(`/orders/${orderId}/rating`, data),
  getExecutorSummary: (executorId: string) => api.get(`/rating/executor/${executorId}`),
};

// Analytics
export const analyticsApi = {
  customerDashboard: (customerId: string) => api.get(`/analytics/customer/${customerId}`),
  aggregatorDashboard: () => api.get('/analytics/aggregator'),
  executorDashboard: (executorId: string) => api.get(`/analytics/executor/${executorId}`),
};

// Objects
export const objectsApi = {
  findMy: () => api.get('/objects/my'),
  create: (data: any) => api.post('/objects', data),
  findOne: (id: string) => api.get(`/objects/${id}`),
};
