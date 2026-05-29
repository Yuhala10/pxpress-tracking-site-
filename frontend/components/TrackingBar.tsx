'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';

export default function TrackingBar({ large = false }: { large?: boolean }) {
  const router = useRouter();
  const { t } = useApp();
  const [num, setNum] = useState('');

  const track = (e: React.FormEvent) => {
    e.preventDefault();
    if (!num.trim()) return;
    router.push(`/track/${encodeURIComponent(num.trim().toUpperCase())}`);
  };

  return (
    <motion.form
      onSubmit={track}
      className={`flex flex-col sm:flex-row gap-3 ${large ? 'max-w-2xl' : 'max-w-xl'} w-full mx-auto`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          value={num}
          onChange={(e) => setNum(e.target.value)}
          placeholder={t('track.placeholder')}
          className={`w-full pl-12 pr-4 rounded-xl border-2 border-gray-200 dark:border-white/20 focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all dark:bg-navy-light dark:text-white ${
            large ? 'py-4 text-lg' : 'py-3'
          }`}
        />
      </div>
      <button type="submit" className={`btn-primary whitespace-nowrap ${large ? 'py-4 px-8 text-lg' : ''}`}>
        {t('track.button')}
      </button>
    </motion.form>
  );
}
