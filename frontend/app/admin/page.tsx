'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { api, CONTACT } from '@/lib/api';
import LiveControlPanel from '@/components/admin/LiveControlPanel';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Trash2, RefreshCw } from 'lucide-react';

type Shipment = {
  _id: string;
  trackingNumber: string;
  sender: string;
  receiver: string;
  status: string;
  statusLabel: string;
  origin: string;
  destination: string;
};

const COLORS = ['#FF7A00', '#0B1E3D', '#38BDF8', '#10B981', '#8B5CF6'];

export default function AdminPage() {
  const { user } = useApp();
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [quotes, setQuotes] = useState<{ _id: string; name: string; email: string; destination: string }[]>([]);
  const [selected, setSelected] = useState('');
  const [analytics, setAnalytics] = useState<{ statuses: { _id: string; count: number }[]; last7: { _id: string; count: number }[] } | null>(null);
  const [newTn, setNewTn] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/admin');
      return;
    }
    if (user.role !== 'admin' && user.role !== 'staff') {
      router.push('/dashboard');
      return;
    }
    load();
  }, [user, router]);

  const load = async () => {
    const [s, q, a] = await Promise.all([
      api<{ shipments: Shipment[] }>('/shipments'),
      api<{ quotes: typeof quotes }>('/quotes'),
      api<{ statuses: { _id: string; count: number }[]; last7: { _id: string; count: number }[] }>('/shipments/analytics'),
    ]);
    setShipments(s.shipments);
    setQuotes(q.quotes);
    setAnalytics(a);
    if (s.shipments[0] && !selected) setSelected(s.shipments[0].trackingNumber);
  };

  const generateTracking = async () => {
    const r = await api<{ trackingNumber: string }>('/shipments/generate-tracking', { method: 'POST' });
    setNewTn(r.trackingNumber);
  };

  const createShipment = async () => {
    const tn = newTn || undefined;
    await api('/shipments', {
      method: 'POST',
      body: JSON.stringify({
        trackingNumber: tn,
        sender: 'P XPRESS Hub',
        receiver: 'Customer',
        origin: 'Dubai, UAE',
        destination: 'Yaoundé, Cameroon',
        originCoords: { lat: 25.2048, lng: 55.2708 },
        destinationCoords: { lat: 3.848, lng: 11.5021 },
        currentLocation: 'Dubai, UAE',
        status: 'in_transit',
        statusLabel: 'In Transit',
        speedKmh: 80,
      }),
    });
    setNewTn('');
    load();
  };

  const deleteShipment = async (id: string) => {
    if (!confirm('Delete shipment?')) return;
    await api(`/shipments/${id}`, { method: 'DELETE' });
    load();
  };

  if (!user) return null;

  const pieData = analytics?.statuses.map((s) => ({ name: s._id, value: s.count })) || [];

  return (
    <div className="py-10 max-w-7xl mx-auto px-4">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">
            Support: {CONTACT.phone} · {CONTACT.email}
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-orange font-semibold">
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6 lg:col-span-2 h-64">
          <h3 className="font-bold mb-4">Shipments (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={analytics?.last7 || []}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#FF7A00" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-2xl p-6 h-64">
          <h3 className="font-bold mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex flex-wrap gap-3 mb-4">
              <button onClick={generateTracking} className="btn-primary text-sm py-2">
                Generate Tracking #
              </button>
              <input
                value={newTn}
                onChange={(e) => setNewTn(e.target.value)}
                placeholder="PX829301US"
                className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border dark:bg-navy-light"
              />
              <button onClick={createShipment} className="btn-navy text-sm py-2 flex items-center gap-1">
                <Plus size={16} /> Create Shipment
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2">Tracking</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr
                      key={s._id}
                      className={`border-b cursor-pointer hover:bg-orange/5 ${selected === s.trackingNumber ? 'bg-orange/10' : ''}`}
                      onClick={() => setSelected(s.trackingNumber)}
                    >
                      <td className="py-3 font-mono font-bold text-orange">{s.trackingNumber}</td>
                      <td>
                        {s.origin} → {s.destination}
                      </td>
                      <td>{s.statusLabel}</td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteShipment(s._id);
                          }}
                          className="text-red-500 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold mb-4">Quote Requests</h3>
            <ul className="space-y-2 text-sm">
              {quotes.slice(0, 10).map((q) => (
                <li key={q._id} className="flex justify-between border-b py-2">
                  <span>
                    {q.name} — {q.destination}
                  </span>
                  <a href={`mailto:${q.email}`} className="text-orange">
                    {q.email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {selected && <LiveControlPanel trackingNumber={selected} onUpdate={load} />}
          {selected && (
            <div className="glass rounded-2xl p-4 text-sm">
              <p className="font-semibold mb-2">Share with customer:</p>
              <code className="block bg-navy/5 p-2 rounded text-xs break-all">
                {typeof window !== 'undefined' ? window.location.origin : ''}/track/{selected}
              </code>
              <Link href={`/track/${selected}`} target="_blank" className="text-orange text-xs mt-2 inline-block hover:underline">
                Open tracking page →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
