import { requireStaff } from '@/lib/tenant';
import { getEvents } from '@/lib/queries';
import { createEvent } from '@/actions/events';
import { Card, FormAction, Input, Label, PageHeader, SubmitButton, Textarea } from '@/components/ui';
import { DeleteEventButton } from '@/components/admin/DeleteEventButton';
import { formatDateTimeHuman } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  const { org } = await requireStaff();
  const events = await getEvents(org.id);

  return (
    <div>
      <PageHeader title="Events" description="District events, conventions, retreats, and social gatherings." />

      <Card className="mb-8">
        <h2 className="font-display text-lg text-ink mb-3">Add an event</h2>
        <FormAction action={createEvent} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="startAt">Starts</Label>
            <Input id="startAt" name="startAt" type="datetime-local" required />
          </div>
          <div>
            <Label htmlFor="endAt">Ends (optional)</Label>
            <Input id="endAt" name="endAt" type="datetime-local" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" name="description" />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton pendingText="Adding…">Add event</SubmitButton>
          </div>
        </FormAction>
      </Card>

      <div className="space-y-3">
        {events.map(({ event, rsvps }) => {
          const yes = rsvps.filter((r) => r.status === 'yes').length;
          const maybe = rsvps.filter((r) => r.status === 'maybe').length;
          return (
            <Card key={event.id} className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg text-ink">{event.title}</h3>
                <p className="text-sm text-inkmuted">
                  {formatDateTimeHuman(event.startAt)}
                  {event.location ? ` · ${event.location}` : ''}
                </p>
                <p className="text-xs font-mono text-inkmuted mt-1">
                  {yes} going · {maybe} maybe
                </p>
              </div>
              <DeleteEventButton eventId={event.id} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
