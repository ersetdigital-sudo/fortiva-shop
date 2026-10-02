import React from 'react';
import { IconInbox } from './icons';

/* ------------------------------------------------------------------ *
 * Kelas utilitas bersama
 * ------------------------------------------------------------------ */
export const inputClass =
  'w-full rounded-xl border border-[#E5E3DC] bg-white px-3.5 py-2.5 text-[13px] text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#245BE8] focus:ring-2 focus:ring-[#245BE8]/15 disabled:bg-[#F7F6F2] disabled:text-[#6B7280]';

export const labelClass = 'mb-1.5 block text-[13px] font-semibold text-[#111827]';

export const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F2352B] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#F2352B]/30 disabled:cursor-not-allowed disabled:opacity-60';

export const btnSecondary =
  'inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E5E3DC] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:border-[#111827]/25 hover:bg-[#F7F6F2] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 disabled:cursor-not-allowed disabled:opacity-60';

export const btnDanger =
  'inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#F2352B]/25 bg-white px-3 py-2 text-[12px] font-semibold text-[#F2352B] transition hover:bg-[#F2352B] hover:text-white disabled:opacity-60';

export const btnGhost =
  'inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold text-[#374151] transition hover:bg-[#F7F6F2] disabled:opacity-60';

/* ------------------------------------------------------------------ *
 * Card + section
 * ------------------------------------------------------------------ */
interface CardProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Card({ title, description, action, children, className = '', bodyClassName = '' }: CardProps) {
  return (
    <section className={`rounded-2xl border border-[#E5E3DC] bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EFEDE7] px-5 py-4">
          <div>
            {title && <h2 className="text-[15px] font-bold text-[#111827]">{title}</h2>}
            {description && <p className="mt-0.5 text-[12px] text-[#6B7280]">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={`px-5 py-5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: 'neutral' | 'red' | 'blue' | 'green' | 'yellow';
}

const ACCENTS: Record<NonNullable<StatCardProps['accent']>, string> = {
  neutral: 'text-[#111827]',
  red: 'text-[#F2352B]',
  blue: 'text-[#245BE8]',
  green: 'text-[#16803C]',
  yellow: 'text-[#B45309]',
};

export function StatCard({ label, value, hint, accent = 'neutral' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#E5E3DC] bg-white px-5 py-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">{label}</p>
      <p className={`num-tabular mt-1.5 text-2xl font-extrabold ${ACCENTS[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-[#6B7280]">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Badge
 * ------------------------------------------------------------------ */
export type BadgeTone = 'neutral' | 'red' | 'blue' | 'green' | 'yellow' | 'gray';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-[#111827] text-white',
  red: 'bg-[#F2352B]/10 text-[#F2352B]',
  blue: 'bg-[#245BE8]/10 text-[#245BE8]',
  green: 'bg-[#16803C]/10 text-[#16803C]',
  yellow: 'bg-[#FFE78F] text-[#8A6100]',
  gray: 'bg-[#F3F4F6] text-[#4B5563]',
};

export function Badge({ children, tone = 'gray' }: { children: React.ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

const STATUS_TONES: Record<string, BadgeTone> = {
  SUCCESS: 'green',
  PENDING: 'yellow',
  PROCESSING: 'blue',
  FAILED: 'red',
};

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  return <Badge tone={STATUS_TONES[normalized] ?? 'gray'}>{normalized}</Badge>;
}

/* ------------------------------------------------------------------ *
 * Lain-lain
 * ------------------------------------------------------------------ */
export function EmptyState({
  title,
  description,
  icon = <IconInbox className="h-7 w-7" />,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E5E3DC] bg-[#F7F6F2] px-6 py-12 text-center">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#6B7280] ring-1 ring-[#E5E3DC]"
        aria-hidden="true"
      >
        {icon}
      </span>
      <p className="text-[14px] font-bold text-[#111827]">{title}</p>
      {description && <p className="max-w-md text-[12px] text-[#6B7280]">{description}</p>}
    </div>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {hint && <span className="ml-2 text-[11px] font-normal text-[#6B7280]">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-extrabold tracking-[-0.01em] text-[#111827]">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-[#6B7280]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
