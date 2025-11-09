const API_BASE = '/api';

async function request(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Auth
  signup: (data: { name: string; email: string; password: string }) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getCurrentUser: () => request('/auth/me'),

  // Polls
  createPoll: (data: any) =>
    request('/polls', { method: 'POST', body: JSON.stringify(data) }),

  getPolls: () => request('/polls'),

  getPoll: (id: string) => request(`/polls/${id}`),

  getPublicPoll: (publicId: string) => request(`/polls/public/${publicId}`),

  submitPollResponses: (publicId: string, data: any) =>
    request(`/polls/public/${publicId}/responses`, { method: 'POST', body: JSON.stringify(data) }),

  // Booking Pages
  createBookingPage: (data: any) =>
    request('/booking-pages', { method: 'POST', body: JSON.stringify(data) }),

  getBookingPages: () => request('/booking-pages'),

  getBookingPage: (id: string) => request(`/booking-pages/${id}`),

  getPublicBookingPage: (publicId: string) => request(`/booking-pages/public/${publicId}`),

  getAvailableSlots: (publicId: string, data: { start_date: string; end_date: string }) =>
    request(`/booking-pages/public/${publicId}/available-slots`, { method: 'POST', body: JSON.stringify(data) }),

  createBooking: (publicId: string, data: any) =>
    request(`/booking-pages/public/${publicId}/bookings`, { method: 'POST', body: JSON.stringify(data) }),
};
