// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await response.json().catch(() => null);

  // Session expirée : on nettoie l'affichage et on renvoie vers la connexion
  if (response.status === 401 && localStorage.getItem('username')) {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.assign('/login');
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Une erreur est survenue.');
    error.status = response.status;
    throw error;
  }

  return data;
};

export const fetchProducts = () => apiFetch('/products');

export const createOrder = (orderData) =>
  apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
