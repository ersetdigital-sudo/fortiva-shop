'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { btnPrimary, inputClass, labelClass } from './ui';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: signInError } = await supabaseBrowser().auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(
          signInError.message === 'Invalid login credentials'
            ? 'Email atau kata sandi salah.'
            : signInError.message
        );
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError('Tidak dapat menghubungi server. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="admin-email" className={labelClass}>
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@fortivashop.id"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="admin-password" className={labelClass}>
          Kata Sandi
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[#F2352B]/25 bg-[#F2352B]/5 px-3.5 py-2.5 text-[12px] font-medium text-[#F2352B]"
        >
          {error}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full`}>
        {isSubmitting ? 'Memproses…' : 'Masuk ke Panel Admin'}
      </button>
    </form>
  );
}
