import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { calculateAvailableSlots } from '../services/availability.service.js';
import { AvailabilityResponse } from '../types.js';

const router = Router();

// GET /api/availability?booking_option_id=X&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get('/', (req: Request, res: Response) => {
  const { booking_option_id, start_date, end_date } = req.query;

  if (!booking_option_id || !start_date || !end_date) {
    return res.status(400).json({
      error: 'booking_option_id, start_date, and end_date are required',
    });
  }

  const option = storage.bookingOptions.get(booking_option_id as string);

  if (!option) {
    return res.status(404).json({ error: 'Booking option not found' });
  }

  const slots = calculateAvailableSlots(option, start_date as string, end_date as string);

  const response: AvailabilityResponse = { slots };
  res.json(response);
});

export default router;
