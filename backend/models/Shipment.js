const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  label: String,
  location: String,
  timestamp: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  icon: String,
});

const shipmentSchema = new mongoose.Schema(
  {
    trackingNumber: { type: String, required: true, unique: true, uppercase: true },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    senderEmail: String,
    receiverEmail: String,
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    originCountry: String,
    destinationCountry: String,
    originCoords: { lat: Number, lng: Number },
    destinationCoords: { lat: Number, lng: Number },
    currentLocation: { type: String, default: '' },
    currentCoords: { lat: Number, lng: Number },
    status: {
      type: String,
      enum: [
        'created',
        'picked_up',
        'in_transit',
        'at_facility',
        'customs',
        'out_for_delivery',
        'delivered',
        'on_hold',
      ],
      default: 'created',
    },
    statusLabel: { type: String, default: 'Shipment Created' },
    weight: { type: String, default: '2.5 kg' },
    shippingMethod: { type: String, default: 'Air Freight' },
    shipmentType: { type: String, default: 'Standard' },
    dispatchDate: { type: Date, default: Date.now },
    expectedDelivery: Date,
    deliveredAt: Date,
    timeline: [timelineEventSchema],
    route: [{ lat: Number, lng: Number }],
    liveTracking: {
      isActive: { type: Boolean, default: false },
      isMoving: { type: Boolean, default: false },
      speedKmh: { type: Number, default: 50 },
      progress: { type: Number, default: 0 },
      heading: { type: Number, default: 0 },
    },
    proofOfDelivery: { url: String, uploadedAt: Date },
    invoiceUrl: String,
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String,
  },
  { timestamps: true }
);

shipmentSchema.index({ trackingNumber: 1 });
shipmentSchema.index({ customerId: 1 });
shipmentSchema.index({ status: 1 });

module.exports = mongoose.model('Shipment', shipmentSchema);
