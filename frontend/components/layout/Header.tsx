'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Mail, Moon, Sun, Globe } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CONTACT } from '@/lib/api';

const nav = [
  { href: '/', key: 'nav.home' },
  { href: '/track', key: 'nav.track' },
  { href: '/services', key: 'nav.services' },
  { href: '/about', key: 'nav.about' },
  { href: '/contact', key: 'nav.contact' },
  { href: '/pricing', key: 'nav.pricing' },
  { href: '/faq', key: 'nav.faq' },
];

export default function Header() {
  const { t, lang, setLang, darkMode, setDarkMode, user } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-navy text-white text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-6">
            <a href={`tel:${CONTACT.phone}`} className="flex items-center gap-1 hover:text-orange transition-all duration-200 hover:scale-105">
              <Phone size={14} /> {CONTACT.phone}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-1 hover:text-orange transition-all duration-200 hover:scale-105">
              <Mail size={14} /> {CONTACT.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
              className="flex items-center gap-1 hover:text-orange transition-all duration-200 hover:scale-110"
            >
              <Globe size={14} /> {lang === 'en' ? 'FR' : 'EN'}
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="hover:text-orange transition-all duration-200 hover:scale-110">
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </div>
      <nav className="bg-white/95 dark:bg-navy-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-extrabold text-navy dark:text-white">
              P <span className="text-orange">XPRESS</span>
            </span>
          </Link>
          <div className="hidden lg:flex items-center gap-6">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="nav-link"
              >
                {t(n.key)}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Link
                href={user.role === 'admin' || user.role === 'staff' ? '/admin' : '/dashboard'}
                className="btn-primary text-sm py-2 px-4"
              >
                {t('nav.dashboard')}
              </Link>
            ) : (
              <Link href="/login" className="btn-navy text-sm py-2 px-4">
                {t('nav.login')}
              </Link>
            )}
          </div>
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t overflow-hidden"
            >
              <div className="p-4 flex flex-col gap-3">
                {nav.map((n) => (
                  <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="nav-link block">
                    {t(n.key)}
                  </Link>
                ))}
                <Link href="/login" className="btn-primary text-center" onClick={() => setOpen(false)}>
                  {t('nav.login')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
