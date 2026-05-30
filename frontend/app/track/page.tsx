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
    </div>
  );
}
