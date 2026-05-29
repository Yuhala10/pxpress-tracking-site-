'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plane, Ship, Zap, Package, ShoppingCart, Warehouse, Globe, Truck } from 'lucide-react';

const services = [
  { icon: Plane, title: 'Air Freight', desc: 'Priority global air cargo with real-time tracking and customs coordination.' },
  { icon: Ship, title: 'Ocean Freight', desc: 'Full-container and LCL shipping with port-to-port visibility.' },
  { icon: Zap, title: 'Express Delivery', desc: 'Time-definite express for urgent international consignments.' },
  { icon: Package, title: 'Cargo Handling', desc: 'Professional loading, securing, and transfer at hubs worldwide.' },
  { icon: ShoppingCart, title: 'E-Commerce Delivery', desc: 'Last-mile fulfillment integrated with major marketplaces.' },
  { icon: Warehouse, title: 'Warehouse Solutions', desc: 'Bonded storage, pick-pack, and inventory management.' },
  { icon: Globe, title: 'International Shipping', desc: 'Door-to-port and door-to-door across 150+ countries.' },
  { icon: Truck, title: 'Door-to-Door Delivery', desc: 'Complete pickup and delivery with proof of delivery.' },
];

export default function ServicesPage() {
  return (
    <div className="py-16 max-w-7xl mx-auto px-4">
      <h1 className="section-title text-center mb-4">Our Services</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
        Enterprise logistics solutions designed for speed, security, and global reach.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-6 card-hover"
          >
            <s.icon className="text-orange mb-4" size={36} />
            <h2 className="font-bold text-lg mb-2">{s.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{s.desc}</p>
            <Link href="/pricing" className="text-orange text-sm font-semibold hover:underline">
              Get a quote →
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
