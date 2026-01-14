import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { requireAdmin } from '../middleware/auth.js';
import { UpdateLocationModesRequest } from '../types.js';

const router = Router();

// GET /api/locations - Get all locations (public)
router.get('/', (req: Request, res: Response) => {
  const locations = Array.from(storage.locations.values());
  res.json({ locations });
});

// GET /api/locations/:id - Get single location (public)
router.get('/:id', (req: Request, res: Response) => {
  const location = storage.locations.get(req.params.id);

  if (!location) {
    return res.status(404).json({ error: 'Location not found' });
  }

  res.json({ location });
});

// PATCH /api/locations/:id/modes - Update enabled modes for a location (admin only)
router.patch('/:id/modes', requireAdmin, (req: Request, res: Response) => {
  const location = storage.locations.get(req.params.id);

  if (!location) {
    return res.status(404).json({ error: 'Location not found' });
  }

  const { enabled_modes } = req.body as UpdateLocationModesRequest;

  if (!enabled_modes || !Array.isArray(enabled_modes)) {
    return res.status(400).json({ error: 'enabled_modes must be an array' });
  }

  // Update the location
  location.enabled_modes = enabled_modes;
  storage.locations.set(location.id, location);

  res.json({ location });
});

export default router;
