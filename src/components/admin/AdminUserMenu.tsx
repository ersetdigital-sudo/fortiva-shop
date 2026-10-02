'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export function AdminUserMenu({ email, fullName }: { email: string; fullName?: string }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabaseBrowser().auth.signOut();
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  };

  const initial = (fullName || email || 'A').trim().charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-[12px] font-semibold leading-tight text-[#111827]">
          {fullName || 'Administrator'}
        </p>
        <p className="text-[11px] leading-tight text-[#6B7280]">{email}</p>
      </div>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111827] text-[13px] font-bold text-white">
        {initial}
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="rounded-xl border border-[#E5E3DC] bg-white px-3 py-2 text-[12px] font-semibold text-[#111827] transition hover:border-[#F2352B]/40 hover:text-[#F2352B] disabled:opacity-60"
      >
        {isSigningOut ? 'Keluar…' : 'Keluar'}
      </button>
    </div>
  );
}
