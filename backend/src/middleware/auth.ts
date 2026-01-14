import { Request, Response, NextFunction } from 'express';
import { User } from '../types.js';

// Extend express-session to include our custom session data
declare module 'express-session' {
  interface SessionData {
    user?: User;
    selected_location_id?: string;
  }
}

// Middleware to require authentication
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// Middleware to require admin role
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Middleware to require visitor role (for endpoints that should only be accessible by visitors)
export function requireVisitor(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user || req.session.user.role !== 'visitor') {
    return res.status(403).json({ error: 'Visitor access required' });
  }
  next();
}
