import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { initializeStorage } from './storage.js';

// Import routes
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/session.js';
import locationRoutes from './routes/locations.js';
import bookingOptionRoutes from './routes/booking-options.js';
import availabilityRoutes from './routes/availability.js';
import bookingRoutes from './routes/bookings.js';

const app = express();

// Middleware
const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);
app.use(express.json());

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'trainstation-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      maxAge: 240 * 60 * 1000, // 240 minutes (4 hours)
      sameSite: isProduction ? 'none' : 'lax',
    },
  })
);

// Initialize storage with seed data
initializeStorage();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/booking-options', bookingOptionRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Trainstation Booking API running on http://localhost:${PORT}`);
  console.log(`📚 API endpoints:`);
  console.log(`   - POST   /api/auth/login`);
  console.log(`   - POST   /api/auth/logout`);
  console.log(`   - GET    /api/auth/me`);
  console.log(`   - GET    /api/locations`);
  console.log(`   - PATCH  /api/locations/:id/modes`);
  console.log(`   - GET    /api/booking-options`);
  console.log(`   - POST   /api/booking-options`);
  console.log(`   - GET    /api/availability`);
  console.log(`   - GET    /api/bookings`);
  console.log(`   - POST   /api/bookings`);
  console.log(`   - PATCH  /api/bookings/:id/cancel`);
  console.log(`\n✓ Ready to accept connections\n`);
});
