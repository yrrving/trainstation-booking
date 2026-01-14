// Shared types for frontend
// Using export type for interfaces to work properly with Vite

export type User = {
  username: string;
  role: 'visitor' | 'admin';
}

export type Location = {
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

export type WeeklyHours = {
  weekday: number;
  start: string;
  end: string;
}

export type BookingOption = {
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

export type Booking = {
  id: string;
  booking_option_id: string;
  location_id: string;
  mode: BookingMode;
  start_time: string;
  end_time: string;
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

export type TimeSlot = {
  start_time: string;
  end_time: string;
  available: boolean;
}

export type LoginRequest = {
  username: string;
  password: string;
}

export type CreateBookingRequest = {
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

export type CreateBookingOptionRequest = {
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

export type UpdateBookingOptionRequest = Partial<CreateBookingOptionRequest>

export type UpdateLocationModesRequest = {
  enabled_modes: BookingMode[];
}
