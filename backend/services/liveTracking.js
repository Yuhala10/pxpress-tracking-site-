const Shipment = require('../models/Shipment');
const { interpolateRoute, bearing, haversineKm } = require('../utils/geo');

const activeSimulations = new Map();

function roomName(trackingNumber) {
  return `track:${trackingNumber.toUpperCase()}`;
}

function emitPosition(io, shipment) {
  const tn = shipment.trackingNumber;
  io.to(roomName(tn)).emit('shipment:update', {
    trackingNumber: tn,
    currentCoords: shipment.currentCoords,
    currentLocation: shipment.currentLocation,
    progress: shipment.liveTracking?.progress ?? 0,
    isMoving: shipment.liveTracking?.isMoving ?? false,
    heading: shipment.liveTracking?.heading ?? 0,
    status: shipment.status,
    statusLabel: shipment.statusLabel,
  });
}

async function persistPosition(shipmentId, data) {
  await Shipment.findByIdAndUpdate(shipmentId, {
    currentCoords: data.currentCoords,
    currentLocation: data.currentLocation,
    'liveTracking.progress': data.progress,
    'liveTracking.isMoving': data.isMoving,
    'liveTracking.heading': data.heading,
    'liveTracking.speedKmh': data.speedKmh,
    'liveTracking.isActive': data.isActive,
  });
}

function stopSimulation(trackingNumber) {
  const key = trackingNumber.toUpperCase();
  const sim = activeSimulations.get(key);
  if (sim?.intervalId) clearInterval(sim.intervalId);
  activeSimulations.delete(key);
}

function startSimulation(io, shipmentDoc) {
  const key = shipmentDoc.trackingNumber.toUpperCase();
  stopSimulation(key);

  const route =
    shipmentDoc.route?.length >= 2
      ? shipmentDoc.route
      : [
          shipmentDoc.originCoords,
          shipmentDoc.destinationCoords,
        ].filter((c) => c?.lat != null);

  if (route.length < 2) return;

  let progress = shipmentDoc.liveTracking?.progress ?? 0;
  let speedKmh = shipmentDoc.liveTracking?.speedKmh ?? 50;
  let isMoving = shipmentDoc.liveTracking?.isMoving ?? false;

  const totalKm = route.reduce((sum, pt, i) => {
    if (i === 0) return 0;
    return sum + haversineKm(route[i - 1].lat, route[i - 1].lng, pt.lat, pt.lng);
  }, 0) || 1;

  const tickMs = 1000;

  const intervalId = setInterval(async () => {
    const sim = activeSimulations.get(key);
    if (!sim) return;
    if (!sim.isMoving) return;

    const kmPerTick = (sim.speedKmh / 3600) * (tickMs / 1000);
    const progressDelta = kmPerTick / totalKm;
    progress = Math.min(1, progress + progressDelta);

    const pos = interpolateRoute(route, progress);
    if (!pos) return;

    const nextPos = interpolateRoute(route, Math.min(1, progress + 0.01));
    const head = nextPos
      ? bearing(pos.lat, pos.lng, nextPos.lat, nextPos.lng)
      : sim.heading;

    const payload = {
      currentCoords: pos,
      currentLocation: sim.currentLocation || shipmentDoc.currentLocation,
      progress,
      isMoving: sim.isMoving,
      heading: head,
      speedKmh: sim.speedKmh,
      isActive: true,
    };

    sim.progress = progress;
    sim.heading = head;

    emitPosition(io, {
      trackingNumber: key,
      ...payload,
      status: sim.status,
      statusLabel: sim.statusLabel,
    });

    if (progress >= 1) {
      sim.isMoving = false;
      await persistPosition(shipmentDoc._id, { ...payload, isMoving: false });
      await Shipment.findByIdAndUpdate(shipmentDoc._id, {
        status: 'delivered',
        statusLabel: 'Delivered',
        'liveTracking.isMoving': false,
        deliveredAt: new Date(),
      });
      stopSimulation(key);
      io.to(roomName(key)).emit('shipment:delivered', { trackingNumber: key });
      return;
    }

    if (Math.floor(progress * 100) % 5 === 0) {
      await persistPosition(shipmentDoc._id, payload);
    }
  }, tickMs);

  activeSimulations.set(key, {
    intervalId,
    shipmentId: shipmentDoc._id,
    isMoving,
    speedKmh,
    progress,
    heading: 0,
    currentLocation: shipmentDoc.currentLocation,
    status: shipmentDoc.status,
    statusLabel: shipmentDoc.statusLabel,
  });
}

