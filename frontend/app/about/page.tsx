'use client';

import { motion } from 'framer-motion';
import { CONTACT } from '@/lib/api';

export default function AboutPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title mb-6">About P XPRESS</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
          P XPRESS is a premium international logistics company delivering fast, secure, and reliable
          worldwide shipping. From air freight to door-to-door delivery, we provide enterprise-grade
          tracking transparency trusted by businesses globally.
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Our platform powers real-time shipment visibility, customs clearance coordination, and
          customer dashboards — built to the standards of world-class carriers.
        </p>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold mb-4">Contact Headquarters</h2>
          <p>Phone: <a href={`tel:${CONTACT.phone}`} className="text-orange">{CONTACT.phone}</a></p>
          <p>Email: <a href={`mailto:${CONTACT.email}`} className="text-orange">{CONTACT.email}</a></p>
        </div>
      </motion.div>
    </div>
  );
}
