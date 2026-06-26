import { requireStaff } from '@/lib/tenant';
import { getTrustedServants, getActiveRoster } from '@/lib/queries';
import { createTrustedServantPosition, assignTerm } from '@/actions/trustedServants';
import { Card, FormAction, Input, Label, PageHeader, Select, SubmitButton, Textarea } from '@/components/ui';
import { EndTermButton, DeletePositionButton } from '@/components/admin/TrustedServantControls';

export const dynamic = 'force-dynamic';

export default async function AdminTrustedServantsPage() {
  const { org } = await requireStaff();
  const positions = await getTrustedServants(org.id);
  const roster = await getActiveRoster(org.id);

  return (
    <div>
      <PageHeader title="Trusted servants" description="Define officer and committee positions, and who's currently serving." />

      <Card className="mb-8">
        <h2 className="font-display text-lg text-ink mb-3">Add a position</h2>
        <FormAction action={createTrustedServantPosition} className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="GSR, Alt GSR, Treasurer…" required />
          </div>
          <div>
            <Label htmlFor="termMonths">Term length in months (optional)</Label>
            <Input id="termMonths" name="termMonths" type="number" min={1} placeholder="12" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" name="description" placeholder="What this role is responsible for" />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton pendingText="Adding…">Add position</SubmitButton>
          </div>
        </FormAction>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {positions.map(({ position, current, history }) => (
          <Card key={position.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg text-ink">{position.title}</h3>
                {position.description && <p className="text-sm text-inkmuted">{position.description}</p>}
                {position.termMonths && <p className="text-xs font-mono text-inkmuted mt-0.5">{position.termMonths} month term</p>}
              </div>
              <DeletePositionButton positionId={position.id} />
            </div>

            <div className="mt-3 flex items-center justify-between border-b border-dotted border-rule pb-2">
              {current ? (
                <span className="font-display italic text-ink text-lg">{current.membership.displayName}</span>
              ) : (
                <span className="text-inkmuted/60 text-sm">currently vacant</span>
              )}
              {current && <EndTermButton termId={current.term.id} />}
            </div>

            <FormAction action={assignTerm} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="positionId" value={position.id} />
              <div>
                <Label htmlFor={`member-${position.id}`}>{current ? 'Replace with' : 'Assign to'}</Label>
                <Select id={`member-${position.id}`} name="membershipId" required defaultValue="">
                  <option value="" disabled>
                    Choose a member
                  </option>
                  {roster.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.displayName}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor={`start-${position.id}`}>Start date</Label>
                <Input id={`start-${position.id}`} name="termStart" type="date" required />
              </div>
              <SubmitButton size="sm" pendingText="Saving…">
                Save
              </SubmitButton>
            </FormAction>

            {history.length > 0 && (
              <details className="mt-3">
                <summary className="text-sm font-semibold text-sage-dark cursor-pointer">Past service ({history.length})</summary>
                <ul className="mt-2 space-y-1">
                  {history.map((h) => (
                    <li key={h.term.id} className="text-sm text-inkmuted">
                      {h.membership.displayName} — {h.term.termStart}
                      {h.term.termEnd ? ` to ${h.term.termEnd}` : ''}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
