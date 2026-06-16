// API client for backend communication

import {
  mockAuthAPI, mockSessionAPI, mockLocationsAPI,
  mockBookingOptionsAPI, mockAvailabilityAPI, mockBookingsAPI, mockWishesAPI,
} from './mockClient';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // Important: Include cookies for session
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = USE_MOCK ? mockAuthAPI : {
  login: (username: string, password: string) =>
    fetchJSON(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    fetchJSON(`${API_BASE}/auth/logout`, {
      method: 'POST',
    }),

  me: () => fetchJSON(`${API_BASE}/auth/me`),
};

// Session API
export const sessionAPI = USE_MOCK ? mockSessionAPI : {
  setLocation: (location_id: string) =>
    fetchJSON(`${API_BASE}/session/location`, {
      method: 'POST',
      body: JSON.stringify({ location_id }),
    }),
};

// Locations API
export const locationsAPI = USE_MOCK ? mockLocationsAPI : {
  getAll: () => fetchJSON(`${API_BASE}/locations`),

  getById: (id: string) => fetchJSON(`${API_BASE}/locations/${id}`),

  updateModes: (id: string, enabled_modes: string[]) =>
    fetchJSON(`${API_BASE}/locations/${id}/modes`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled_modes }),
    }),
};

// Booking Options API
export const bookingOptionsAPI = USE_MOCK ? mockBookingOptionsAPI : {
  getAll: (params?: { location_id?: string; mode?: string; is_active?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.location_id) searchParams.append('location_id', params.location_id);
    if (params?.mode) searchParams.append('mode', params.mode);
    if (params?.is_active !== undefined) searchParams.append('is_active', String(params.is_active));

    return fetchJSON(`${API_BASE}/booking-options?${searchParams}`);
  },

  getById: (id: string) => fetchJSON(`${API_BASE}/booking-options/${id}`),

  create: (data: any) =>
    fetchJSON(`${API_BASE}/booking-options`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchJSON(`${API_BASE}/booking-options/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchJSON(`${API_BASE}/booking-options/${id}`, {
      method: 'DELETE',
    }),
};

// Availability API
export const availabilityAPI = USE_MOCK ? mockAvailabilityAPI : {
  getSlots: (booking_option_id: string, start_date: string, end_date: string) => {
    const params = new URLSearchParams({ booking_option_id, start_date, end_date });
    return fetchJSON(`${API_BASE}/availability?${params}`);
  },
};

// Bookings API
export const bookingsAPI = USE_MOCK ? mockBookingsAPI : {
  getAll: (params?: { location_id?: string; mode?: string; start_date?: string; end_date?: string; state?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.location_id) searchParams.append('location_id', params.location_id);
    if (params?.mode) searchParams.append('mode', params.mode);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.state) searchParams.append('state', params.state);

    return fetchJSON(`${API_BASE}/bookings?${searchParams}`);
  },

  getById: (id: string) => fetchJSON(`${API_BASE}/bookings/${id}`),

  getMine: () => fetchJSON(`${API_BASE}/bookings/mine`),

  create: (data: any) =>
    fetchJSON(`${API_BASE}/bookings`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancel: (id: string) =>
    fetchJSON(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'PATCH',
    }),
};

// Wishes API (önskemål — reaktiv väg)
export const wishesAPI = USE_MOCK ? mockWishesAPI : {
  getAll: (params?: { location_id?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.location_id) searchParams.append('location_id', params.location_id);
    if (params?.status) searchParams.append('status', params.status);
    return fetchJSON(`${API_BASE}/wishes?${searchParams}`);
  },

  create: (data: any) =>
    fetchJSON(`${API_BASE}/wishes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string) =>
    fetchJSON(`${API_BASE}/wishes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
