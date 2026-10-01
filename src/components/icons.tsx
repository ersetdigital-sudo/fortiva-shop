'use client';

import React from 'react';

/**
 * Library ikon SVG inline — menggantikan font "Material Symbols Outlined"
 * (~3,5 MB) supaya ikon tampil instan tanpa FOUT / teks bocor.
 * Semua ikon pakai viewBox 24x24 dan mewarisi warna dari `currentColor`.
 */

const GLYPHS = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M16 16l4 4',
  search_check: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M16 16l4 4M8 11.2l2.2 2.2 3.8-4.4',
  bolt: 'M13.5 2 5 13.5h6L10.5 22 19 10.5h-6L13.5 2Z',
  electric_bolt: 'M13.5 2 5 13.5h6L10.5 22 19 10.5h-6L13.5 2Z',
  account_balance_wallet:
    'M3.5 7.5A2 2 0 0 1 5.5 5.5h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7.5M3.5 10h17M16.2 13.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4',
  arrow_forward: 'M4 12h15M13 6l6 6-6 6',
  receipt:
    'M6.5 3.5h11a1 1 0 0 1 1 1V20l-3-1.8-3 1.8-3-1.8L6 20V4.5a1 1 0 0 1 .5-1M9.5 8.5h5M9.5 12h3.5',
  receipt_long:
    'M6.5 3.5h11a1 1 0 0 1 1 1V20l-3-1.8-3 1.8-3-1.8L6 20V4.5a1 1 0 0 1 .5-1M9.5 8.5h5M9.5 12h5M9.5 15.5h3',
  menu_book:
    'M12 6.8C10.5 5 8.6 4.2 6.2 4.2H4v14.1h2.2c2.4 0 4.3.8 5.8 2.5M12 6.8c1.5-1.8 3.4-2.6 5.8-2.6H20v14.1h-2.2c-2.4 0-4.3.8-5.8 2.5M12 6.8v14',
  check_circle: 'M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0M8.3 12.4l2.6 2.6 5-5.4',
  check: 'M5 12.6 10 17.6 19 7',
  support_agent:
    'M5 13.5v-1.5a7 7 0 1 1 14 0v1.5M4 13h2.5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1M20 13h-2.5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1H20a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1M20 18v.5a2.5 2.5 0 0 1-2.5 2.5H13',
  headset_mic:
    'M5 13.5v-1.5a7 7 0 1 1 14 0v1.5M4 13h2.5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1M20 13h-2.5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1H20a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1M21 18.5v.5a3 3 0 0 1-3 3h-4',
  chat: 'M20.5 11.5c0 3.9-3.8 7-8.5 7-1 0-2-.1-2.9-.4L4 20l1.4-3.6A6.7 6.7 0 0 1 3.5 11.5c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7Z',
  touch_app:
    'M9 11V5.2a1.9 1.9 0 0 1 3.8 0V11M12.8 11.2V9.6a1.8 1.8 0 0 1 3.6 0v1.6M16.4 11.8v-.6a1.8 1.8 0 0 1 3.6 0V15a6 6 0 0 1-6 6h-1.6a5 5 0 0 1-3.7-1.6L5 15.5a1.9 1.9 0 0 1 2.7-2.7l1.3 1.3',
  pin: 'M12 21.5c4.2-4.2 6.5-7.5 6.5-10.3a6.5 6.5 0 1 0-13 0c0 2.8 2.3 6.1 6.5 10.3M12 8a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Z',
  qr_code_scanner:
    'M4 8.5V6a2 2 0 0 1 2-2h2.5M15.5 4H18a2 2 0 0 1 2 2v2.5M20 15.5V18a2 2 0 0 1-2 2h-2.5M8.5 20H6a2 2 0 0 1-2-2v-2.5M4 12h16',
  qr_code_2:
    'M4 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6M4 16a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2M16 4h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2M14 14h3v3h-3zM20.5 14v2M14 20.5h6.5',
  home: 'M4 10.5 12 4l8 6.5V19a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 19v-8.5M9.5 20.6v-5.4h5v5.4',
  security: 'M12 3.2l7 2.9v5.4c0 4.4-3 8.3-7 9.5-4-1.2-7-5.1-7-9.5V6.1l7-2.9M9 12l2.1 2.1L15.2 9.9',
  verified_user: 'M12 3.2l7 2.9v5.4c0 4.4-3 8.3-7 9.5-4-1.2-7-5.1-7-9.5V6.1l7-2.9M9 12l2.1 2.1L15.2 9.9',
  call: 'M6.4 3.6h3l1.5 4-2 1.5a12.5 12.5 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17.4 17.4 0 0 1 4.4 5.8a2 2 0 0 1 2-2.2Z',
  language:
    'M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0M3.6 9.2h16.8M3.6 14.8h16.8M12 3.5c2.4 2.6 3.7 5.5 3.7 8.5s-1.3 5.9-3.7 8.5c-2.4-2.6-3.7-5.5-3.7-8.5s1.3-5.9 3.7-8.5Z',
  water_drop: 'M12 3.2s6 6.2 6 10.3a6 6 0 0 1-12 0c0-4.1 6-10.3 6-10.3Z',
  health_and_safety:
    'M12 3.2l7 2.9v5.4c0 4.4-3 8.3-7 9.5-4-1.2-7-5.1-7-9.5V6.1l7-2.9M12 9v5.4M9.3 11.7h5.4',
  router:
    'M3.5 14.5h17a1.5 1.5 0 0 1 1.5 1.5v3.5a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 19.5V16a1.5 1.5 0 0 1 1.5-1.5M6.5 17.7h.01M10 17.7h.01M17.5 17.7h1.5M7 11l5-4.5 5 4.5',
  payments:
    'M2.5 8a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2V8M12 9.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8M5.5 12h.01M18.5 12h.01',
  price_check: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6.2M4 6v12a2 2 0 0 0 2 2h5.5M8 8.5h8M8 12.5h4.5M15.5 18.5l2 2 3.5-4',
  contact_support:
    'M20.5 11.5c0 3.9-3.8 7-8.5 7-1 0-2-.1-2.9-.4L4 20l1.4-3.6A6.7 6.7 0 0 1 3.5 11.5c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7M9.6 9.9a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5M12 16.4h.01',
  expand_less: 'M6 15l6-6 6 6',
  expand_more: 'M6 9l6 6 6-6',
  cancel: 'M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0M15 9l-6 6M9 9l6 6',
  close: 'M6 6l12 12M18 6L6 18',
  info: 'M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0M12 11v5M12 7.8h.01',
  error: 'M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0M12 7.5v5.5M12 16.4h.01',
} as const;

export type IconName = keyof typeof GLYPHS;

const FILLED = new Set<IconName>(['bolt', 'electric_bolt']);

interface IconProps {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className, strokeWidth = 1.9 }) => {
  const filled = FILLED.has(name);
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? 'w-5 h-5'}
    >
      <path d={GLYPHS[name]} />
    </svg>
  );
};
