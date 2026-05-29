const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    shipmentType: { type: String, required: true },
    weight: { type: String, required: true },
    destination: { type: String, required: true },
    origin: { type: String, default: '' },
    message: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'reviewed', 'quoted', 'closed'], default: 'pending' },
    adminNotes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quote', quoteSchema);
