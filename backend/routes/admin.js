const express = require('express');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(auth, requireRole('admin', 'staff'));

router.get('/users', async (_req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ users });
});

router.post('/users', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.patch('/users/:id', async (req, res) => {
  const { name, role, phone } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  if (name) user.name = name;
  if (role) user.role = role;
  if (phone) user.phone = phone;
  await user.save();
  res.json({ user });
});

router.delete('/users/:id', requireRole('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

router.get('/activity', async (_req, res) => {
  const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100).populate('userId', 'name email');
  res.json({ logs });
});

module.exports = router;
