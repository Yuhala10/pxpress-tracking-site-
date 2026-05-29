const express = require('express');
const { body } = require('express-validator');
const Quote = require('../models/Quote');
const validate = require('../middleware/validate');
const { auth, requireRole } = require('../middleware/auth');
const { notifyAdminQuote } = require('../services/emailService');

const router = express.Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('phone').trim().notEmpty(),
    body('shipmentType').trim().notEmpty(),
    body('weight').trim().notEmpty(),
    body('destination').trim().notEmpty(),
  ],
  validate,
  async (req, res) => {
    try {
      const quote = await Quote.create(req.body);
      await notifyAdminQuote(quote);
      res.status(201).json({ message: 'Quote request submitted', quote });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
);

router.get('/', auth, requireRole('admin', 'staff'), async (_req, res) => {
  const quotes = await Quote.find().sort({ createdAt: -1 });
  res.json({ quotes });
});

router.patch('/:id', auth, requireRole('admin', 'staff'), async (req, res) => {
  const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ quote });
});

module.exports = router;
