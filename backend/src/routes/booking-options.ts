import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { requireAdmin } from '../middleware/auth.js';
import { CreateBookingOptionRequest, UpdateBookingOptionRequest, BookingOption } from '../types.js';
import { randomUUID } from 'crypto';

const router = Router();

// GET /api/booking-options?location_id=X&mode=Y&is_active=true
router.get('/', (req: Request, res: Response) => {
  let options = Array.from(storage.bookingOptions.values());

  // Filter by location_id
  if (req.query.location_id) {
    options = options.filter((opt) => opt.location_id === req.query.location_id);
  }

  // Filter by mode
  if (req.query.mode) {
    options = options.filter((opt) => opt.mode === req.query.mode);
  }

  // Filter by is_active
  if (req.query.is_active !== undefined) {
    const isActive = req.query.is_active === 'true';
    options = options.filter((opt) => opt.is_active === isActive);
  }

  res.json({ options });
});

// GET /api/booking-options/:id
router.get('/:id', (req: Request, res: Response) => {
  const option = storage.bookingOptions.get(req.params.id);

  if (!option) {
    return res.status(404).json({ error: 'Booking option not found' });
  }

  res.json({ option });
});

// POST /api/booking-options (Admin only)
router.post('/', requireAdmin, (req: Request, res: Response) => {
  const data = req.body as CreateBookingOptionRequest;

  // Basic validation
  if (!data.location_id || !data.mode || !data.label) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newOption: BookingOption = {
    id: randomUUID(),
    location_id: data.location_id,
    mode: data.mode,
    label: data.label,
    description: data.description,
    duration_minutes: data.duration_minutes,
    capacity: data.capacity,
    rules: data.rules,
    weekly_hours: data.weekly_hours,
    is_active: data.is_active,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  storage.bookingOptions.set(newOption.id, newOption);

  res.status(201).json({ option: newOption });
});

// PATCH /api/booking-options/:id (Admin only)
router.patch('/:id', requireAdmin, (req: Request, res: Response) => {
  const option = storage.bookingOptions.get(req.params.id);

  if (!option) {
    return res.status(404).json({ error: 'Booking option not found' });
  }

  const updates = req.body as UpdateBookingOptionRequest;

  // Update fields that are provided
  if (updates.location_id !== undefined) option.location_id = updates.location_id;
  if (updates.mode !== undefined) option.mode = updates.mode;
  if (updates.label !== undefined) option.label = updates.label;
  if (updates.description !== undefined) option.description = updates.description;
  if (updates.duration_minutes !== undefined) option.duration_minutes = updates.duration_minutes;
  if (updates.capacity !== undefined) option.capacity = updates.capacity;
  if (updates.rules !== undefined) option.rules = updates.rules;
  if (updates.weekly_hours !== undefined) option.weekly_hours = updates.weekly_hours;
  if (updates.is_active !== undefined) option.is_active = updates.is_active;

  option.updated_at = new Date().toISOString();

  storage.bookingOptions.set(option.id, option);

  res.json({ option });
});

// DELETE /api/booking-options/:id (Admin only)
router.delete('/:id', requireAdmin, (req: Request, res: Response) => {
  const option = storage.bookingOptions.get(req.params.id);

  if (!option) {
    return res.status(404).json({ error: 'Booking option not found' });
  }

  storage.bookingOptions.delete(req.params.id);

  res.json({ success: true });
});

export default router;
