import { request } from './api';

export const getEvents = () => request('/events');

export const getEvent = id => request(`/events/${id}`);

// For a new event, include paymentMethod: "paypal" | "card" | "later".
export const createEvent = event =>
  request('/events', { method: 'POST', body: JSON.stringify(event) });

export const updateEvent = (id, event) =>
  request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(event) });

export const deleteEvent = id => request(`/events/${id}`, { method: 'DELETE' });

// { bookingFee, currency }
export const getBookingConfig = () => request('/config');
