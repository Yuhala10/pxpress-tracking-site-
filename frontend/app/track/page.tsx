'use client';

import TrackingBar from '@/components/TrackingBar';
import { useApp } from '@/context/AppContext';

export default function TrackPage() {
  const { t } = useApp();
  return (
    <div className="py-20 max-w-4xl mx-auto px-4 text-center">
      <h1 className="section-title mb-4">{t('nav.track')}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-10">
        Enter your tracking number to view real-time status, timeline, and live map.
      </p>
      <TrackingBar large />
      <div className="mt-12 grid sm:grid-cols-3 gap-4 text-left">
        {['PX992381CM', 'PX4839201CM', 'PXP992018US'].map((n) => (
          <a
            key={n}
            href={`/track/${n}`}
            className="glass rounded-xl p-4 hover:border-orange border-2 border-transparent transition-all card-hover"
          >
            <p className="font-mono font-bold text-orange">{n}</p>
            <p className="text-sm text-gray-500 mt-1">Demo shipment →</p>
          </a>
        ))}
      </div>
    </div>
  );
}
