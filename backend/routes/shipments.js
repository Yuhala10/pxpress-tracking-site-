const express = require('express');
const Shipment = require('../models/Shipment');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const { generateTrackingNumber } = require('../utils/trackingGenerator');
const { buildGreatCircleRoute } = require('../utils/geo');
const { sendShipmentUpdate } = require('../services/emailService');
const ActivityLog = require('../models/ActivityLog');

const router = express.Router();

const TIMELINE_STEPS = [
  'Shipment Created',
  'Picked Up',
  'In Transit',
  'Arrived at Facility',
  'Customs Clearance',
  'Out for Delivery',
  'Delivered',
];

router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const tn = req.params.trackingNumber.toUpperCase();
    const shipment = await Shipment.findOne({ trackingNumber: tn }).select('-notes');
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    res.json({ shipment });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/track/:trackingNumber/history', async (req, res) => {
  const tn = req.params.trackingNumber.toUpperCase();
  if (req.body.userId) {
    await User.findByIdAndUpdate(req.body.userId, {
      $push: { searchHistory: { trackingNumber: tn } },
    });
  }
  res.json({ ok: true });
});

router.get('/public/stats', async (_req, res) => {
  const [total, inTransit, delivered, pending] = await Promise.all([
    Shipment.countDocuments(),
    Shipment.countDocuments({ status: 'in_transit' }),
    Shipment.countDocuments({ status: 'delivered' }),
    Shipment.countDocuments({ status: { $in: ['created', 'picked_up', 'at_facility', 'customs'] } }),
  ]);
  res.json({
    stats: {
      totalShipments: total || 12847,
      inTransit: inTransit || 3421,
      delivered: delivered || 9102,
      countries: 156,
      onTimeRate: 98.7,
      pending,
    },
  });
});

router.use(auth);

router.get('/my', async (req, res) => {
  const filter =
    req.user.role === 'customer'
      ? { $or: [{ customerId: req.user._id }, { receiverEmail: req.user.email }] }
      : {};
  const shipments = await Shipment.find(filter).sort({ createdAt: -1 });
  res.json({ shipments });
});

router.get('/', requireRole('admin', 'staff'), async (req, res) => {
  const { status, q } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) filter.trackingNumber = new RegExp(q, 'i');
  const shipments = await Shipment.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ shipments });
});

router.get('/analytics', requireRole('admin', 'staff'), async (_req, res) => {
  const statuses = await Shipment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const last7 = await Shipment.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ statuses, last7 });
});

router.post('/generate-tracking', requireRole('admin', 'staff'), (_req, res) => {
  res.json({ trackingNumber: generateTrackingNumber() });
});

router.post('/', requireRole('admin', 'staff'), async (req, res) => {
  try {
    const data = req.body;
    const trackingNumber = data.trackingNumber || generateTrackingNumber();
    const originCoords = data.originCoords || { lat: 25.2048, lng: 55.2708 };
    const destCoords = data.destinationCoords || { lat: 3.848, lng: 11.5021 };
    const route = data.route?.length >= 2 ? data.route : buildGreatCircleRoute(originCoords, destCoords);

    const timeline = TIMELINE_STEPS.map((label, i) => ({
      status: label.toLowerCase().replace(/\s+/g, '_'),
      label,
      location: i === 0 ? data.origin : '',
      timestamp: new Date(Date.now() - (TIMELINE_STEPS.length - i) * 86400000),
      completed: i === 0,
      icon: ['box', 'truck', 'plane', 'warehouse', 'customs', 'van', 'check'][i],
    }));

    const shipment = await Shipment.create({
      ...data,
      trackingNumber: trackingNumber.toUpperCase(),
      originCoords,
      destinationCoords: destCoords,
      currentCoords: originCoords,
      route,
      timeline,
      createdBy: req.user._id,
      expectedDelivery: data.expectedDelivery || new Date(Date.now() + 7 * 86400000),
      liveTracking: { isActive: false, isMoving: false, speedKmh: data.speedKmh || 60, progress: 0 },
    });

    await ActivityLog.create({
      userId: req.user._id,
      action: 'create_shipment',
      entity: 'Shipment',
      entityId: shipment._id.toString(),
      details: { trackingNumber },
    });

    res.status(201).json({ shipment });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch('/:id', requireRole('admin', 'staff'), async (req, res) => {
  const shipment = await Shipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!shipment) return res.status(404).json({ message: 'Not found' });
  if (req.body.notifyEmail && shipment.receiverEmail) {
    await sendShipmentUpdate(shipment, shipment.receiverEmail);
  }
  res.json({ shipment });
});

router.patch('/:id/timeline', requireRole('admin', 'staff'), async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) return res.status(404).json({ message: 'Not found' });
  if (req.body.timeline) shipment.timeline = req.body.timeline;
  if (req.body.status) shipment.status = req.body.status;
  if (req.body.statusLabel) shipment.statusLabel = req.body.statusLabel;
  await shipment.save();
  res.json({ shipment });
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  await Shipment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
