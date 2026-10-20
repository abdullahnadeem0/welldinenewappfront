// src/api/creditApi.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ⚠️ نوٹ: baseURL میں '/api' شامل ہے، اس لیے یہاں '/api' نہیں لکھنا
export const getAllCredits = () => API.get('/credits');
export const getCreditById = (id) => API.get(`/credits/${id}`);
export const createCredit = (data) => API.post('/credits', data);
export const updateCredit = (id, data) => API.put(`/credits/${id}`, data);
export const deleteCredit = (id) => API.delete(`/credits/${id}`);
export const addPayment = (id, data) => API.post(`/credits/${id}/payments`, data);
export const deletePayment = (id, paymentId) => API.delete(`/credits/${id}/payments/${paymentId}`);