// ===== Core Entities =====

export interface Location {
  id: string;
  name: string;
  enabled_modes: BookingMode[];
}

export enum BookingMode {
  HANDLEDNING = 'handledning',
  RUM = 'rum',
  STUDIEBESOK = 'studiebesök',
  GRUPP = 'grupp',
  INDIVIDUELL = 'individuell',
}

export interface WeeklyHours {
  weekday: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start: string; // "09:00"
  end: string; // "17:00"
}

export interface BookingOption {
  id: string;
  location_id: string;
  mode: BookingMode;
  label: string;
  description: string;
  duration_minutes: number;
  capacity: {
    max_people: number;
  };
  rules: {
    slot_increment_minutes: number;
    min_advance_minutes: number;
    max_advance_days: number;
    cancellation_cutoff_minutes: number;
    buffer_before_minutes: number;
    buffer_after_minutes: number;
  };
  weekly_hours: WeeklyHours[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export enum BookingState {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export interface Booking {
  id: string;
  booking_option_id: string;
  location_id: string; // Denormalized for easier filtering
  mode: BookingMode; // Denormalized
  start_time: string; // ISO 8601 in Europe/Stockholm
  end_time: string; // ISO 8601
  booker: {
    name: string;
    email?: string;
    phone?: string;
  };
  num_people: number;
  notes?: string;
  state: BookingState;
  created_at: string;
  updated_at: string;
}

// ===== Auth & Session =====

export interface User {
  username: string;
  role: 'visitor' | 'admin';
}

export interface Session {
  user: User;
  selected_location_id?: string;
}

// ===== API Request/Response Types =====

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface CreateBookingRequest {
  booking_option_id: string;
  start_time: string;
  booker: {
    name: string;
    email?: string;
    phone?: string;
  };
  num_people: number;
  notes?: string;
}

export interface CreateBookingResponse {
  booking: Booking;
}

export interface AvailabilityRequest {
  booking_option_id: string;
  start_date: string; // "2026-01-07"
  end_date: string; // "2026-01-14"
}

export interface TimeSlot {
  start_time: string; // ISO 8601
  end_time: string;
  available: boolean;
}

export interface AvailabilityResponse {
  slots: TimeSlot[];
}

export interface UpdateLocationModesRequest {
  enabled_modes: BookingMode[];
}

export interface CreateBookingOptionRequest {
  location_id: string;
  mode: BookingMode;
  label: string;
  description: string;
  duration_minutes: number;
  capacity: { max_people: number };
  rules: BookingOption['rules'];
  weekly_hours: WeeklyHours[];
  is_active: boolean;
}

export interface UpdateBookingOptionRequest extends Partial<CreateBookingOptionRequest> {}

export interface BookingFilterParams {
  location_id?: string;
  mode?: BookingMode;
  start_date?: string;
  end_date?: string;
  state?: BookingState;
}
