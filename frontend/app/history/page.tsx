'use client';

import Link from 'next/link';
import TrackingBar from '@/components/TrackingBar';

export default function HistoryPage() {
  const history =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('px_track_history') || '[]')
      : [];

  return (
    <div className="py-16 max-w-3xl mx-auto px-4">
      <h1 className="section-title text-center mb-8">Shipment Search History</h1>
      <TrackingBar />
      {history.length > 0 ? (
        <ul className="mt-8 space-y-2">
          {history.map((tn: string) => (
            <li key={tn}>
              <Link href={`/track/${tn}`} className="text-orange font-mono hover:underline">
                {tn}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 mt-8">Track a shipment to build your history.</p>
      )}
    </div>
  );
}
