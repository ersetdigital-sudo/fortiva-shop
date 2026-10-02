'use client';

import React, { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { IconEye, IconEyeOff } from './icons';
import { btnPrimary, inputClass, labelClass } from './ui';

/**
 * Panel ini hanya untuk satu akun admin, jadi email tidak perlu diketik.
 * Bisa ditimpa lewat NEXT_PUBLIC_ADMIN_EMAIL kalau alamatnya berubah.
 */
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@fortivashop.id';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/admin';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  /**
   * Tempel (paste) dikerjakan manual supaya tetap jalan walau browser/ekstensi
   * memblokir paste bawaan: teks disisipkan di posisi kursor.
   */
  const handlePasswordPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (!pasted) return;

    event.preventDefault();
    const input = event.currentTarget;
    const start = input.selectionStart ?? password.length;
    const end = input.selectionEnd ?? password.length;
    const text = pasted.replace(/\s+/g, ''); // buang spasi/enter tak sengaja
    const next = password.slice(0, start) + text + password.slice(end);

    setPassword(next);
    requestAnimationFrame(() => {
      const caret = start + text.length;
      input.setSelectionRange(caret, caret);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: signInError } = await supabaseBrowser().auth.signInWithPassword({
        email: ADMIN_EMAIL,
        // Spasi/baris baru dari hasil salin-tempel dibuang agar tidak gagal validasi.
        password: password.replace(/\s+/g, ''),
      });

      if (signInError) {
        setError(
          signInError.message === 'Invalid login credentials'
            ? 'Kata sandi salah.'
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
        <label htmlFor="admin-password" className={labelClass}>
          Kata Sandi
        </label>
        <div className="relative">
          <input
            ref={passwordRef}
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            autoFocus
            required
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onPaste={handlePasswordPaste}
            placeholder="Tempel atau ketik kata sandi"
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => {
              setShowPassword((prev) => !prev);
              passwordRef.current?.focus();
            }}
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            className="absolute inset-y-0 right-1.5 my-auto flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#F7F6F2] hover:text-[#111827]"
          >
            {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-[#6B7280]">
          Tempel (Ctrl+V) atau ketik kata sandi admin, lalu tekan Masuk.
        </p>
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
