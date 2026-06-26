import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { listMembershipsForUser } from '@/lib/tenant';
import { selectOrg } from '@/actions/auth';
import { Button, Card, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function SwitchOrgPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const memberships = await listMembershipsForUser(session.userId);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <p className="font-mono text-xs uppercase tracking-widest text-sage-dark mb-2">your groups</p>
        <h1 className="font-display text-2xl text-ink mb-6">Choose a group</h1>

        {memberships.length === 0 ? (
          <EmptyState
            title="You're not in a group yet"
            description="Ask an admin for an invite code, or start a brand-new group."
            action={
              <div className="flex justify-center gap-3">
                <Link href="/join">
                  <Button variant="secondary">Join with a code</Button>
                </Link>
                <Link href="/signup">
                  <Button>Start a group</Button>
                </Link>
              </div>
            }
          />
        ) : (
          <div className="space-y-2">
            {memberships.map(({ membership, org }) => (
              <form key={org.id} action={selectOrg}>
                <input type="hidden" name="orgId" value={org.id} />
                <button
                  type="submit"
                  className="w-full text-left rounded-card border border-rule bg-white/60 hover:bg-sage/10 hover:border-sage/40 px-4 py-3 transition-colors"
                >
                  <span className="font-display text-lg text-ink block">{org.name}</span>
                  <span className="text-sm text-inkmuted capitalize">{membership.role}</span>
                </button>
              </form>
            ))}
            <Link href="/join" className="block text-center text-sm font-semibold text-sage-dark pt-2">
              + Join another group with a code
            </Link>
          </div>
        )}
      </Card>
    </main>
  );
}
