import { requireStaff } from '@/lib/tenant';
import { getRecurringCommitmentsWithPositions } from '@/lib/queries';
import { createMeetingCommitment } from '@/actions/commitments';
import { Card, FormAction, Input, Label, PageHeader, Select, SubmitButton, Textarea } from '@/components/ui';
import { CommitmentCard, GenerateScheduleButton } from '@/components/admin/CommitmentAdmin';
import { DAY_NAMES } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export default async function AdminMeetingsPage() {
  const { org } = await requireStaff();
  const commitments = await getRecurringCommitmentsWithPositions(org.id, 'meeting');

  return (
    <div>
      <PageHeader
        title="Meetings"
        description="Set up your group's recurring meetings and their service positions."
        action={<GenerateScheduleButton kind="meeting" />}
      />

      <Card className="mb-8">
        <h2 className="font-display text-lg text-ink mb-3">Add a meeting</h2>
        <FormAction action={createMeetingCommitment} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Meeting name</Label>
            <Input id="name" name="name" placeholder="Tuesday Night Group" required />
          </div>
          <div>
            <Label htmlFor="dayOfWeek">Day</Label>
            <Select id="dayOfWeek" name="dayOfWeek" required defaultValue="">
              <option value="" disabled>
                Choose a day
              </option>
              {DAY_NAMES.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="time">Time</Label>
            <Input id="time" name="time" type="time" required />
          </div>
          <div>
            <Label htmlFor="location">Location or link</Label>
            <Input id="location" name="location" placeholder="123 Main St, Room B / Zoom link" />
          </div>
          <div>
            <Label htmlFor="format">Format</Label>
            <Input id="format" name="format" placeholder="Open discussion, Big Book, speaker…" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="positions">Positions (comma-separated)</Label>
            <Textarea id="positions" name="positions" placeholder="Chair, Co-Chair, Greeter, Literature, Treasurer" required />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton pendingText="Adding…">Add meeting</SubmitButton>
          </div>
        </FormAction>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {commitments.map(({ commitment, positions }) => (
          <CommitmentCard key={commitment.id} commitment={commitment} positions={positions} kind="meeting" />
        ))}
      </div>
    </div>
  );
}
