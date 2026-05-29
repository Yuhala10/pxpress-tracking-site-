'use client';

import { useState } from 'react';
import { Play, Pause, Square, Gauge, MapPin } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { getToken } from '@/lib/api';
import { useApp } from '@/context/AppContext';

type Props = {
  trackingNumber: string;
  onUpdate?: () => void;
};

export default function LiveControlPanel({ trackingNumber, onUpdate }: Props) {
  const { t } = useApp();
  const [speed, setSpeed] = useState(60);
  const [progress, setProgress] = useState(35);
  const [status, setStatus] = useState('');
  const [moving, setMoving] = useState(false);

  const control = (action: string, extra: Record<string, unknown> = {}) => {
    const socket = getSocket();
    const token = getToken();
    socket.emit(
      'admin:live-control',
      { token, trackingNumber, action, speedKmh: speed, progress: progress / 100, ...extra },
      (res: { ok?: boolean; error?: string; isMoving?: boolean }) => {
        if (res?.error) setStatus(`Error: ${res.error}`);
        else {
          setStatus(`✓ ${action}`);
          if (res?.isMoving !== undefined) setMoving(res.isMoving);
          onUpdate?.();
        }
      }
    );
  };

  return (
    <div className="glass rounded-2xl p-6 border-2 border-orange/30">
      <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-orange">
        <MapPin size={20} /> {t('admin.live')}
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Control movement invisibly — trackers only see the package moving or stopped on the map.
      </p>
      <p className="font-mono text-sm mb-4 bg-navy/5 dark:bg-white/5 p-2 rounded">{trackingNumber}</p>

      <div className="mb-4">
        <label className="text-sm font-medium flex items-center gap-2 mb-2">
          <Gauge size={16} /> {t('admin.speed')}: {speed} km/h
        </label>
        <input
          type="range"
          min={10}
          max={500}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full accent-orange"
        />
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">Route Progress: {progress}%</label>
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full accent-orange"
        />
        <button
          type="button"
          onClick={() => control('set-progress', { progress: progress / 100 })}
          className="mt-2 text-xs text-orange font-semibold hover:underline"
        >
          Apply position on route
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => control('start')}
          className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          <Play size={18} /> {t('admin.start')}
        </button>
        <button
          type="button"
          onClick={() => control('resume')}
          className="flex items-center justify-center gap-2 py-3 bg-sky text-white rounded-xl font-semibold hover:opacity-90 transition-colors"
        >
          <Play size={18} /> Resume
        </button>
        <button
          type="button"
          onClick={() => control('pause')}
          className="flex items-center justify-center gap-2 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
        >
          <Pause size={18} /> Pause
        </button>
        <button
          type="button"
          onClick={() => control('stop')}
          className="flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
        >
          <Square size={18} /> {t('admin.stop')}
        </button>
      </div>

      <button
        type="button"
        onClick={() => control('set-speed')}
        className="w-full mt-2 py-2 border border-orange text-orange rounded-xl text-sm font-semibold hover:bg-orange/10 transition-colors"
      >
        Update Speed Only
      </button>

      {status && <p className="text-xs mt-3 text-gray-500">{status}</p>}
      {moving && (
        <p className="text-xs mt-2 text-green-600 font-bold animate-pulse">● Package is moving on map</p>
      )}
    </div>
  );
}
