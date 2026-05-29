'use client';

import { useSearchParams } from 'next/navigation';
import TrackingBar from '@/components/TrackingBar';

export default function LivePage() {
  const params = useSearchParams();
  const tn = params.get('n');
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 text-center">
      <h1 className="section-title mb-4">Live Tracking</h1>
      <p className="text-gray-600 mb-8">Full-screen real-time map tracking</p>
      <TrackingBar large />
      {tn && (
        <a href={`/track/${tn}`} className="btn-primary mt-8 inline-block">
          Open {tn}
        </a>
      )}
    </div>
  );
}
