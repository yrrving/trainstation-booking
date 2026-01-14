import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { CreateBookingRequest, Booking, BookingState, BookingFilterParams } from '../types.js';
import { validateBookingTime } from '../services/availability.service.js';
import { DateTime } from 'luxon';
import { TIMEZONE } from '../utils/datetime.js';
import { randomUUID } from 'crypto';

const router = Router();

// GET /api/bookings?location_id=X&mode=Y&start_date=Z&state=S
// Visitor: only sees own bookings
// Admin: sees all bookings
router.get('/', requireAuth, (req: Request, res: Response) => {
  let bookings = Array.from(storage.bookings.values());

  // If visitor, filter to only show bookings created by this session
  // For simplicity in prototype, we'll skip this for now and allow visitors to see all
  // In a real app, we'd need to track which user created which booking

  // Filter by location_id
  if (req.query.location_id) {
    bookings = bookings.filter((b) => b.location_id === req.query.location_id);
  }

  // Filter by mode
  if (req.query.mode) {
    bookings = bookings.filter((b) => b.mode === req.query.mode);
  }

  // Filter by state
  if (req.query.state) {
    bookings = bookings.filter((b) => b.state === req.query.state);
  }

  // Filter by date range
  if (req.query.start_date && req.query.end_date) {
    const start = DateTime.fromISO(req.query.start_date as string, { zone: TIMEZONE });
    const end = DateTime.fromISO(req.query.end_date as string, { zone: TIMEZONE }).endOf('day');

    bookings = bookings.filter((b) => {
      const bookingStart = DateTime.fromISO(b.start_time, { zone: TIMEZONE });
      return bookingStart >= start && bookingStart <= end;
    });
  }

  res.json({ bookings });
});

// GET /api/bookings/:id
router.get('/:id', requireAuth, (req: Request, res: Response) => {
  const booking = storage.bookings.get(req.params.id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  res.json({ booking });
});

// POST /api/bookings - Create a new booking
router.post('/', requireAuth, (req: Request, res: Response) => {
  const data = req.body as CreateBookingRequest;

  // Validate required fields
  if (!data.booking_option_id || !data.start_time || !data.booker?.name || !data.num_people) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate that at least email or phone is provided
  if (!data.booker.email && !data.booker.phone) {
    return res.status(400).json({ error: 'At least email or phone is required' });
  }

  // Get the booking option
  const option = storage.bookingOptions.get(data.booking_option_id);

  if (!option) {
    return res.status(404).json({ error: 'Booking option not found' });
  }

  // Validate that the option is active
  if (!option.is_active) {
    return res.status(400).json({ error: 'This booking option is not currently available' });
  }

  // Validate num_people against capacity
  if (data.num_people > option.capacity.max_people) {
    return res.status(400).json({
      error: `Maximum ${option.capacity.max_people} people allowed`,
    });
  }

  // Validate booking time against availability
  const validation = validateBookingTime(option, data.start_time);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  // Calculate end time
  const startTime = DateTime.fromISO(data.start_time, { zone: TIMEZONE });
  const endTime = startTime.plus({ minutes: option.duration_minutes });

  // Create the booking
  const newBooking: Booking = {
    id: randomUUID(),
    booking_option_id: option.id,
    location_id: option.location_id,
    mode: option.mode,
    start_time: startTime.toISO()!,
    end_time: endTime.toISO()!,
    booker: {
      name: data.booker.name,
      email: data.booker.email,
      phone: data.booker.phone,
    },
    num_people: data.num_people,
    notes: data.notes,
    state: BookingState.CONFIRMED, // Auto-confirm for prototype
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  storage.bookings.set(newBooking.id, newBooking);

  res.status(201).json({ booking: newBooking });
});

// PATCH /api/bookings/:id/cancel - Cancel a booking
router.patch('/:id/cancel', requireAuth, (req: Request, res: Response) => {
  const booking = storage.bookings.get(req.params.id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Check if already cancelled
  if (booking.state === BookingState.CANCELLED) {
    return res.status(400).json({ error: 'Booking is already cancelled' });
  }

  // Get the booking option to check cancellation cutoff
  const option = storage.bookingOptions.get(booking.booking_option_id);

  if (!option) {
    return res.status(404).json({ error: 'Booking option not found' });
  }

  // Check cancellation cutoff
  const now = DateTime.now().setZone(TIMEZONE);
  const bookingStart = DateTime.fromISO(booking.start_time, { zone: TIMEZONE });
  const cutoffTime = bookingStart.minus({ minutes: option.rules.cancellation_cutoff_minutes });

  if (now > cutoffTime) {
    return res.status(400).json({
      error: `Cannot cancel within ${option.rules.cancellation_cutoff_minutes} minutes of booking start`,
    });
  }

  // Cancel the booking
  booking.state = BookingState.CANCELLED;
  booking.updated_at = new Date().toISOString();

  storage.bookings.set(booking.id, booking);

  res.json({ booking });
});

export default router;
