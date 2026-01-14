import { Router, Request, Response } from 'express';
import { credentials } from '../storage.js';
import { LoginRequest, LoginResponse } from '../types.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body as LoginRequest;

  // Validate credentials
  const cred = credentials[username as keyof typeof credentials];
  if (!cred || cred.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Create session
  req.session.user = {
    username,
    role: cred.role,
  };

  const response: LoginResponse = {
    user: req.session.user,
  };

  res.json(response);
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

// GET /api/auth/me - Get current user and session info
router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({
    user: req.session.user,
    selected_location_id: req.session.selected_location_id,
  });
});

export default router;
