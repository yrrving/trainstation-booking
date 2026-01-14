import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/session/location - Store selected location in session
router.post('/location', requireAuth, (req: Request, res: Response) => {
  const { location_id } = req.body;

  if (!location_id) {
    return res.status(400).json({ error: 'location_id is required' });
  }

  req.session.selected_location_id = location_id;

  res.json({ success: true });
});

export default router;
