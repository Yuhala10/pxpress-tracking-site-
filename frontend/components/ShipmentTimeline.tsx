'use client';

import { motion } from 'framer-motion';
import { Box, Truck, Plane, Warehouse, Shield, Package, CheckCircle } from 'lucide-react';

const icons: Record<string, React.ElementType> = {
  box: Box,
  truck: Truck,
  plane: Plane,
  warehouse: Warehouse,
  customs: Shield,
  van: Package,
  check: CheckCircle,
};

type Event = {
  label: string;
  location?: string;
  timestamp?: string;
  completed?: boolean;
  icon?: string;
};

export default function ShipmentTimeline({ events }: { events: Event[] }) {
  const completedCount = events.filter((e) => e.completed).length;
  const progress = events.length ? (completedCount / events.length) * 100 : 0;

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="w-full bg-orange origin-top"
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
      <ul className="space-y-6">
        {events.map((ev, i) => {
          const Icon = icons[ev.icon || 'box'] || Box;
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 relative pl-2"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shrink-0 ${
                  ev.completed ? 'bg-orange text-white shadow-lg' : 'bg-gray-100 dark:bg-navy-light text-gray-400'
                }`}
              >
                <Icon size={18} />
              </div>
              <div className="pb-2">
                <p className={`font-semibold ${ev.completed ? 'text-navy dark:text-white' : 'text-gray-400'}`}>
                  {ev.label}
                </p>
                {ev.location && <p className="text-sm text-gray-500">{ev.location}</p>}
                {ev.timestamp && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(ev.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
