require('dotenv').config();
const User = require('./models/User');
const { connectDB } = require('./db/connect');
const Shipment = require('./models/Shipment');
const { buildGreatCircleRoute } = require('./utils/geo');

async function seed() {
  await connectDB();
  console.log('Seeding P XPRESS database...');

  await User.deleteMany({ email: { $in: ['pxpress@gmail.com', 'demo@pxpress.com'] } });

  const admin = await User.create({
    name: 'P XPRESS Admin',
    email: 'pxpress@gmail.com',
    password: 'xpress12345',
    role: 'admin',
    emailVerified: true,
    phone: '681731512',
  });

  await User.create({
    name: 'Demo Customer',
    email: 'demo@pxpress.com',
    password: 'customer123',
    role: 'customer',
    emailVerified: true,
  });

  const demos = [
    {
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
        { status: 'out_for_delivery', label: 'Out for Delivery', location: 'Yaoundé', completed: false, icon: 'van' },
        { status: 'delivered', label: 'Delivered', location: 'Yaoundé, Cameroon', completed: false, icon: 'check' },
      ],
    },
    {
      trackingNumber: 'PX4839201CM',
      sender: 'Tech Export Inc.',
      receiver: 'Douala Electronics',
      origin: 'Shanghai, China',
      destination: 'Douala, Cameroon',
      originCountry: 'China',
      destinationCountry: 'Cameroon',
      originCoords: { lat: 31.2304, lng: 121.4737 },
      destinationCoords: { lat: 4.0511, lng: 9.7679 },
      currentLocation: 'Istanbul, Turkey',
      currentCoords: { lat: 41.0082, lng: 28.9784 },
      status: 'customs',
      statusLabel: 'Customs Clearance',
      weight: '120 kg',
      shippingMethod: 'Ocean + Air',
      shipmentType: 'Express',
      expectedDelivery: new Date('2026-06-12'),
    },
    {
      trackingNumber: 'PXP992018US',
      sender: 'American Auto Parts',
      receiver: 'European Motors GmbH',
      origin: 'Los Angeles, USA',
      destination: 'Berlin, Germany',
      originCountry: 'USA',
      destinationCountry: 'Germany',
      originCoords: { lat: 34.0522, lng: -118.2437 },
      destinationCoords: { lat: 52.52, lng: 13.405 },
      currentLocation: 'New York, USA',
      currentCoords: { lat: 40.7128, lng: -74.006 },
      status: 'picked_up',
      statusLabel: 'Picked Up',
      weight: '8.5 kg',
      shippingMethod: 'Express Delivery',
      shipmentType: 'Priority',
      expectedDelivery: new Date('2026-06-08'),
    },
    {
      trackingNumber: 'PX772918EU',
      sender: 'Paris Fashion House',
      receiver: 'London Boutique Ltd',
      origin: 'Paris, France',
      destination: 'London, UK',
      originCountry: 'France',
      destinationCountry: 'UK',
      originCoords: { lat: 48.8566, lng: 2.3522 },
      destinationCoords: { lat: 51.5074, lng: -0.1278 },
      currentLocation: 'Calais, France',
      currentCoords: { lat: 50.9513, lng: 1.8587 },
      status: 'out_for_delivery',
      statusLabel: 'Out for Delivery',
      weight: '3.2 kg',
      shippingMethod: 'Road Freight',
      shipmentType: 'Standard',
      expectedDelivery: new Date('2026-05-31'),
    },
  ];

  await Shipment.deleteMany({ trackingNumber: { $in: demos.map((d) => d.trackingNumber) } });

  for (const d of demos) {
    const route = buildGreatCircleRoute(d.originCoords, d.destinationCoords, 50);
    await Shipment.create({
      ...d,
      route,
      createdBy: admin._id,
      liveTracking: { isActive: false, isMoving: false, speedKmh: 80, progress: 0.35 },
      receiverEmail: 'yuhala24@gmail.com',
    });
  }

  console.log('✅ Seed complete!');
  console.log('Admin login: pxpress@gmail.com / xpress12345');
  console.log('Demo tracking: PX992381CM, PX4839201CM, PXP992018US, PX772918EU');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
