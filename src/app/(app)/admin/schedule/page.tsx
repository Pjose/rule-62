import { requireStaff } from '@/lib/tenant';
import { getUpcomingSchedule } from '@/actions/commitments';
import { getActiveRoster } from '@/lib/queries';
import { Card, EmptyState, PageHeader } from '@/components/ui';
import { OccurrenceCard } from '@/components/commitments/OccurrenceCard';
import { DAY_NAMES, formatTime12h } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export default async function AdminSchedulePage() {
  const { membership, org } = await requireStaff();
  const schedule = await getUpcomingSchedule(org.id, 'meeting');
  const roster = await getActiveRoster(org.id);

  return (
    <div>
      <PageHeader title="Assign meetings" description="Directly assign or clear any slot. Members can still self-claim open ones." />

      {schedule.length === 0 ? (
        <EmptyState title="No meetings yet" description="Add a meeting under the Meetings tab first." />
      ) : (
        <div className="space-y-8">
          {schedule.map(({ commitment, occurrences }) => (
            <section key={commitment.id}>
              <h2 className="font-display text-2xl text-ink mb-1">{commitment.name}</h2>
              <p className="text-sm text-inkmuted mb-3">
                {DAY_NAMES[commitment.dayOfWeek]}s at {formatTime12h(commitment.time)}
              </p>
              {occurrences.length === 0 ? (
                <Card>
                  <p className="text-sm text-inkmuted">No upcoming dates yet — use "Roll schedule forward" on the Meetings tab.</p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {occurrences.map(({ occurrence, assignments }) => (
                    <OccurrenceCard
                      key={occurrence.id}
                      date={occurrence.date}
                      rows={assignments}
                      currentMembershipId={membership.id}
                      admin
                      rosterOptions={roster}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
