'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

export type ShipmentMapData = {
  trackingNumber: string;
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  currentCoords?: { lat: number; lng: number };
  route?: { lat: number; lng: number }[];
  heading?: number;
  isMoving?: boolean;
};

const MapInner = dynamic(() => import('./LiveMapInner'), { ssr: false, loading: () => (
  <div className="map-shell map-canvas bg-gray-100 dark:bg-navy-light rounded-2xl animate-pulse flex items-center justify-center text-gray-500">
    Loading map...
  </div>
)});

export default function LiveMap(props: ShipmentMapData) {
  const [pos, setPos] = useState(props.currentCoords);
  const [heading, setHeading] = useState(props.heading ?? 0);
  const [moving, setMoving] = useState(props.isMoving ?? false);

  useEffect(() => {
    setPos(props.currentCoords);
    setHeading(props.heading ?? 0);
    setMoving(props.isMoving ?? false);
  }, [props.currentCoords, props.heading, props.isMoving]);

  return (
    <MapInner
      {...props}
      currentCoords={pos}
      heading={heading}
      isMoving={moving}
      onPositionUpdate={(c, h, m) => {
        setPos(c);
        if (h != null) setHeading(h);
        if (m != null) setMoving(m);
      }}
    />
  );
}

export function useLiveMapSubscription(
  trackingNumber: string,
  onUpdate: (data: {
    currentCoords?: { lat: number; lng: number };
    heading?: number;
    isMoving?: boolean;
    currentLocation?: string;
    progress?: number;
    statusLabel?: string;
  }) => void
) {
  const mounted = useRef(false);

  useEffect(() => {
    if (!trackingNumber || mounted.current) return;
    mounted.current = true;

    import('@/lib/socket').then(({ getSocket }) => {
      const socket = getSocket();
      socket.emit('track:subscribe', { trackingNumber });
      socket.on('shipment:update', (data: { trackingNumber: string }) => {
        if (data.trackingNumber?.toUpperCase() === trackingNumber.toUpperCase()) {
          onUpdate(data as Parameters<typeof onUpdate>[0]);
        }
      });
      return () => {
        socket.emit('track:unsubscribe', { trackingNumber });
        socket.off('shipment:update');
      };
    });
  }, [trackingNumber, onUpdate]);
}
