import { requireMembership } from '@/lib/tenant';
import { getEvents } from '@/lib/queries';
import { Card, EmptyState, PageHeader } from '@/components/ui';
import { RsvpButtons } from '@/components/events/RsvpButtons';
import { formatDateTimeHuman } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const { membership, org } = await requireMembership();
  const events = await getEvents(org.id);
  const now = new Date();
  const upcoming = events.filter((e) => e.event.startAt >= now);
  const past = events.filter((e) => e.event.startAt < now).slice(0, 5);

  return (
    <div>
      <PageHeader title="Events" description="District events, conventions, retreats, and group get-togethers." />

      {upcoming.length === 0 ? (
        <EmptyState title="Nothing on the calendar yet" />
      ) : (
        <div className="space-y-4">
          {upcoming.map(({ event, rsvps }) => {
            const yesCount = rsvps.filter((r) => r.status === 'yes').length;
            const mine = rsvps.find((r) => r.membershipId === membership.id)?.status ?? null;
            return (
              <Card key={event.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg text-ink">{event.title}</h3>
                    <p className="text-sm text-inkmuted">
                      {formatDateTimeHuman(event.startAt)}
                      {event.location ? ` · ${event.location}` : ''}
                    </p>
                    {event.description && <p className="mt-2 text-ink whitespace-pre-wrap">{event.description}</p>}
                  </div>
                  <span className="font-mono text-xs text-sage-dark whitespace-nowrap">{yesCount} going</span>
                </div>
                <div className="mt-3">
                  <RsvpButtons eventId={event.id} current={mine} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {past.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-ink mb-3">Past events</h2>
          <ul className="space-y-1 text-sm text-inkmuted">
            {past.map(({ event }) => (
              <li key={event.id}>
                {event.title} — {formatDateTimeHuman(event.startAt)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
