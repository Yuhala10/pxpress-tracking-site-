'use client';

import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CONTACT } from '@/lib/api';

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className="bg-navy text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h3 className="text-2xl font-extrabold mb-2">
            P <span className="text-orange">XPRESS</span>
          </h3>
          <p className="text-gray-300 text-sm mb-4">Fast. Secure. Reliable.</p>
          <div className="flex gap-3">
            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange hover:scale-110 hover:shadow-lg transition-all duration-200"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-orange">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            {[
              ['/', 'Home'],
              ['/track', 'Track'],
              ['/services', 'Services'],
              ['/about', 'About'],
              ['/pricing', 'Pricing'],
              ['/testimonials', 'Testimonials'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="footer-link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-orange">Support</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link href="/faq" className="footer-link">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="/terms" className="footer-link">
                Terms & Privacy
              </Link>
            </li>
            <li>
              <Link href="/contact" className="footer-link">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/login" className="footer-link">
                Customer Portal
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-orange">Contact</h4>
          <p className="flex items-center gap-2 text-sm text-gray-300 mb-2">
            <Phone size={16} className="text-orange" />
            <a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a>
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-300 mb-4">
            <Mail size={16} className="text-orange" />
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </p>
          <p className="text-sm text-gray-400 mb-2">{t('footer.newsletter')}</p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              alert('Subscribed! Thank you.');
            }}
          >
            <input
              type="email"
              placeholder="Email"
              className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm focus:outline-none focus:border-orange"
            />
            <button type="submit" className="px-4 py-2 bg-orange rounded-lg text-sm font-semibold hover:bg-orange-light hover:scale-105 hover:shadow-lg transition-all duration-200">
              Go
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} P XPRESS Logistics. {t('footer.rights')}
      </div>
    </footer>
  );
}
