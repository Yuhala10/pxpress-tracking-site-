'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await api<{ token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      localStorage.setItem('px_token', res.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <form onSubmit={submit} className="glass rounded-2xl p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Register</h1>
        <input name="name" required placeholder="Full Name" className="w-full px-4 py-3 rounded-xl border" />
        <input name="email" type="email" required placeholder="Email" className="w-full px-4 py-3 rounded-xl border" />
        <input name="phone" placeholder="Phone" defaultValue="681731512" className="w-full px-4 py-3 rounded-xl border" />
        <input name="password" type="password" required minLength={6} placeholder="Password" className="w-full px-4 py-3 rounded-xl border" />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating...' : 'Create Account'}
        </button>
        <p className="text-center text-sm">
          <Link href="/login" className="text-orange">
            Already have an account?
          </Link>
        </p>
      </form>
    </div>
  );
}
