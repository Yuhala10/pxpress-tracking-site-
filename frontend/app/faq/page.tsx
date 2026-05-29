'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'How do I track my shipment?', a: 'Enter your tracking number on the homepage or Track page. You will see real-time status, timeline, and live map.' },
  { q: 'What is the tracking number format?', a: 'P XPRESS uses formats like PX829301US or PXP839201UK — PX + digits + country code.' },
  { q: 'How long does international delivery take?', a: 'Express air: 3–7 business days. Ocean freight: 15–45 days depending on route.' },
  { q: 'Do you offer customs clearance?', a: 'Yes, we handle customs documentation and clearance for all supported corridors.' },
  { q: 'How do I contact support?', a: 'Call 681731512 or email yuhala24@gmail.com — available 24/7.' },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="py-16 max-w-3xl mx-auto px-4">
      <h1 className="section-title text-center mb-12">FAQs</h1>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="glass rounded-xl overflow-hidden">
            <button
              className="w-full flex justify-between items-center p-5 text-left font-semibold"
              onClick={() => setOpen(open === i ? null : i)}
            >
              {f.q}
              <ChevronDown className={`transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 pb-5 text-gray-600 dark:text-gray-300 text-sm"
                >
                  {f.a}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
