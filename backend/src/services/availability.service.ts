import { DateTime, Interval } from 'luxon';
import { BookingOption, Booking, TimeSlot, BookingState } from '../types.js';
import { storage } from '../storage.js';
import { TIMEZONE } from '../utils/datetime.js';

/**
 * Calculate available time slots for a booking option within a date range.
 * This is the CRITICAL function that handles:
 * 1. Generating slots from weekly_hours
 * 2. Filtering by min/max advance rules
 * 3. Marking slots as unavailable if they conflict with existing bookings (including buffers)
 */
export function calculateAvailableSlots(
  option: BookingOption,
  startDate: string, // "2026-01-07"
  endDate: string // "2026-01-14"
): TimeSlot[] {
  const start = DateTime.fromISO(startDate, { zone: TIMEZONE }).startOf('day');
  const end = DateTime.fromISO(endDate, { zone: TIMEZONE }).endOf('day');

  const allSlots: TimeSlot[] = [];

  // Step 1: Generate all potential slots based on weekly_hours
  let currentDate = start;
  while (currentDate <= end) {
    // luxon weekday: 1=Mon, 2=Tue, ..., 7=Sun
    const weekday = currentDate.weekday;

    // Find weekly_hours for this weekday
    const hoursForDay = option.weekly_hours.filter((wh) => wh.weekday === weekday);

    for (const hours of hoursForDay) {
      const [startHour, startMin] = hours.start.split(':').map(Number);
      const [endHour, endMin] = hours.end.split(':').map(Number);

      let slotStart = currentDate.set({ hour: startHour, minute: startMin });
      const dayEnd = currentDate.set({ hour: endHour, minute: endMin });

      // Generate slots with slot_increment_minutes
      while (slotStart.plus({ minutes: option.duration_minutes }) <= dayEnd) {
        const slotEnd = slotStart.plus({ minutes: option.duration_minutes });

        allSlots.push({
          start_time: slotStart.toISO()!,
          end_time: slotEnd.toISO()!,
          available: true, // Will be updated in step 3
        });

        slotStart = slotStart.plus({ minutes: option.rules.slot_increment_minutes });
      }
    }

    currentDate = currentDate.plus({ days: 1 });
  }

  // Step 2: Filter slots based on min_advance and max_advance
  const now = DateTime.now().setZone(TIMEZONE);
  const minAdvanceTime = now.plus({ minutes: option.rules.min_advance_minutes });
  const maxAdvanceTime = now.plus({ days: option.rules.max_advance_days });

  const validTimeSlots = allSlots.filter((slot) => {
    const slotStart = DateTime.fromISO(slot.start_time, { zone: TIMEZONE });
    return slotStart >= minAdvanceTime && slotStart <= maxAdvanceTime;
  });

  // Step 3: Mark slots as unavailable if they conflict with existing bookings
  const existingBookings = Array.from(storage.bookings.values()).filter(
    (b) => b.booking_option_id === option.id && (b.state === BookingState.CONFIRMED || b.state === BookingState.PENDING)
  );

  for (const slot of validTimeSlots) {
    const slotStart = DateTime.fromISO(slot.start_time, { zone: TIMEZONE });
    const slotEnd = DateTime.fromISO(slot.end_time, { zone: TIMEZONE });
    const slotInterval = Interval.fromDateTimes(slotStart, slotEnd);

    // Check conflicts with buffers
    for (const booking of existingBookings) {
      const bookingStart = DateTime.fromISO(booking.start_time, { zone: TIMEZONE }).minus({
        minutes: option.rules.buffer_before_minutes,
      });
      const bookingEnd = DateTime.fromISO(booking.end_time, { zone: TIMEZONE }).plus({
        minutes: option.rules.buffer_after_minutes,
      });

      const bookingInterval = Interval.fromDateTimes(bookingStart, bookingEnd);

      if (slotInterval.overlaps(bookingInterval)) {
        slot.available = false;
        break;
      }
    }
  }

  return validTimeSlots;
}

/**
 * Helper function to validate if a requested booking time is valid and available.
 */
export function validateBookingTime(
  option: BookingOption,
  requestedStartTime: string
): { valid: boolean; error?: string } {
  const requestedDate = requestedStartTime.split('T')[0];

  // Calculate availability for the requested day
  const slots = calculateAvailableSlots(option, requestedDate, requestedDate);

  const matchingSlot = slots.find((s) => s.start_time === requestedStartTime);

  if (!matchingSlot) {
    return { valid: false, error: 'Requested time is not a valid slot' };
  }

  if (!matchingSlot.available) {
    return { valid: false, error: 'Requested time is not available' };
  }

  return { valid: true };
}
