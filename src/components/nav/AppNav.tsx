'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/lib/utils';
import { logout } from '@/actions/auth';

type NavLink = { href: string; label: string };

const memberLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/hi', label: 'H&I' },
  { href: '/trusted-servants', label: 'Trusted servants' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/events', label: 'Events' },
  { href: '/conscience', label: 'Group conscience' },
];

export function AppNav({
  orgName,
  displayName,
  role,
  showSwitchOrg,
}: {
  orgName: string;
  displayName: string;
  role: 'admin' | 'coordinator' | 'member';
  showSwitchOrg: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const isStaff = role === 'admin' || role === 'coordinator';

  const links = isStaff ? [...memberLinks, { href: '/admin', label: 'Admin' }] : memberLinks;

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="font-display text-xl text-ink whitespace-nowrap">
              The Service Board
            </Link>
            <span className="hidden sm:inline text-rule">·</span>
            <span className="hidden sm:inline text-inkmuted truncate">{orgName}</span>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cx(
                  'rounded-card px-3 py-2 text-sm font-medium transition-colors',
                  pathname?.startsWith(link.href) ? 'bg-sage text-paper' : 'text-ink hover:bg-ink/5',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/profile" className="text-sm text-inkmuted hover:text-ink">
              {displayName}
            </Link>
            {showSwitchOrg && (
              <Link href="/switch-org" className="text-sm text-inkmuted hover:text-ink">
                Switch group
              </Link>
            )}
            <form action={logout}>
              <button type="submit" className="text-sm font-semibold text-brick hover:text-brick/80">
                Sign out
              </button>
            </form>
          </div>

          <button
            className="lg:hidden rounded-card p-2 text-ink hover:bg-ink/5"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              {open ? (
                <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-rule bg-paper px-4 pb-4">
          <p className="py-2 text-sm text-inkmuted">{orgName}</p>
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cx(
                  'rounded-card px-3 py-2.5 text-sm font-medium',
                  pathname?.startsWith(link.href) ? 'bg-sage text-paper' : 'text-ink hover:bg-ink/5',
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/profile" onClick={() => setOpen(false)} className="rounded-card px-3 py-2.5 text-sm font-medium text-ink hover:bg-ink/5">
              {displayName} (profile)
            </Link>
            {showSwitchOrg && (
              <Link href="/switch-org" onClick={() => setOpen(false)} className="rounded-card px-3 py-2.5 text-sm font-medium text-ink hover:bg-ink/5">
                Switch group
              </Link>
            )}
            <form action={logout}>
              <button type="submit" className="w-full text-left rounded-card px-3 py-2.5 text-sm font-semibold text-brick hover:bg-brick/10">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
