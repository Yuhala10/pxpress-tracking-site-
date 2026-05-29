'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
  const { login } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('pxpress@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const u = await login(email, password);
      const redirect = params.get('redirect') || '/dashboard';
      router.push(u.role === 'admin' || u.role === 'staff' ? '/admin' : redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="glass rounded-2xl p-8 w-full max-w-md shadow-premium">
        <h1 className="text-2xl font-bold text-center mb-2">
          P <span className="text-orange">XPRESS</span>
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">Customer & Admin Portal</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3 rounded-xl border dark:bg-navy-light dark:border-white/10 focus:border-orange outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3 rounded-xl border dark:bg-navy-light dark:border-white/10 focus:border-orange outline-none"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm mt-6 text-gray-500">
          <Link href="/register" className="text-orange hover:underline">
            Create account
          </Link>
          {' · '}
          <Link href="/forgot-password" className="text-orange hover:underline">
            Forgot password?
          </Link>
        </p>
        <p className="text-xs text-center mt-4 text-gray-400">Admin: pxpress@gmail.com / xpress12345</p>
      </div>
    </div>
  );
}
