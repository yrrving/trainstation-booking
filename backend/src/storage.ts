import { Location, BookingMode, BookingOption, Booking, Session } from './types.js';

// In-memory storage
export const storage = {
  locations: new Map<string, Location>(),
  bookingOptions: new Map<string, BookingOption>(),
  bookings: new Map<string, Booking>(),
  sessions: new Map<string, Session>(),
};

// Static credentials
export const credentials = {
  test: { password: 'test', role: 'visitor' as const },
  admin: { password: 'admin', role: 'admin' as const },
};

// Initialize with seed data matching the original spec
export function initializeStorage() {
  // Create 4 locations from the spec
  const locations: Location[] = [
    {
      id: 'loc_vivalla_orebro',
      name: 'Vivalla/Örebro',
      enabled_modes: [
        BookingMode.HANDLEDNING,
        BookingMode.RUM,
        BookingMode.STUDIEBESOK,
        BookingMode.GRUPP,
        BookingMode.INDIVIDUELL,
      ],
    },
    {
      id: 'loc_skultuna_vasteras',
      name: 'Skultuna/Västerås',
      enabled_modes: [BookingMode.HANDLEDNING, BookingMode.RUM, BookingMode.GRUPP, BookingMode.INDIVIDUELL],
    },
    {
      id: 'loc_karlskoga',
      name: 'Karlskoga',
      enabled_modes: [
        BookingMode.HANDLEDNING,
        BookingMode.RUM,
        BookingMode.STUDIEBESOK,
        BookingMode.GRUPP,
        BookingMode.INDIVIDUELL,
      ],
    },
    {
      id: 'loc_jordbro_haninge',
      name: 'Jordbro/Haninge',
      enabled_modes: [BookingMode.HANDLEDNING, BookingMode.RUM, BookingMode.GRUPP, BookingMode.INDIVIDUELL],
    },
  ];

  locations.forEach((loc) => storage.locations.set(loc.id, loc));

  // Create sample booking options from the spec
  const options: BookingOption[] = [
    {
      id: 'opt_viv_room_studio_a',
      location_id: 'loc_vivalla_orebro',
      mode: BookingMode.RUM,
      label: 'Studio A',
      description: 'Boka studio för foto/video.',
      duration_minutes: 60,
      capacity: { max_people: 6 },
      rules: {
        slot_increment_minutes: 60,
        min_advance_minutes: 60,
        max_advance_days: 30,
        cancellation_cutoff_minutes: 120,
        buffer_before_minutes: 10,
        buffer_after_minutes: 10,
      },
      weekly_hours: [
        { weekday: 2, start: '12:00', end: '17:00' }, // Tuesday (luxon: 2=Tue)
        { weekday: 4, start: '12:00', end: '17:00' }, // Thursday
      ],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'opt_viv_mentoring_bjorn_draw',
      location_id: 'loc_vivalla_orebro',
      mode: BookingMode.HANDLEDNING,
      label: 'Rita med Björn',
      description: '60 minuter handledning i teckning.',
      duration_minutes: 60,
      capacity: { max_people: 1 },
      rules: {
        slot_increment_minutes: 60,
        min_advance_minutes: 60,
        max_advance_days: 28,
        cancellation_cutoff_minutes: 120,
        buffer_before_minutes: 0,
        buffer_after_minutes: 0,
      },
      weekly_hours: [
        { weekday: 2, start: '14:00', end: '18:00' }, // Tuesday
        { weekday: 4, start: '14:00', end: '18:00' }, // Thursday
      ],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  options.forEach((opt) => storage.bookingOptions.set(opt.id, opt));

  console.log(
    `✓ Initialized storage with ${storage.locations.size} locations and ${storage.bookingOptions.size} booking options`
  );
}
