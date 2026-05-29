const COUNTRY_CODES = ['US', 'UK', 'CM', 'EU', 'AE', 'FR', 'DE', 'NG', 'GH', 'CA', 'AU', 'IN', 'CN', 'JP'];

function randomDigits(n) {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function randomCountry() {
  return COUNTRY_CODES[Math.floor(Math.random() * COUNTRY_CODES.length)];
}

function generateTrackingNumber(format = 'auto') {
  const country = randomCountry();
  if (format === 'pxp' || (format === 'auto' && Math.random() > 0.5)) {
    return `PXP${randomDigits(6)}${country}`;
  }
  return `PX${randomDigits(8)}${country}`;
}

module.exports = { generateTrackingNumber, COUNTRY_CODES };
