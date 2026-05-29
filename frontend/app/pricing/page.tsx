'use client';

import { api } from '@/lib/api';
import { useState } from 'react';

export default function PricingPage() {
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="py-16 max-w-3xl mx-auto px-4">
      <h1 className="section-title text-center mb-4">Pricing & Quote Request</h1>
      <p className="text-center text-gray-600 mb-10">Get a custom quote for your shipment within 24 hours.</p>
      {ok ? (
        <p className="glass p-8 rounded-2xl text-center text-green-600 font-semibold">Quote submitted successfully!</p>
      ) : (
        <form
          className="glass rounded-2xl p-8 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            const fd = new FormData(e.currentTarget);
            await api('/quotes', { method: 'POST', body: JSON.stringify(Object.fromEntries(fd)) });
            setOk(true);
            setLoading(false);
          }}
        >
          <input name="name" required placeholder="Full Name" className="w-full px-4 py-3 rounded-xl border" />
          <input name="email" type="email" required placeholder="Email" className="w-full px-4 py-3 rounded-xl border" />
          <input name="phone" required placeholder="Phone" className="w-full px-4 py-3 rounded-xl border" />
          <select name="shipmentType" className="w-full px-4 py-3 rounded-xl border">
            <option>Air Freight</option>
            <option>Ocean Freight</option>
            <option>Express Delivery</option>
            <option>Door-to-Door</option>
          </select>
          <input name="weight" required placeholder="Estimated Weight" className="w-full px-4 py-3 rounded-xl border" />
          <input name="destination" required placeholder="Destination Country/City" className="w-full px-4 py-3 rounded-xl border" />
          <textarea name="message" rows={3} placeholder="Additional details" className="w-full px-4 py-3 rounded-xl border" />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Submitting...' : 'REQUEST QUOTE'}
          </button>
        </form>
      )}
    </div>
  );
}
