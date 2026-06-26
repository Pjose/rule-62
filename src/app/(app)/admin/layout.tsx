import Link from 'next/link';
import { requireStaff } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

const tabs = [
  { href: '/admin', label: 'Org settings', adminOnly: true },
  { href: '/admin/roster', label: 'Roster' },
  { href: '/admin/meetings', label: 'Meetings' },
  { href: '/admin/schedule', label: 'Assign meetings' },
  { href: '/admin/schedule-hi', label: 'Assign H&I' },
  { href: '/admin/hi', label: 'H&I' },
  { href: '/admin/trusted-servants', label: 'Trusted servants' },
  { href: '/admin/announcements', label: 'Announcements & news' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/conscience', label: 'Group conscience' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { membership } = await requireStaff();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-sage-dark mb-2">admin</p>
      <nav className="flex flex-wrap gap-1 mb-8 border-b border-rule pb-3">
        {tabs
          .filter((t) => !t.adminOnly || membership.role === 'admin')
          .map((t) => (
            <Link key={t.href} href={t.href} className="rounded-card px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5">
              {t.label}
            </Link>
          ))}
      </nav>
      {children}
    </div>
  );
}
