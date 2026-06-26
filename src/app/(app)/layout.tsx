import { requireMembership } from '@/lib/tenant';
import { listMembershipsForUser } from '@/lib/tenant';
import { getSession } from '@/lib/auth';
import { AppNav } from '@/components/nav/AppNav';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { membership, org } = await requireMembership();
  const session = await getSession();
  const memberships = session ? await listMembershipsForUser(session.userId) : [];

  return (
    <div className="min-h-screen">
      <AppNav orgName={org.name} displayName={membership.displayName} role={membership.role} showSwitchOrg={memberships.length > 1} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
