// src/api/workerPaymentService.js
import API from "./axios";

const workerPaymentService = {
  // Get all worker payments
  getAllWorkerPayments: async () => {
    try {
      const response = await API.get('/worker-payment');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payments by worker
  getWorkerPaymentsByLabor: async (laborId) => {
    try {
      const response = await API.get(`/worker-payment/labor/${laborId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add new payment
  addWorkerPayment: async (paymentData) => {
    try {
      const response = await API.post('/worker-payment', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update payment
  updateWorkerPayment: async (id, paymentData) => {
    try {
      const response = await API.put(`/worker-payment/${id}`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete payment
  deleteWorkerPayment: async (id) => {
    try {
      const response = await API.delete(`/worker-payment/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default workerPaymentService;