'use client';

const items = [
  { name: 'Marie K., Import Director', text: 'P XPRESS delivered our shipment faster than expected with full tracking transparency.', country: 'Cameroon' },
  { name: 'James T., Operations', text: 'Enterprise-grade platform. We track hundreds of consignments daily without issues.', country: 'USA' },
  { name: 'Ahmed R., Logistics Manager', text: 'Customs clearance was seamless. Real-time map tracking gave our clients complete confidence.', country: 'UAE' },
  { name: 'Sophie L., E-Commerce', text: 'Door-to-door express transformed our European fulfillment. Highly recommended.', country: 'France' },
];

export default function TestimonialsPage() {
  return (
    <div className="py-16 max-w-5xl mx-auto px-4">
      <h1 className="section-title text-center mb-12">Client Testimonials</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((t) => (
          <blockquote key={t.name} className="glass rounded-2xl p-8 card-hover">
            <p className="italic text-gray-600 dark:text-gray-300 mb-4">&ldquo;{t.text}&rdquo;</p>
            <footer className="font-semibold">
              {t.name} <span className="text-orange text-sm">— {t.country}</span>
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
