// Mock API — runs entirely in the browser, no backend required.
// Mirrors the exact response shapes of the real Express backend.

import { DateTime } from 'luxon';

const TIMEZONE = 'Europe/Stockholm';

// ─── Types ────────────────────────────────────────────────────────────────────

interface User { username: string; role: 'visitor' | 'admin' }

interface WeeklyHours { weekday: number; start: string; end: string }

interface BookingOption {
  id: string;
  location_id: string;
  mode: string;
  label: string;
  description: string;
  duration_minutes: number;
  capacity: { max_people: number };
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

interface Location { id: string; name: string; enabled_modes: string[] }

interface Booking {
  id: string;
  booking_option_id: string;
  location_id: string;
  mode: string;
  start_time: string;
  end_time: string;
  booker: { name: string; email?: string; phone?: string };
  num_people: number;
  notes?: string;
  state: string;
  created_at: string;
  updated_at: string;
}

// ─── In-memory state ──────────────────────────────────────────────────────────

const session: { user: User | null; selected_location_id: string | null } = {
  user: null,
  selected_location_id: null,
};

const credentials: Record<string, { password: string; role: 'visitor' | 'admin' }> = {
  test:  { password: 'test',  role: 'visitor' },
  admin: { password: 'admin', role: 'admin' },
};

const now = new Date().toISOString();

const locations = new Map<string, Location>([
  ['loc_vivalla_orebro',  { id: 'loc_vivalla_orebro',  name: 'Vivalla / Örebro',    enabled_modes: ['handledning', 'rum', 'studiebesök', 'grupp', 'individuell'] }],
  ['loc_skultuna_vasteras', { id: 'loc_skultuna_vasteras', name: 'Skultuna / Västerås', enabled_modes: ['handledning', 'rum', 'grupp', 'individuell'] }],
  ['loc_karlskoga',       { id: 'loc_karlskoga',       name: 'Karlskoga',            enabled_modes: ['handledning', 'rum', 'studiebesök', 'grupp', 'individuell'] }],
  ['loc_jordbro_haninge', { id: 'loc_jordbro_haninge', name: 'Jordbro / Haninge',    enabled_modes: ['handledning', 'rum', 'grupp', 'individuell'] }],
]);

const bookingOptions = new Map<string, BookingOption>([
  ['opt_viv_room_studio_a', {
    id: 'opt_viv_room_studio_a',
    location_id: 'loc_vivalla_orebro',
    mode: 'rum',
    label: 'Studio A',
    description: 'Inspelningsstudio med full utrustning.',
    duration_minutes: 60,
    capacity: { max_people: 6 },
    rules: { slot_increment_minutes: 60, min_advance_minutes: 60, max_advance_days: 30, cancellation_cutoff_minutes: 60, buffer_before_minutes: 10, buffer_after_minutes: 10 },
    weekly_hours: [{ weekday: 2, start: '12:00', end: '17:00' }, { weekday: 4, start: '12:00', end: '17:00' }],
    is_active: true, created_at: now, updated_at: now,
  }],
  ['opt_viv_mentoring_bjorn_draw', {
    id: 'opt_viv_mentoring_bjorn_draw',
    location_id: 'loc_vivalla_orebro',
    mode: 'handledning',
    label: 'Rita med Björn',
    description: 'Handledning i teckning och illustration.',
    duration_minutes: 60,
    capacity: { max_people: 1 },
    rules: { slot_increment_minutes: 60, min_advance_minutes: 60, max_advance_days: 28, cancellation_cutoff_minutes: 0, buffer_before_minutes: 0, buffer_after_minutes: 0 },
    weekly_hours: [{ weekday: 2, start: '14:00', end: '18:00' }, { weekday: 4, start: '14:00', end: '18:00' }],
    is_active: true, created_at: now, updated_at: now,
  }],
]);

const bookings = new Map<string, Booking>();

// ─── Availability algorithm (ported from backend) ─────────────────────────────

function calculateAvailableSlots(option: BookingOption, startDate: string, endDate: string) {
  const nowDt = DateTime.now().setZone(TIMEZONE);
  const start = DateTime.fromISO(startDate, { zone: TIMEZONE }).startOf('day');
  const end   = DateTime.fromISO(endDate,   { zone: TIMEZONE }).endOf('day');

  const slots: { start_time: string; end_time: string; available: boolean }[] = [];
  let current = start;

  while (current <= end) {
    const dayOfWeek = current.weekday; // Luxon: 1=Mon … 7=Sun

    for (const wh of option.weekly_hours.filter(h => h.weekday === dayOfWeek)) {
      const [sh, sm] = wh.start.split(':').map(Number);
      const [eh, em] = wh.end.split(':').map(Number);

      const windowStart = current.set({ hour: sh, minute: sm, second: 0, millisecond: 0 });
      const windowEnd   = current.set({ hour: eh, minute: em, second: 0, millisecond: 0 });

      let slotStart = windowStart;
      while (slotStart.plus({ minutes: option.duration_minutes }) <= windowEnd) {
        const slotEnd = slotStart.plus({ minutes: option.duration_minutes });

        const minAdvance = nowDt.plus({ minutes: option.rules.min_advance_minutes });
        const maxAdvance = nowDt.plus({ days: option.rules.max_advance_days });

        if (slotStart >= minAdvance && slotStart <= maxAdvance) {
          let available = true;

          for (const b of bookings.values()) {
            if (b.booking_option_id !== option.id || b.state === 'cancelled') continue;
            const bStart = DateTime.fromISO(b.start_time).setZone(TIMEZONE)
              .minus({ minutes: option.rules.buffer_before_minutes });
            const bEnd   = DateTime.fromISO(b.end_time).setZone(TIMEZONE)
              .plus({ minutes: option.rules.buffer_after_minutes });
            if (slotStart < bEnd && slotEnd > bStart) { available = false; break; }
          }

          slots.push({ start_time: slotStart.toISO()!, end_time: slotEnd.toISO()!, available });
        }

        slotStart = slotStart.plus({ minutes: option.rules.slot_increment_minutes });
      }
    }

    current = current.plus({ days: 1 });
  }

  return slots;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function requireAuth() {
  if (!session.user) throw new Error('Inte inloggad');
}
function requireAdmin() {
  requireAuth();
  if (session.user?.role !== 'admin') throw new Error('Åtkomst nekad');
}
function ok<T>(data: T): Promise<T> {
  return Promise.resolve(data);
}
function fail(msg: string): Promise<never> {
  return Promise.reject(new Error(msg));
}

// ─── Exported mock API objects (same shape as client.ts) ──────────────────────

export const mockAuthAPI = {
  login: (username: string, password: string) => {
    const cred = credentials[username];
    if (!cred || cred.password !== password) return fail('Felaktigt användarnamn eller lösenord');
    session.user = { username, role: cred.role };
    return ok({ user: session.user });
  },
  logout: () => {
    session.user = null;
    session.selected_location_id = null;
    return ok({ success: true });
  },
  me: () => {
    if (!session.user) return fail('Inte inloggad');
    return ok({ user: session.user, selected_location_id: session.selected_location_id });
  },
};

export const mockSessionAPI = {
  setLocation: (location_id: string) => {
    requireAuth();
    session.selected_location_id = location_id;
    return ok({ success: true });
  },
};

export const mockLocationsAPI = {
  getAll: () => ok({ locations: Array.from(locations.values()) }),
  getById: (id: string) => {
    const loc = locations.get(id);
    return loc ? ok({ location: loc }) : fail('Plats hittades inte');
  },
  updateModes: (id: string, enabled_modes: string[]) => {
    requireAdmin();
    const loc = locations.get(id);
    if (!loc) return fail('Plats hittades inte');
    loc.enabled_modes = enabled_modes;
    return ok({ location: loc });
  },
};

export const mockBookingOptionsAPI = {
  getAll: (params?: { location_id?: string; mode?: string; is_active?: boolean }) => {
    let opts = Array.from(bookingOptions.values());
    if (params?.location_id) opts = opts.filter(o => o.location_id === params.location_id);
    if (params?.mode)        opts = opts.filter(o => o.mode === params.mode);
    if (params?.is_active !== undefined) opts = opts.filter(o => o.is_active === params.is_active);
    return ok({ options: opts });
  },
  getById: (id: string) => {
    const opt = bookingOptions.get(id);
    return opt ? ok({ option: opt }) : fail('Alternativ hittades inte');
  },
  create: (data: any) => {
    requireAdmin();
    const id = crypto.randomUUID();
    const ts = new Date().toISOString();
    const option: BookingOption = { ...data, id, created_at: ts, updated_at: ts };
    bookingOptions.set(id, option);
    return ok({ option });
  },
  update: (id: string, data: any) => {
    requireAdmin();
    const opt = bookingOptions.get(id);
    if (!opt) return fail('Alternativ hittades inte');
    const updated = { ...opt, ...data, id, updated_at: new Date().toISOString() };
    bookingOptions.set(id, updated);
    return ok({ option: updated });
  },
  delete: (id: string) => {
    requireAdmin();
    if (!bookingOptions.has(id)) return fail('Alternativ hittades inte');
    bookingOptions.delete(id);
    return ok({ success: true });
  },
};

export const mockAvailabilityAPI = {
  getSlots: (booking_option_id: string, start_date: string, end_date: string) => {
    const option = bookingOptions.get(booking_option_id);
    if (!option) return fail('Alternativ hittades inte');
    return ok({ slots: calculateAvailableSlots(option, start_date, end_date) });
  },
};

export const mockBookingsAPI = {
  getAll: (params?: { location_id?: string; mode?: string; start_date?: string; end_date?: string; state?: string }) => {
    requireAuth();
    let bks = Array.from(bookings.values());
    if (params?.location_id) bks = bks.filter(b => b.location_id === params.location_id);
    if (params?.mode)        bks = bks.filter(b => b.mode === params.mode);
    if (params?.state)       bks = bks.filter(b => b.state === params.state);
    if (params?.start_date) {
      const sd = DateTime.fromISO(params.start_date);
      bks = bks.filter(b => DateTime.fromISO(b.start_time) >= sd);
    }
    if (params?.end_date) {
      const ed = DateTime.fromISO(params.end_date).endOf('day');
      bks = bks.filter(b => DateTime.fromISO(b.start_time) <= ed);
    }
    return ok({ bookings: bks });
  },
  getById: (id: string) => {
    requireAuth();
    const b = bookings.get(id);
    return b ? ok({ booking: b }) : fail('Bokning hittades inte');
  },
  create: (data: any) => {
    requireAuth();
    const option = bookingOptions.get(data.booking_option_id);
    if (!option)             return fail('Alternativ hittades inte');
    if (!option.is_active)   return fail('Alternativet är inte aktivt');
    if (data.num_people > option.capacity.max_people) return fail('För många personer');
    if (!data.booker?.email && !data.booker?.phone)   return fail('E-post eller telefon krävs');

    const id  = crypto.randomUUID();
    const ts  = new Date().toISOString();
    const start = DateTime.fromISO(data.start_time).setZone(TIMEZONE);
    const booking: Booking = {
      id,
      booking_option_id: data.booking_option_id,
      location_id: option.location_id,
      mode: option.mode,
      start_time: start.toISO()!,
      end_time:   start.plus({ minutes: option.duration_minutes }).toISO()!,
      booker: data.booker,
      num_people: data.num_people,
      notes: data.notes,
      state: 'confirmed',
      created_at: ts,
      updated_at: ts,
    };
    bookings.set(id, booking);
    return ok({ booking });
  },
  cancel: (id: string) => {
    requireAuth();
    const b = bookings.get(id);
    if (!b) return fail('Bokning hittades inte');
    const option = bookingOptions.get(b.booking_option_id);
    if (option && option.rules.cancellation_cutoff_minutes > 0) {
      const minutesUntil = DateTime.fromISO(b.start_time).setZone(TIMEZONE)
        .diff(DateTime.now().setZone(TIMEZONE), 'minutes').minutes;
      if (minutesUntil < option.rules.cancellation_cutoff_minutes) {
        return fail(`Kan inte avboka inom ${option.rules.cancellation_cutoff_minutes} minuter från start`);
      }
    }
    const updated = { ...b, state: 'cancelled', updated_at: new Date().toISOString() };
    bookings.set(id, updated);
    return ok({ booking: updated });
  },
};
