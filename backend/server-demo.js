/**
 * Lightweight demo server — no MongoDB install required.
 * Run: node server-demo.js
 */
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Server } = require('socket.io');
const { buildGreatCircleRoute, interpolateRoute, bearing, haversineKm } = require('./utils/geo');

const JWT_SECRET = process.env.JWT_SECRET || 'pxpress_demo_secret';
const PORT = process.env.PORT || 5000;

const adminPasswordHash = bcrypt.hashSync('xpress12345', 12);

const users = [
  {
    _id: 'admin1',
    name: 'P XPRESS Admin',
    email: 'pxpress@gmail.com',
    password: adminPasswordHash,
    role: 'admin',
  },
];

const route = buildGreatCircleRoute({ lat: 25.2048, lng: 55.2708 }, { lat: 3.848, lng: 11.5021 }, 50);

const shipments = [
  {
    _id: 's1',
    trackingNumber: 'PX992381CM',
    sender: 'Gulf Trading LLC',
    receiver: 'Cameroon Import Co.',
    origin: 'Dubai, UAE',
    destination: 'Yaoundé, Cameroon',
    originCountry: 'UAE',
    destinationCountry: 'Cameroon',
    originCoords: { lat: 25.2048, lng: 55.2708 },
    destinationCoords: { lat: 3.848, lng: 11.5021 },
    currentLocation: 'Paris, France',
    currentCoords: { lat: 48.8566, lng: 2.3522 },
    status: 'in_transit',
    statusLabel: 'In Transit',
    weight: '45 kg',
    shippingMethod: 'Air Freight',
    shipmentType: 'International',
    dispatchDate: new Date().toISOString(),
    expectedDelivery: new Date('2026-06-04').toISOString(),
    route,
    timeline: [
      { label: 'Shipment Created', location: 'Dubai, UAE', completed: true, icon: 'box', timestamp: new Date().toISOString() },
      { label: 'Cleared Customs', location: 'Dubai', completed: true, icon: 'customs', timestamp: new Date().toISOString() },
      { label: 'In Transit', location: 'Paris, France', completed: false, icon: 'truck', timestamp: new Date().toISOString() },
      { label: 'Delivered', location: 'Yaoundé', completed: false, icon: 'check', timestamp: new Date().toISOString() },
    ],
    liveTracking: { isMoving: false, speedKmh: 80, progress: 0.35, heading: 90 },
  },
];

const activeSimulations = new Map();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function auth(req, res, next) {
  const h = req.headers.authorization;
  const token = h?.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    const d = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u._id === d.id);
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

function emitPosition(io, shipment) {
  io.to(`track:${shipment.trackingNumber}`).emit('shipment:update', {
    trackingNumber: shipment.trackingNumber,
    currentCoords: shipment.currentCoords,
    currentLocation: shipment.currentLocation,
    progress: shipment.liveTracking.progress,
    isMoving: shipment.liveTracking.isMoving,
    heading: shipment.liveTracking.heading,
    statusLabel: shipment.statusLabel,
  });
}

function startSim(io, shipment) {
  const key = shipment.trackingNumber;
  const sim = activeSimulations.get(key);
  if (sim?.intervalId) clearInterval(sim.intervalId);

  let progress = shipment.liveTracking.progress || 0;
  const totalKm =
    shipment.route.reduce((sum, pt, i) => {
      if (i === 0) return 0;
      return sum + haversineKm(shipment.route[i - 1].lat, shipment.route[i - 1].lng, pt.lat, pt.lng);
    }, 0) || 1;

  const state = { isMoving: true, speedKmh: shipment.liveTracking.speedKmh || 60 };

  const intervalId = setInterval(() => {
    if (!state.isMoving) return;
    const kmPerTick = (state.speedKmh / 3600) * 1;
    progress = Math.min(1, progress + kmPerTick / totalKm);
    const pos = interpolateRoute(shipment.route, progress);
    if (!pos) return;
    const next = interpolateRoute(shipment.route, Math.min(1, progress + 0.01));
    const head = next ? bearing(pos.lat, pos.lng, next.lat, next.lng) : 0;
    shipment.currentCoords = pos;
    shipment.liveTracking.progress = progress;
    shipment.liveTracking.heading = head;
    shipment.liveTracking.isMoving = true;
    emitPosition(io, shipment);
    if (progress >= 1) {
      state.isMoving = false;
      shipment.liveTracking.isMoving = false;
      clearInterval(intervalId);
    }
  }, 1000);

  activeSimulations.set(key, { intervalId, state, shipment });
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok', mode: 'demo' }));

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
});

