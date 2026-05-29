'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { Package, History, User, Headphones } from 'lucide-react';

type Shipment = {
  trackingNumber: string;
  statusLabel: string;
  destination: string;
  expectedDelivery: string;
};

export default function DashboardPage() {
  const { user } = useApp();
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    api<{ shipments: Shipment[] }>('/shipments/my').then((r) => setShipments(r.shipments)).catch(() => {});
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="py-12 max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
      <p className="text-gray-500 mb-8">Customer Shipment Dashboard</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Package, label: 'My Shipments', href: '#shipments' },
          { icon: History, label: 'History', href: '/history' },
          { icon: User, label: 'Profile', href: '/dashboard/profile' },
          { icon: Headphones, label: 'Support', href: '/contact' },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="glass rounded-2xl p-6 card-hover text-center">
            <item.icon className="mx-auto text-orange mb-2" size={32} />
            <p className="font-semibold">{item.label}</p>
          </Link>
        ))}
      </div>

      <div id="shipments" className="glass rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4">Your Shipments</h2>
        {shipments.length === 0 ? (
          <p className="text-gray-500">No shipments linked to your account yet.</p>
        ) : (
          <ul className="space-y-3">
            {shipments.map((s) => (
              <li key={s.trackingNumber} className="flex flex-wrap justify-between items-center border-b py-3 gap-2">
                <span className="font-mono font-bold text-orange">{s.trackingNumber}</span>
                <span>{s.statusLabel}</span>
                <span className="text-sm text-gray-500">{s.destination}</span>
                <Link href={`/track/${s.trackingNumber}`} className="text-orange text-sm font-semibold">
                  Track →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
