import { Suspense } from 'react';

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>{children}</Suspense>;
}
