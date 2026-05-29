const express = require('express');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { v4: uuidv4 } = require('uuid');
const ActivityLog = require('../models/ActivityLog');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

router.post(
  '/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      const user = await User.create({
        name,
        email,
        password,
        phone: phone || '',
        role: 'customer',
        verificationToken: uuidv4(),
      });
      await ActivityLog.create({ userId: user._id, action: 'register', entity: 'User' });
      const token = signToken(user);
      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        message: 'Account created. Please verify your email.',
      });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = signToken(user);
      await ActivityLog.create({ userId: user._id, action: 'login', entity: 'User' });
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          language: user.language,
          darkMode: user.darkMode,
        },
      });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
);

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

router.patch('/me', auth, async (req, res) => {
  const { name, phone, language, darkMode, addresses } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (language) user.language = language;
  if (darkMode !== undefined) user.darkMode = darkMode;
  if (addresses) user.addresses = addresses;
  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.post('/forgot-password', [body('email').isEmail()], validate, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    user.resetPasswordToken = uuidv4();
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
  }
  res.json({ message: 'If that email exists, a reset link was sent.' });
});

router.post(
  '/reset-password',
  [body('token').notEmpty(), body('password').isLength({ min: 6 })],
  validate,
  async (req, res) => {
    const user = await User.findOne({
      resetPasswordToken: req.body.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  }
);

module.exports = router;