function setupLiveTracking(io) {
  io.on('connection', (socket) => {
    socket.on('track:subscribe', ({ trackingNumber }) => {
      if (!trackingNumber) return;
      const room = roomName(trackingNumber);
      socket.join(room);
    });

    socket.on('track:unsubscribe', ({ trackingNumber }) => {
      if (trackingNumber) socket.leave(roomName(trackingNumber));
    });

    socket.on('admin:live-control', async (payload, ack) => {
      try {
        const { token, trackingNumber, action, speedKmh, progress, coords, location } = payload;
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        if (!token) return ack?.({ error: 'Unauthorized' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user || !['admin', 'staff'].includes(user.role)) {
          return ack?.({ error: 'Access denied' });
        }

        const tn = trackingNumber.toUpperCase();
        const shipment = await Shipment.findOne({ trackingNumber: tn });
        if (!shipment) return ack?.({ error: 'Shipment not found' });

        const key = tn;
        let sim = activeSimulations.get(key);

        switch (action) {
          case 'start':
            shipment.liveTracking.isActive = true;
            shipment.liveTracking.isMoving = true;
            if (speedKmh) shipment.liveTracking.speedKmh = speedKmh;
            await shipment.save();
            startSimulation(io, shipment);
            sim = activeSimulations.get(key);
            if (sim) sim.isMoving = true;
            if (speedKmh && sim) sim.speedKmh = speedKmh;
            ack?.({ ok: true, isMoving: true });
            break;

          case 'stop':
            if (sim) sim.isMoving = false;
            shipment.liveTracking.isMoving = false;
            await shipment.save();
            emitPosition(io, shipment);
            ack?.({ ok: true, isMoving: false });
            break;

          case 'pause':
            if (sim) sim.isMoving = false;
            shipment.liveTracking.isMoving = false;
            await shipment.save();
            emitPosition(io, shipment);
            ack?.({ ok: true, isMoving: false });
            break;

          case 'resume':
            if (!sim) startSimulation(io, shipment);
            sim = activeSimulations.get(key);
            if (sim) sim.isMoving = true;
            shipment.liveTracking.isMoving = true;
            if (speedKmh) {
              shipment.liveTracking.speedKmh = speedKmh;
              if (sim) sim.speedKmh = speedKmh;
            }
            await shipment.save();
            ack?.({ ok: true, isMoving: true });
            break;

          case 'set-speed':
            if (speedKmh != null) {
              shipment.liveTracking.speedKmh = speedKmh;
              if (sim) sim.speedKmh = speedKmh;
              await shipment.save();
            }
            ack?.({ ok: true, speedKmh: shipment.liveTracking.speedKmh });
            break;

          case 'set-progress':
            if (progress != null) {
              const route = shipment.route?.length >= 2 ? shipment.route : null;
              const pos = route ? interpolateRoute(route, progress) : shipment.currentCoords;
              shipment.liveTracking.progress = progress;
              if (pos) shipment.currentCoords = pos;
              await shipment.save();
              if (sim) sim.progress = progress;
              emitPosition(io, shipment);
            }
            ack?.({ ok: true });
            break;

          case 'teleport':
            if (coords?.lat != null && coords?.lng != null) {
              shipment.currentCoords = coords;
              if (location) shipment.currentLocation = location;
              await shipment.save();
              emitPosition(io, shipment);
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
}

module.exports = { setupLiveTracking, stopSimulation, emitPosition, roomName };
