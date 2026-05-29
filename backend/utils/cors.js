function getAllowedOrigins() {
  const raw = process.env.FRONTEND_URL || 'http://localhost:3000';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (getAllowedOrigins().includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}

function corsOrigin(origin, callback) {
  if (isOriginAllowed(origin)) callback(null, true);
  else callback(null, false);
}

module.exports = { getAllowedOrigins, isOriginAllowed, corsOrigin };
