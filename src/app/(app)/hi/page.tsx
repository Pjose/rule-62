import { requireMembership } from '@/lib/tenant';
import { getUpcomingSchedule } from '@/actions/commitments';
import { Card, EmptyState, PageHeader } from '@/components/ui';
import { OccurrenceCard } from '@/components/commitments/OccurrenceCard';
import { DAY_NAMES, formatTime12h } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export default async function HIPage() {
  const { membership, org } = await requireMembership();
  const schedule = await getUpcomingSchedule(org.id, 'hi');

  return (
    <div>
      <PageHeader
        title="Hospitals & Institutions"
        description="Panel visits to facilities. Sign up for a visit, or ask for a cover if you can't make it."
      />

      {schedule.length === 0 ? (
        <EmptyState
          title="No H&I panels set up yet"
          description="An admin needs to add a facility and visit schedule before slots appear here."
        />
      ) : (
        <div className="space-y-8">
          {schedule.map(({ commitment, occurrences }) => (
            <section key={commitment.id}>
              <h2 className="font-display text-2xl text-ink mb-1">{commitment.name}</h2>
              <p className="text-sm text-inkmuted mb-3">
                {DAY_NAMES[commitment.dayOfWeek]}s at {formatTime12h(commitment.time)}
                {commitment.location ? ` · ${commitment.location}` : ''}
                {commitment.format ? ` · ${commitment.format}` : ''}
              </p>
              {occurrences.length === 0 ? (
                <Card>
                  <p className="text-sm text-inkmuted">No upcoming visits generated yet for this panel.</p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {occurrences.map(({ occurrence, assignments }) => (
                    <OccurrenceCard
                      key={occurrence.id}
                      date={occurrence.date}
                      rows={assignments}
                      currentMembershipId={membership.id}
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
