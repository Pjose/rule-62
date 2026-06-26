import { requireStaff } from '@/lib/tenant';
import { getRecurringCommitmentsWithPositions } from '@/lib/queries';
import { createHiCommitment } from '@/actions/commitments';
import { Card, FormAction, Input, Label, PageHeader, Select, SubmitButton, Textarea } from '@/components/ui';
import { CommitmentCard, GenerateScheduleButton } from '@/components/admin/CommitmentAdmin';
import { DAY_NAMES } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export default async function AdminHIPage() {
  const { org } = await requireStaff();
  const commitments = await getRecurringCommitmentsWithPositions(org.id, 'hi');

  return (
    <div>
      <PageHeader
        title="Hospitals & Institutions"
        description="Set up recurring facility visits and the panel roles needed for each."
        action={<GenerateScheduleButton kind="hi" />}
      />

      <Card className="mb-8">
        <h2 className="font-display text-lg text-ink mb-3">Add a facility visit</h2>
        <FormAction action={createHiCommitment} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Facility / panel name</Label>
            <Input id="name" name="name" placeholder="County Detox Center — Tuesday Panel" required />
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
            <Label htmlFor="location">Facility address</Label>
            <Input id="location" name="location" placeholder="123 Recovery Way" />
          </div>
          <div>
            <Label htmlFor="format">Notes</Label>
            <Input id="format" name="format" placeholder="Check in at front desk, bring ID…" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="positions">Panel roles (comma-separated)</Label>
            <Textarea id="positions" name="positions" placeholder="Panel Lead, Speaker, Speaker, Literature" required />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton pendingText="Adding…">Add facility visit</SubmitButton>
          </div>
        </FormAction>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {commitments.map(({ commitment, positions }) => (
          <CommitmentCard key={commitment.id} commitment={commitment} positions={positions} kind="hi" />
        ))}
      </div>
    </div>
  );
}
