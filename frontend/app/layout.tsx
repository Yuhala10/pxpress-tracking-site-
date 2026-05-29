import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'P XPRESS | Worldwide Shipping & Logistics',
  description:
    'Fast. Secure. Reliable. Track shipments in real-time with P XPRESS global logistics. Air freight, ocean freight, express delivery.',
  keywords: 'logistics, shipping, tracking, freight, P XPRESS, international delivery',
  openGraph: {
    title: 'P XPRESS Logistics',
    description: 'Worldwide Shipping & Logistics — Track Every Move',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans`}>
        <AppProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
