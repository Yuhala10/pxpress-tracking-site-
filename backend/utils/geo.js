const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function interpolateRoute(route, progress) {
  if (!route || route.length === 0) return null;
  if (route.length === 1) return route[0];
  const p = Math.max(0, Math.min(1, progress));
  const totalSegments = route.length - 1;
  const scaled = p * totalSegments;
  const segIndex = Math.min(Math.floor(scaled), totalSegments - 1);
  const segProgress = scaled - segIndex;
  const a = route[segIndex];
  const b = route[segIndex + 1];
  return {
    lat: a.lat + (b.lat - a.lat) * segProgress,
    lng: a.lng + (b.lng - a.lng) * segProgress,
  };
}

function bearing(lat1, lng1, lat2, lng2) {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function buildGreatCircleRoute(origin, destination, points = 40) {
  const route = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    route.push({
      lat: origin.lat + (destination.lat - origin.lat) * t,
      lng: origin.lng + (destination.lng - origin.lng) * t,
    });
  }
  return route;
}

module.exports = { haversineKm, interpolateRoute, bearing, buildGreatCircleRoute };
