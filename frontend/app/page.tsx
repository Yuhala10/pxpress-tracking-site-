'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import TrackingBar from '@/components/TrackingBar';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import {
  Plane,
  Truck,
  Globe,
  Shield,
  Clock,
  Headphones,
  Package,
  Ship,
  Zap,
  Warehouse,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react';

const slogans = [
  'Fast. Secure. Reliable.',
  'Delivering Trust Worldwide',
  'Global Logistics Made Simple',
  'Track Every Move',
  'Worldwide Shipping Excellence',
];

const services = [
  { icon: Plane, title: 'Air Freight', desc: 'Express global air cargo with priority handling.' },
  { icon: Ship, title: 'Ocean Freight', desc: 'Cost-effective container shipping worldwide.' },
  { icon: Zap, title: 'Express Delivery', desc: 'Same-day and next-day premium delivery.' },
  { icon: Package, title: 'Cargo Handling', desc: 'Secure warehousing and cargo management.' },
  { icon: ShoppingCart, title: 'E-Commerce Delivery', desc: 'Fulfillment for online retailers globally.' },
  { icon: Warehouse, title: 'Warehouse Solutions', desc: 'Storage, inventory, and distribution.' },
  { icon: Globe, title: 'International Shipping', desc: 'Cross-border logistics with customs support.' },
  { icon: Truck, title: 'Door-to-Door Delivery', desc: 'End-to-end pickup and final-mile delivery.' },
];

