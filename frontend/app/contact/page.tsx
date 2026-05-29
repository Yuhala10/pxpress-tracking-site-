'use client';

import { CONTACT, api } from '@/lib/api';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="py-16 max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-12">
      <div>
        <h1 className="section-title mb-6">Contact Us</h1>
        <div className="space-y-4">
          <p className="flex items-center gap-3">
            <Phone className="text-orange" /> <a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a>
          </p>
          <p className="flex items-center gap-3">
            <Mail className="text-orange" /> <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </p>
          <p className="flex items-center gap-3">
            <MapPin className="text-orange" /> Global Logistics Network
          </p>
        </div>
      </div>
      <form
        className="glass rounded-2xl p-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          await api('/quotes', {
            method: 'POST',
            body: JSON.stringify({
              name: fd.get('name'),
              email: fd.get('email'),
              phone: fd.get('phone'),
              shipmentType: 'General Inquiry',
              weight: 'N/A',
              destination: fd.get('subject'),
              message: fd.get('message'),
            }),
          });
          setSent(true);
        }}
      >
        {sent ? (
          <p className="text-green-600 font-semibold">Message sent! We will reply to {CONTACT.email}.</p>
        ) : (
          <>
            <input name="name" required placeholder="Name" className="w-full px-4 py-3 rounded-xl border" />
            <input name="email" type="email" required defaultValue={CONTACT.email} placeholder="Email" className="w-full px-4 py-3 rounded-xl border" />
            <input name="phone" required defaultValue={CONTACT.phone} placeholder="Phone" className="w-full px-4 py-3 rounded-xl border" />
            <input name="subject" required placeholder="Subject" className="w-full px-4 py-3 rounded-xl border" />
            <textarea name="message" required rows={4} placeholder="Message" className="w-full px-4 py-3 rounded-xl border" />
            <button type="submit" className="btn-primary w-full">
              Send Message
            </button>
          </>
        )}
      </form>
    </div>
  );
}
