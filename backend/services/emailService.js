const nodemailer = require('nodemailer');

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'yuhala24@gmail.com';
const CONTACT_PHONE = process.env.CONTACT_PHONE || '681731512';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  const from = `"P XPRESS Logistics" <${CONTACT_EMAIL}>`;
  if (!t) {
    console.log('[Email stub]', { to, subject });
    return { stub: true };
  }
  return t.sendMail({ from, to, subject, html, text });
}

async function notifyAdminQuote(quote) {
  return sendMail({
    to: CONTACT_EMAIL,
    subject: `[P XPRESS] New Quote Request from ${quote.name}`,
    html: `
      <h2>New Quote Request</h2>
      <p><strong>Name:</strong> ${quote.name}</p>
      <p><strong>Email:</strong> ${quote.email}</p>
      <p><strong>Phone:</strong> ${quote.phone}</p>
      <p><strong>Type:</strong> ${quote.shipmentType}</p>
      <p><strong>Weight:</strong> ${quote.weight}</p>
      <p><strong>Destination:</strong> ${quote.destination}</p>
      <p><strong>Message:</strong> ${quote.message || '—'}</p>
      <hr/>
      <p>Contact: ${CONTACT_PHONE} | ${CONTACT_EMAIL}</p>
    `,
  });
}

async function sendShipmentUpdate(shipment, recipientEmail) {
  if (!recipientEmail) return;
  return sendMail({
    to: recipientEmail,
    subject: `[P XPRESS] Shipment ${shipment.trackingNumber} — ${shipment.statusLabel}`,
    html: `
      <h2>Shipment Update</h2>
      <p><strong>Tracking:</strong> ${shipment.trackingNumber}</p>
      <p><strong>Status:</strong> ${shipment.statusLabel}</p>
      <p><strong>Location:</strong> ${shipment.currentLocation}</p>
      <p>Support: ${CONTACT_PHONE} | ${CONTACT_EMAIL}</p>
    `,
  });
}

module.exports = { sendMail, notifyAdminQuote, sendShipmentUpdate, CONTACT_EMAIL, CONTACT_PHONE };
