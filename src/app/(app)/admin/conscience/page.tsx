import { requireStaff } from '@/lib/tenant';
import { getConscienceArchive } from '@/lib/queries';
import { createConscienceMeeting, addMotion, recordVote } from '@/actions/conscience';
import { Badge, Card, FormAction, Input, Label, PageHeader, Select, SubmitButton, Textarea } from '@/components/ui';
import { DeleteMeetingButton, DeleteMotionButton } from '@/components/admin/ConscienceControls';

export const dynamic = 'force-dynamic';

const outcomeTone = { passed: 'filled', failed: 'pending', tabled: 'neutral', pending: 'open' } as const;

export default async function AdminConsciencePage() {
  const { org } = await requireStaff();
  const archive = await getConscienceArchive(org.id);

  return (
    <div>
      <PageHeader title="Group conscience" description="Record group conscience meetings, motions, and vote outcomes." />

      <Card className="mb-8">
        <h2 className="font-display text-lg text-ink mb-3">Record a meeting</h2>
        <FormAction action={createConscienceMeeting} className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Monthly group conscience" required />
          </div>
          <div>
            <Label htmlFor="meetingDate">Date</Label>
            <Input id="meetingDate" name="meetingDate" type="date" required />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" name="notes" />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton pendingText="Saving…">Add meeting</SubmitButton>
          </div>
        </FormAction>
      </Card>

      <div className="space-y-6">
        {archive.map(({ meeting, motions }) => {
          const boundAddMotion = addMotion.bind(null, meeting.id);
          return (
            <Card key={meeting.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg text-ink">{meeting.title}</h3>
                  <p className="text-sm text-inkmuted">{meeting.meetingDate}</p>
                </div>
                <DeleteMeetingButton id={meeting.id} />
              </div>
              {meeting.notes && <p className="mt-2 text-ink whitespace-pre-wrap">{meeting.notes}</p>}

              <div className="mt-4 space-y-4">
                {motions.map((motion) => {
                  const boundRecordVote = recordVote.bind(null, motion.id);
                  return (
                    <div key={motion.id} className="border-t border-rule pt-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{motion.title}</p>
                          {motion.description && <p className="text-sm text-inkmuted">{motion.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge tone={outcomeTone[motion.outcome]}>{motion.outcome}</Badge>
                          <DeleteMotionButton id={motion.id} />
                        </div>
                      </div>
                      <FormAction action={boundRecordVote} className="mt-2 flex flex-wrap items-end gap-2" resetOnSuccess={false}>
                        <div className="w-20">
                          <Label htmlFor={`yes-${motion.id}`}>Yes</Label>
                          <Input id={`yes-${motion.id}`} name="yesCount" type="number" min={0} defaultValue={motion.yesCount} />
                        </div>
                        <div className="w-20">
                          <Label htmlFor={`no-${motion.id}`}>No</Label>
                          <Input id={`no-${motion.id}`} name="noCount" type="number" min={0} defaultValue={motion.noCount} />
                        </div>
                        <div className="w-24">
                          <Label htmlFor={`abstain-${motion.id}`}>Abstain</Label>
                          <Input id={`abstain-${motion.id}`} name="abstainCount" type="number" min={0} defaultValue={motion.abstainCount} />
                        </div>
                        <div>
                          <Label htmlFor={`outcome-${motion.id}`}>Outcome</Label>
                          <Select id={`outcome-${motion.id}`} name="outcome" defaultValue={motion.outcome}>
                            <option value="pending">Pending</option>
                            <option value="passed">Passed</option>
                            <option value="failed">Failed</option>
                            <option value="tabled">Tabled</option>
                          </Select>
                        </div>
                        <SubmitButton size="sm" pendingText="Saving…">
                          Save vote
                        </SubmitButton>
                      </FormAction>
                    </div>
                  );
                })}
              </div>

              <FormAction action={boundAddMotion} className="mt-4 flex flex-wrap items-end gap-2 border-t border-dashed border-rule pt-3">
                <div className="flex-1 min-w-[10rem]">
                  <Label htmlFor={`motion-title-${meeting.id}`}>New motion</Label>
                  <Input id={`motion-title-${meeting.id}`} name="title" placeholder="Motion title" required />
                </div>
                <div className="flex-1 min-w-[10rem]">
                  <Label htmlFor={`motion-desc-${meeting.id}`}>Description (optional)</Label>
                  <Input id={`motion-desc-${meeting.id}`} name="description" />
                </div>
                <SubmitButton size="sm" pendingText="Adding…">
                  Add motion
                </SubmitButton>
              </FormAction>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
