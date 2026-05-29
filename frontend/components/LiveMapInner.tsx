'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ShipmentMapData } from './LiveMap';

type Props = ShipmentMapData & {
  onPositionUpdate?: (coords: { lat: number; lng: number }, heading?: number, moving?: boolean) => void;
};

const truckIcon = (heading: number) =>
  L.divIcon({
    className: 'truck-marker-wrap',
    html: `<div class="truck-marker" style="transform: rotate(${heading}deg)">🚛</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

export default function LiveMapInner({
  originCoords,
  destinationCoords,
  currentCoords,
  route,
  heading = 0,
  isMoving,
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center = currentCoords || originCoords || { lat: 20, lng: 0 };
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([center.lat, center.lng], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);
    map.on('click', () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());
    mapRef.current = map;

    if (originCoords) {
      L.marker([originCoords.lat, originCoords.lng], {
        icon: L.divIcon({
          html: '<div style="background:#0B1E3D;color:white;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:600">ORIGIN</div>',
          className: '',
        }),
      }).addTo(map);
    }
    if (destinationCoords) {
      L.marker([destinationCoords.lat, destinationCoords.lng], {
        icon: L.divIcon({
          html: '<div style="background:#FF7A00;color:white;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:600">DEST</div>',
          className: '',
        }),
      }).addTo(map);
    }

    if (route && route.length > 1) {
      routeRef.current = L.polyline(
        route.map((p) => [p.lat, p.lng] as [number, number]),
        { color: '#FF7A00', weight: 4, opacity: 0.7, dashArray: '8 8' }
      ).addTo(map);
    }

    if (currentCoords) {
      markerRef.current = L.marker([currentCoords.lat, currentCoords.lng], {
        icon: truckIcon(heading),
        zIndexOffset: 1000,
      }).addTo(map);
    }

    const bounds: L.LatLngExpression[] = [];
    if (originCoords) bounds.push([originCoords.lat, originCoords.lng]);
    if (destinationCoords) bounds.push([destinationCoords.lat, destinationCoords.lng]);
    if (bounds.length >= 2) map.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!currentCoords || !markerRef.current || !mapRef.current) return;
    markerRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
    markerRef.current.setIcon(truckIcon(heading));
    if (isMoving) {
      mapRef.current.panTo([currentCoords.lat, currentCoords.lng], { animate: true, duration: 0.8 });
    }
  }, [currentCoords, heading, isMoving]);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-premium border border-gray-100 dark:border-white/10">
      {isMoving && (
        <div className="absolute top-4 left-4 z-[1000] px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      )}
      <div ref={containerRef} className="h-[400px] md:h-[500px] w-full" />
    </div>
  );
}
