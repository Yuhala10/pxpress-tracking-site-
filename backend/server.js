require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const shipmentRoutes = require('./routes/shipments');
const quoteRoutes = require('./routes/quotes');
const adminRoutes = require('./routes/admin');
const { setupLiveTracking } = require('./services/liveTracking');
const { corsOrigin } = require('./utils/cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);
setupLiveTracking(io);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const trackLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
app.use('/api/', limiter);
app.use('/api/shipments/track', trackLimiter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', brand: 'P XPRESS' }));

app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const { connectDB } = require('./db/connect');
const { autoSeedIfEmpty } = require('./db/autoSeed');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    await autoSeedIfEmpty();
    server.listen(PORT, () => {
      console.log(`P XPRESS API running on http://localhost:${PORT}`);
      console.log('Frontend: http://localhost:3000');
    });
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
}

start();
