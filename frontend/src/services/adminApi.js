// src/services/adminApi.js
import { apiFetch } from './api';

export const getOrders = () => apiFetch('/orders');

export const getProducts = () => apiFetch('/products');

export const updateOrderStatus = (orderId, status) =>
  apiFetch(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

export const validateOrder = (orderId) =>
  apiFetch(`/orders/${orderId}/validate`, { method: 'PUT' });

export const updateProductStock = (productId, stock) =>
  apiFetch(`/products/${productId}/stock`, {
    method: 'PUT',
    body: JSON.stringify({ stock }),
  });