app.get('/api/shipments/track/:tn', (req, res) => {
  const s = shipments.find((x) => x.trackingNumber === req.params.tn.toUpperCase());
  if (!s) return res.status(404).json({ message: 'Shipment not found' });
  res.json({ shipment: s });
});

app.get('/api/shipments/public/stats', (_req, res) => {
  res.json({ stats: { totalShipments: 12847, inTransit: 3421, delivered: 9102, countries: 156, onTimeRate: 98.7 } });
});

app.get('/api/shipments', auth, (_req, res) => res.json({ shipments }));

app.get('/api/shipments/analytics', auth, (_req, res) => {
  res.json({ statuses: [{ _id: 'in_transit', count: 1 }], last7: [{ _id: '2026-05-29', count: 1 }] });
});

app.post('/api/shipments/generate-tracking', auth, (_req, res) => {
  res.json({ trackingNumber: `PX${Math.floor(Math.random() * 1e8)}CM` });
});

io.on('connection', (socket) => {
  socket.on('track:subscribe', ({ trackingNumber }) => {
    if (trackingNumber) socket.join(`track:${trackingNumber.toUpperCase()}`);
  });
  socket.on('track:unsubscribe', ({ trackingNumber }) => {
    if (trackingNumber) socket.leave(`track:${trackingNumber.toUpperCase()}`);
  });
  socket.on('admin:live-control', (payload, ack) => {
    try {
      const decoded = jwt.verify(payload.token, JWT_SECRET);
      const user = users.find((u) => u._id === decoded.id);
      if (!user || user.role !== 'admin') return ack?.({ error: 'Access denied' });
      const s = shipments.find((x) => x.trackingNumber === payload.trackingNumber?.toUpperCase());
      if (!s) return ack?.({ error: 'Not found' });
      const sim = activeSimulations.get(s.trackingNumber);
      switch (payload.action) {
        case 'start':
        case 'resume':
          s.liveTracking.isMoving = true;
          if (payload.speedKmh) s.liveTracking.speedKmh = payload.speedKmh;
          startSim(io, s);
          if (sim) sim.state.isMoving = true;
          ack?.({ ok: true, isMoving: true });
          break;
        case 'stop':
        case 'pause':
          if (sim) sim.state.isMoving = false;
          s.liveTracking.isMoving = false;
          emitPosition(io, s);
          ack?.({ ok: true, isMoving: false });
          break;
        case 'set-speed':
          if (payload.speedKmh) {
            s.liveTracking.speedKmh = payload.speedKmh;
            if (sim) sim.state.speedKmh = payload.speedKmh;
          }
          ack?.({ ok: true });
          break;
        case 'set-progress':
          if (payload.progress != null) {
            s.liveTracking.progress = payload.progress;
            const pos = interpolateRoute(s.route, payload.progress);
            if (pos) s.currentCoords = pos;
            emitPosition(io, s);
          }
          ack?.({ ok: true });
          break;
        default:
          ack?.({ error: 'Unknown action' });
      }
    } catch (e) {
      ack?.({ error: e.message });
    }
  });
});

server.listen(PORT, () => {
  console.log(`P XPRESS DEMO API → http://localhost:${PORT}`);
  console.log('No MongoDB needed. Admin: pxpress@gmail.com / xpress12345');
  console.log('Track: http://localhost:3000/track/PX992381CM');
});
