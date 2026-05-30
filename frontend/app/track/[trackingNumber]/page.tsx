'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import LiveMap from '@/components/LiveMap';
import { getSocket } from '@/lib/socket';
import ShipmentTimeline from '@/components/ShipmentTimeline';
import Link from 'next/link';
import { MapPin, Package, Calendar, Weight, Truck } from 'lucide-react';

type Shipment = {
  trackingNumber: string;
  sender: string;
  receiver: string;
  origin: string;
  destination: string;
  originCountry?: string;
  destinationCountry?: string;
  currentLocation: string;
  statusLabel: string;
  status: string;
  weight: string;
  shippingMethod: string;
  shipmentType: string;
  dispatchDate: string;
  expectedDelivery: string;
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  currentCoords?: { lat: number; lng: number };
  route?: { lat: number; lng: number }[];
  timeline: { label: string; location?: string; timestamp?: string; completed?: boolean; icon?: string }[];
  liveTracking?: { isMoving?: boolean; heading?: number; progress?: number };
};

export default function TrackingResultPage() {
  const params = useParams();
  const tn = (params.trackingNumber as string)?.toUpperCase();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [error, setError] = useState('');
  const [live, setLive] = useState<{ coords?: { lat: number; lng: number }; heading?: number; moving?: boolean; location?: string }>({});

  const load = useCallback(() => {
    setError('');
    api<{ shipment: Shipment }>(`/shipments/track/${encodeURIComponent(tn)}`)
      .then((r) => setShipment(r.shipment))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : '';
        if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
          setError('Cannot reach tracking server. Check site configuration.');
        } else {
          setError(msg || 'Shipment not found');
        }
      });
  }, [tn]);

  useEffect(() => {
    load();
    if (typeof window !== 'undefined' && tn) {
      const hist: string[] = JSON.parse(localStorage.getItem('px_track_history') || '[]');
      if (!hist.includes(tn)) {
        hist.unshift(tn);
        localStorage.setItem('px_track_history', JSON.stringify(hist.slice(0, 20)));
      }
    }
  }, [load, tn]);

  useEffect(() => {
    if (!tn) return;
    const socket = getSocket();
    socket.emit('track:subscribe', { trackingNumber: tn });
    socket.on('shipment:update', (data: {
      trackingNumber: string;
      currentCoords?: { lat: number; lng: number };
      heading?: number;
      isMoving?: boolean;
      currentLocation?: string;
      statusLabel?: string;
    }) => {
      if (data.trackingNumber?.toUpperCase() !== tn) return;
      setLive({
        coords: data.currentCoords,
        heading: data.heading,
        moving: data.isMoving,
        location: data.currentLocation,
      });
      setShipment((prev) =>
        prev
          ? {
              ...prev,
              currentCoords: data.currentCoords || prev.currentCoords,
              currentLocation: data.currentLocation || prev.currentLocation,
              statusLabel: data.statusLabel || prev.statusLabel,
              liveTracking: {
                ...prev.liveTracking,
                isMoving: data.isMoving,
                heading: data.heading,
              },
            }
          : prev
      );
    });
    return () => {
      socket.emit('track:unsubscribe', { trackingNumber: tn });
      socket.off('shipment:update');
    };
  }, [tn]);

  if (error)
    return (
      <div className="py-20 text-center px-4">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <Link href="/track" className="btn-primary">
          Try Again
        </Link>
      </div>
    );

  if (!shipment) return <div className="py-20 text-center">Loading shipment...</div>;

  const coords = live.coords || shipment.currentCoords;
  const moving = live.moving ?? shipment.liveTracking?.isMoving;

  return (
    <div className="py-12 max-w-6xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-gray-500">Tracking Number</p>
            <h1 className="text-2xl md:text-3xl font-mono font-bold text-navy dark:text-white">{shipment.trackingNumber}</h1>
          </div>
          <span className="px-4 py-2 rounded-full bg-orange/10 text-orange font-bold text-sm">
            {shipment.statusLabel}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <LiveMap
              trackingNumber={shipment.trackingNumber}
              originCoords={shipment.originCoords}
              destinationCoords={shipment.destinationCoords}
              currentCoords={coords}
              route={shipment.route}
              heading={live.heading ?? shipment.liveTracking?.heading}
              isMoving={moving}
            />
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <MapPin size={16} className="text-orange" />
              Current: <strong>{live.location || shipment.currentLocation}</strong>
              {moving && <span className="text-green-600 font-semibold ml-2">● Live</span>}
            </p>

            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-6">Shipment Timeline</h2>
              <ShipmentTimeline events={shipment.timeline} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-lg border-b pb-3">Shipment Details</h2>
              {[
                ['Sender', shipment.sender],
                ['Receiver', shipment.receiver],
                ['Origin', `${shipment.origin} (${shipment.originCountry || ''})`],
                ['Destination', `${shipment.destination} (${shipment.destinationCountry || ''})`],
                ['Weight', shipment.weight],
                ['Method', shipment.shippingMethod],
                ['Type', shipment.shipmentType],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm gap-2">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-right">{v}</span>
                </div>
              ))}
              <div className="pt-3 border-t space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Calendar size={16} className="text-orange" />
                  Dispatch: {new Date(shipment.dispatchDate).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <Package size={16} className="text-orange" />
                  ETA: {new Date(shipment.expectedDelivery).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Link href="/live" className="btn-navy w-full text-center block">
              Full Live View
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
