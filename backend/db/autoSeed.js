const User = require('../models/User');
const Shipment = require('../models/Shipment');
const { buildGreatCircleRoute } = require('../utils/geo');

async function autoSeedIfEmpty() {
  const count = await User.countDocuments();
  if (count > 0) return;

  console.log('Seeding demo data...');

  const admin = await User.create({
    name: 'P XPRESS Admin',
    email: 'pxpress@gmail.com',
    password: 'xpress12345',
    role: 'admin',
    emailVerified: true,
    phone: '681731512',
  });

  const demo = {
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
    expectedDelivery: new Date('2026-06-04'),
    timeline: [
      { status: 'created', label: 'Shipment Created', location: 'Dubai, UAE', completed: true, icon: 'box' },
      { status: 'customs', label: 'Cleared Customs', location: 'Dubai Intl Airport', completed: true, icon: 'customs' },
      { status: 'in_transit', label: 'Flight Departed', location: 'En route to Europe', completed: true, icon: 'plane' },
      { status: 'at_facility', label: 'Arrived at Transit Hub', location: 'Paris, France', completed: true, icon: 'warehouse' },
      { status: 'in_transit', label: 'In Transit', location: 'Paris, France', completed: false, icon: 'truck' },
      { status: 'delivered', label: 'Delivered', location: 'Yaoundé, Cameroon', completed: false, icon: 'check' },
    ],
    receiverEmail: 'yuhala24@gmail.com',
    route: buildGreatCircleRoute({ lat: 25.2048, lng: 55.2708 }, { lat: 3.848, lng: 11.5021 }, 50),
    createdBy: admin._id,
    liveTracking: { isActive: false, isMoving: false, speedKmh: 80, progress: 0.35 },
  };

  await Shipment.create(demo);
  console.log('Demo ready — Admin: pxpress@gmail.com / xpress12345');
  console.log('Track: PX992381CM');
}

module.exports = { autoSeedIfEmpty };
