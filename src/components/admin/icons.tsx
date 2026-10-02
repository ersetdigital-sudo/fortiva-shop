import React from 'react';

/**
 * Ikon SVG untuk panel admin.
 * Semua ikon mewarisi warna lewat `currentColor` dan ukuran lewat `className`.
 */

type IconProps = { className?: string };

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const base = (className?: string) => ({
  className: className ?? 'h-4 w-4',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
});

export const IconBolt: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} fill="currentColor" aria-hidden="true">
    <path d="M14.5 2 5 13.2h5.1L9 22l9.6-11.4h-5.2L14.5 2Z" />
  </svg>
);

export const IconOverview: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <rect x="3" y="3" width="7.5" height="9" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="5.5" rx="2" />
    <rect x="13.5" y="11.5" width="7.5" height="9.5" rx="2" />
    <rect x="3" y="15" width="7.5" height="6" rx="2" />
  </svg>
);

export const IconReceipt: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <path d="M6 3h12a1 1 0 0 1 1 1v16.2a.8.8 0 0 1-1.2.7L15.5 19l-2.3 1.6a.8.8 0 0 1-.9 0L10 19l-2.3 1.6a.8.8 0 0 1-1.2-.7V4a1 1 0 0 1 1-1Z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
);

export const IconBox: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <path d="M12 3 3.5 7.2v9.6L12 21l8.5-4.2V7.2L12 3Z" />
    <path d="M3.7 7.3 12 11.5l8.3-4.2M12 11.5V21" />
  </svg>
);

export const IconFolder: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.2c.6 0 1.2.3 1.6.8l.9 1.2h7.3A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
  </svg>
);

export const IconSettings: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.07a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.05A1.7 1.7 0 0 0 4.6 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6h.09A1.7 1.7 0 0 0 10.1 3.05V3a2 2 0 1 1 4 0v.05a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.05a1.7 1.7 0 0 0-1.55 1Z" />
  </svg>
);

export const IconClose: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke} strokeWidth={2.2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconMenu: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke} strokeWidth={2.2}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconInbox: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <path d="M3 13h4l1.5 2.5h7L17 13h4" />
    <path d="M5.2 5.5h13.6a1.5 1.5 0 0 1 1.4 1l1.3 3.5v5.5a2.5 2.5 0 0 1-2.5 2.5H5a2.5 2.5 0 0 1-2.5-2.5V10l1.3-3.5a1.5 1.5 0 0 1 1.4-1Z" />
  </svg>
);

export const IconImage: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <circle cx="8.5" cy="10" r="1.6" />
    <path d="m4.5 17.5 4.6-4.3a1.6 1.6 0 0 1 2.2 0l3 2.8 2-1.8a1.6 1.6 0 0 1 2.2 0l1.5 1.4" />
  </svg>
);

export const IconBank: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <path d="M3.5 20h17M5 20V9.5m4 10.5V9.5m6 10.5V9.5m4 10.5V9.5" />
    <path d="M12 3 3 7.5h18L12 3Z" />
  </svg>
);

export const IconBroadcast: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <circle cx="12" cy="12" r="2.2" />
    <path d="M8.4 8.4a5 5 0 0 0 0 7.2M15.6 15.6a5 5 0 0 0 0-7.2M5.8 5.8a8.8 8.8 0 0 0 0 12.4M18.2 18.2a8.8 8.8 0 0 0 0-12.4" />
  </svg>
);

export const IconCheck: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke} strokeWidth={2.4}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const IconSearch: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.6-3.6" />
  </svg>
);

export const IconFilter: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

export const IconCalendar: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
  </svg>
);

export const IconMoreVertical: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="5.5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="18.5" r="1.7" />
  </svg>
);

export const IconChevronLeft: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke} strokeWidth={2.1}>
    <path d="M14.5 6 8.5 12l6 6" />
  </svg>
);

export const IconChevronRight: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke} strokeWidth={2.1}>
    <path d="M9.5 6l6 6-6 6" />
  </svg>
);

export const IconTrash: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <path d="M4.5 7h15M9.5 7V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3V7" />
    <path d="M6.5 7l.9 12.1a1.8 1.8 0 0 0 1.8 1.7h5.6a1.8 1.8 0 0 0 1.8-1.7L17.5 7" />
    <path d="M10.5 11v6M13.5 11v6" />
  </svg>
);

export const IconCopy: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H16" />
  </svg>
);

export const IconRefresh: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <path d="M20 11.5A8 8 0 0 0 6.3 6.3L4 8.5" />
    <path d="M4 4.5v4h4" />
    <path d="M4 12.5a8 8 0 0 0 13.7 5.2L20 15.5" />
    <path d="M20 19.5v-4h-4" />
  </svg>
);

export const IconEye: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

export const IconEyeOff: React.FC<IconProps> = ({ className }) => (
  <svg {...base(className)} {...stroke}>
    <path d="M4 4l16 16" />
    <path d="M9.6 5.9A9.6 9.6 0 0 1 12 5.8c6 0 9.5 6.2 9.5 6.2a17 17 0 0 1-3 3.8M6.4 7.4A17 17 0 0 0 2.5 12S6 18.2 12 18.2c1.3 0 2.5-.3 3.6-.8" />
    <path d="M9.9 9.9a2.8 2.8 0 0 0 4 4" />
  </svg>
);
