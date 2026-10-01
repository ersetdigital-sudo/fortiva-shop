'use client';

import React from 'react';
import {
  usePathname,
  useSearchParams,
  useRouter as useNextRouter,
} from 'next/navigation';

interface RouterContextType {
  path: string;
  query: URLSearchParams;
  navigate: (to: string) => void;
}

/**
 * Thin adapter that keeps the public API of the original hand-rolled router
 * (`{ path, query, navigate }`) but is backed by the Next.js App Router.
 * This lets every component keep using `useRouter()` / `<Link>` unchanged.
 */
export function useRouter(): RouterContextType {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nextRouter = useNextRouter();

  const search = searchParams ? searchParams.toString() : '';
  const query = React.useMemo(() => new URLSearchParams(search), [search]);
  const path = pathname || '/';

  const navigate = React.useCallback(
    (to: string) => {
      // External / non-app links
      if (
        to.startsWith('http') ||
        to.startsWith('https://') ||
        to.startsWith('mailto:') ||
        to.startsWith('tel:')
      ) {
        window.location.href = to;
        return;
      }

      // Handle plain hash on the current page
      if (to.startsWith('#')) {
        const el = document.getElementById(to.substring(1));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      const hashIndex = to.indexOf('#');
      const hash = hashIndex !== -1 ? to.substring(hashIndex + 1) : '';
      const withoutHash = hashIndex !== -1 ? to.substring(0, hashIndex) : to;
      const targetPath = withoutHash.split('?')[0] || '/';
      const isSamePage = targetPath === path;

      const scrollToTarget = () => {
        if (hash) {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };

      if (isSamePage) {
        // Same route: push to update the URL/query, then scroll manually
        nextRouter.push(to, { scroll: false });
        setTimeout(scrollToTarget, 50);
      } else {
        nextRouter.push(to);
      }
    },
    [path, nextRouter]
  );

  return React.useMemo(() => ({ path, query, navigate }), [path, query, navigate]);
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const Link: React.FC<LinkProps> = ({ href, children, className, onClick, ...props }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Don't intercept if modified click (ctrl, cmd, shift)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || props.target === '_blank') {
      return;
    }

    // External link
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
      return;
    }

    e.preventDefault();
    if (onClick) onClick(e);
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};