function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / 60);
    const t = setInterval(() => {
      start += step;
      if (start >= end) {
        setN(end);
        clearInterval(t);
      } else setN(start);
    }, 30);
    return () => clearInterval(t);
  }, [end]);
  return (
    <span>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function HomePage() {
  const { t } = useApp();
  const [sloganIdx, setSloganIdx] = useState(0);
  const [stats, setStats] = useState({ totalShipments: 12847, inTransit: 3421, countries: 156, onTimeRate: 98.7 });

  useEffect(() => {
    const i = setInterval(() => setSloganIdx((p) => (p + 1) % slogans.length), 4000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    api<{ stats: typeof stats }>('/shipments/public/stats').then((r) => setStats(r.stats)).catch(() => {});
  }, []);

  return (
    <>
      <section className="relative bg-hero-gradient text-white overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200')] bg-cover bg-center" />
        </div>
        <div className="absolute top-20 right-10 text-6xl animate-plane opacity-80">✈️</div>
        <div className="absolute bottom-32 left-10 text-5xl animate-truck opacity-80">🚛</div>
        <div className="absolute top-1/3 right-1/4 text-4xl animate-float opacity-60">📦</div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.p
              key={sloganIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-orange font-semibold mb-4 text-lg"
            >
              {slogans[sloganIdx]}
            </motion.p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">{t('hero.title')}</h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-8">{t('hero.sub')}</p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/track" className="btn-primary">
                {t('hero.track')}
              </Link>
              <Link href="/pricing" className="btn-outline">
                {t('hero.quote')}
              </Link>
            </div>
            <TrackingBar large />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { label: t('stats.shipments'), val: stats.totalShipments },
              { label: t('stats.active'), val: stats.inTransit },
              { label: t('stats.countries'), val: stats.countries },
              { label: t('stats.onTime'), val: stats.onTimeRate, suffix: '%' },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="glass-dark rounded-2xl p-4 text-center card-hover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <p className="text-2xl md:text-3xl font-bold text-orange">
                  <Counter end={s.val} suffix={s.suffix || ''} />
                </p>
                <p className="text-xs md:text-sm text-gray-300 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-navy-dark">
        <div className="max-w-3xl mx-auto px-4">
          <TrackingBar />
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4">
        <h2 className="section-title text-center mb-12">{t('services.title')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              className="glass rounded-2xl p-6 card-hover group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="w-14 h-14 rounded-xl bg-orange/10 flex items-center justify-center mb-4 group-hover:bg-orange group-hover:text-white group-hover:scale-110 group-hover:shadow-lg transition-all duration-200">
                <s.icon className="text-orange group-hover:text-white transition-colors duration-200" size={28} />
              </div>
              <h3 className="font-bold text-navy dark:text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{s.desc}</p>
              <Link href="/services" className="text-orange text-sm font-semibold flex items-center gap-1 group-hover:gap-3 group-hover:underline transition-all duration-200">
                Learn More <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('about.title')}</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              P XPRESS is a premium international logistics platform delivering enterprise-grade shipment tracking,
              air and ocean freight, and door-to-door solutions across 150+ countries.
            </p>
            <Link href="/about" className="btn-primary">
              About P XPRESS
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['24/7 Tracking', 'Customs Expertise', 'Insurance Options', 'Real-Time Alerts'].map((item) => (
              <div key={item} className="glass-dark rounded-xl p-4 text-center font-medium card-hover cursor-default">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4">
        <h2 className="section-title text-center mb-12">{t('why.title')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: 'Secure Handling', desc: 'End-to-end chain of custody and verified delivery.' },
            { icon: Clock, title: 'On-Time Delivery', desc: '98.7% on-time performance across global routes.' },
            { icon: Headphones, title: '24/7 Support', desc: 'Dedicated logistics experts when you need them.' },
          ].map((w) => (
            <div key={w.title} className="text-center p-8 rounded-2xl border border-gray-100 dark:border-white/10 card-hover cursor-default group">
              <w.icon className="mx-auto text-orange mb-4 group-hover:scale-110 transition-transform duration-200" size={40} />
              <h3 className="font-bold text-lg mb-2">{w.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-navy-light/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="section-title text-center mb-12">{t('testimonials.title')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              'P XPRESS delivered our shipment faster than expected with full tracking transparency.',
              'Enterprise-grade platform. Our team tracks hundreds of consignments daily without issues.',
              'Customs clearance was seamless. Real-time map tracking gave our clients complete confidence.',
            ].map((quote, i) => (
              <blockquote key={i} className="glass rounded-2xl p-6 card-hover">
                <p className="text-gray-600 dark:text-gray-300 italic mb-4">&ldquo;{quote}&rdquo;</p>
                <p className="font-semibold text-navy dark:text-white">— Client {i + 1}</p>
              </blockquote>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/testimonials" className="text-orange font-semibold hover:underline hover:scale-105 inline-block transition-all duration-200">
              View all testimonials →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-xl mx-auto px-4" id="quote">
        <h2 className="section-title text-center mb-8">{t('quote.title')}</h2>
        <QuoteFormMini />
      </section>

      <section className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-12 opacity-50 grayscale">
          {['DHL Style', 'FedEx Grade', 'UPS Level', 'Maersk', 'CMA CGM'].map((p) => (
            <span key={p} className="font-bold text-xl text-navy dark:text-white">
              {p}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

function QuoteFormMini() {
  const { t } = useApp();
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await api('/quotes', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      setOk(true);
      e.currentTarget.reset();
    } catch {
      alert('Failed to submit. Is the backend running?');
    }
    setLoading(false);
  };

  if (ok)
    return (
      <p className="text-center text-green-600 font-semibold p-8 glass rounded-2xl">
        Quote request submitted! We will contact you at yuhala24@gmail.com
      </p>
    );

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-8 space-y-4">
      <input name="name" required placeholder="Full Name" className="w-full px-4 py-3 rounded-xl border dark:bg-navy-light dark:border-white/10" />
      <input name="email" type="email" required placeholder="Email" defaultValue="yuhala24@gmail.com" className="w-full px-4 py-3 rounded-xl border dark:bg-navy-light dark:border-white/10" />
      <input name="phone" required placeholder="Phone" defaultValue="681731512" className="w-full px-4 py-3 rounded-xl border dark:bg-navy-light dark:border-white/10" />
      <select name="shipmentType" className="w-full px-4 py-3 rounded-xl border dark:bg-navy-light dark:border-white/10">
        <option>Air Freight</option>
        <option>Ocean Freight</option>
        <option>Express</option>
      </select>
      <input name="weight" required placeholder="Weight" className="w-full px-4 py-3 rounded-xl border dark:bg-navy-light dark:border-white/10" />
      <input name="destination" required placeholder="Destination" className="w-full px-4 py-3 rounded-xl border dark:bg-navy-light dark:border-white/10" />
      <textarea name="message" placeholder="Message" rows={3} className="w-full px-4 py-3 rounded-xl border dark:bg-navy-light dark:border-white/10" />
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Sending...' : t('quote.submit')}
      </button>
    </form>
  );
}
