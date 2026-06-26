import Link from 'next/link';
import { requireMembership } from '@/lib/tenant';
import { getMemberDashboard } from '@/lib/queries';
import { Badge, Card, EmptyState, PageHeader } from '@/components/ui';
import { formatDateHuman, formatTime12h } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { membership, org } = await requireMembership();
  const data = await getMemberDashboard(org.id, membership.id);

  return (
    <div>
      <PageHeader eyebrow={org.name} title={`Welcome back, ${membership.displayName.split(' ')[0]}`} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="font-display text-xl text-ink mb-3">Your upcoming commitments</h2>
            {data.myAssignments.length === 0 ? (
              <EmptyState
                title="Nothing on your plate right now"
                description="Open slots are listed to the right if you'd like to sign up for something."
              />
            ) : (
              <ul className="divide-y divide-rule/60">
                {data.myAssignments.map((a) => {
                  const pendingSwap = data.myPendingSwaps.find((s) => s.assignmentId === a.assignment.id);
                  return (
                    <li key={a.assignment.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-ink font-semibold">{a.commitment.name}</p>
                        <p className="text-sm text-inkmuted">
                          {a.position.name} · {formatDateHuman(a.occurrence.date)} · {formatTime12h(a.commitment.time)}
                        </p>
                      </div>
                      {pendingSwap ? (
                        <Badge tone="pending">cover requested</Badge>
                      ) : (
                        <Badge tone="filled">you're covering this</Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl text-ink">Announcements</h2>
              <Link href="/announcements" className="text-sm font-semibold text-sage-dark">
                View all
              </Link>
            </div>
            {data.announcements.length === 0 ? (
              <p className="text-sm text-inkmuted">No announcements right now.</p>
            ) : (
              <ul className="space-y-3">
                {data.announcements.map(({ post }) => (
                  <li key={post.id}>
                    <p className="font-semibold text-ink">{post.title}</p>
                    <p className="text-sm text-inkmuted whitespace-pre-wrap">{post.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-ink">Open commitments</h2>
            </div>
            {data.openSlots.length === 0 ? (
              <p className="text-sm text-inkmuted">Everything is covered for now. Nicely done.</p>
            ) : (
              <ul className="space-y-3">
                {data.openSlots.map((s) => (
                  <li key={s.assignment.id} className="text-sm">
                    <p className="text-ink font-semibold">
                      {s.position.name} · {s.commitment.name}
                    </p>
                    <p className="text-inkmuted">{formatDateHuman(s.occurrence.date)}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex gap-3 text-sm font-semibold">
              <Link href="/schedule" className="text-sage-dark">
                Meeting schedule →
              </Link>
              <Link href="/hi" className="text-sage-dark">
                H&amp;I schedule →
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg text-ink mb-3">Upcoming events</h2>
            {data.upcomingEvents.length === 0 ? (
              <p className="text-sm text-inkmuted">Nothing on the calendar yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.upcomingEvents.map(({ event }) => (
                  <li key={event.id} className="text-sm">
                    <p className="text-ink font-semibold">{event.title}</p>
                    <p className="text-inkmuted">
                      {event.startAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {event.location ? ` · ${event.location}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/events" className="mt-4 inline-block text-sm font-semibold text-sage-dark">
              View calendar →
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
