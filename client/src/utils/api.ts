import { mockApi } from './mockApi';

// Use environment variable for API URL, fallback to /api for local dev
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Demo mode detection
let useDemoMode = false;
let demoModeChecked = false;

async function checkBackendAvailability() {
  if (demoModeChecked) return;

  try {
    const response = await fetch(`${API_BASE}/health`, { method: 'GET' });
    useDemoMode = !response.ok;
  } catch (error) {
    useDemoMode = true;
  }

  demoModeChecked = true;

  if (useDemoMode) {
    console.log('🎭 Running in DEMO MODE - data stored in browser only');
  }
}

// Check backend on load
checkBackendAvailability();

export function isDemoMode() {
  return useDemoMode;
}

async function request(url: string, options: RequestInit = {}) {
  // Ensure demo mode check is complete
  if (!demoModeChecked) {
    await checkBackendAvailability();
  }

  // Use mock API if in demo mode
  if (useDemoMode) {
    return handleMockRequest(url, options);
  }

  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  } catch (error) {
    // If request fails, switch to demo mode
    useDemoMode = true;
    console.log('🎭 Switched to DEMO MODE - backend unavailable');
    return handleMockRequest(url, options);
  }
}

function handleMockRequest(url: string, options: RequestInit = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : null;

  // Route to appropriate mock API method
  if (url === '/auth/signup' && method === 'POST') return mockApi.signup(body);
  if (url === '/auth/login' && method === 'POST') return mockApi.login(body);
  if (url === '/auth/me') return mockApi.getCurrentUser();

  if (url === '/polls' && method === 'POST') return mockApi.createPoll(body);
  if (url === '/polls' && method === 'GET') return mockApi.getPolls();
  if (url.match(/^\/polls\/[^/]+$/) && method === 'GET') {
    const id = url.split('/')[2];
    return mockApi.getPoll(id);
  }
  if (url.match(/^\/polls\/public\/[^/]+$/)) {
    const publicId = url.split('/').pop()!;
    return mockApi.getPublicPoll(publicId);
  }
  if (url.match(/^\/polls\/public\/[^/]+\/responses$/)) {
    const publicId = url.split('/')[3];
    return mockApi.submitPollResponses(publicId, body);
  }

  if (url === '/booking-pages' && method === 'POST') return mockApi.createBookingPage(body);
  if (url === '/booking-pages' && method === 'GET') return mockApi.getBookingPages();
  if (url.match(/^\/booking-pages\/[^/]+$/) && method === 'GET') {
    const id = url.split('/')[2];
    return mockApi.getBookingPage(id);
  }
  if (url.match(/^\/booking-pages\/public\/[^/]+$/)) {
    const publicId = url.split('/').pop()!;
    return mockApi.getPublicBookingPage(publicId);
  }
  if (url.match(/^\/booking-pages\/public\/[^/]+\/available-slots$/)) {
    const publicId = url.split('/')[3];
    return mockApi.getAvailableSlots(publicId, body);
  }
  if (url.match(/^\/booking-pages\/public\/[^/]+\/bookings$/)) {
    const publicId = url.split('/')[3];
    return mockApi.createBooking(publicId, body);
  }

  throw new Error('Route not implemented in demo mode');
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
