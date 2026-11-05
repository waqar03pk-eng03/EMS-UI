import { request } from './api';

export const getCategories = () => request('/categories');

export const createCategory = category =>
  request('/categories', { method: 'POST', body: JSON.stringify(category) });

export const updateCategory = (id, category) =>
  request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(category) });

export const deleteCategory = id => request(`/categories/${id}`, { method: 'DELETE' });
