'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <form
        className="glass rounded-2xl p-8 w-full max-w-md space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const email = new FormData(e.currentTarget).get('email');
          await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
          setSent(true);
        }}
      >
        <h1 className="text-xl font-bold text-center">Forgot Password</h1>
        {sent ? (
          <p className="text-green-600 text-sm text-center">If that email exists, a reset link was sent.</p>
        ) : (
          <>
            <input name="email" type="email" required placeholder="Email" className="w-full px-4 py-3 rounded-xl border" />
            <button type="submit" className="btn-primary w-full">
              Send Reset Link
            </button>
          </>
        )}
      </form>
    </div>
  );
}
