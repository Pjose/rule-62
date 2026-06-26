import { requireAdmin } from '@/lib/tenant';
import { updateOrgSettings, regenerateInviteCode } from '@/actions/members';
import { Button, Card, Checkbox, FormAction, Input, Label, PageHeader, SubmitButton } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function AdminOrgSettingsPage() {
  const { org } = await requireAdmin();

  return (
    <div className="max-w-lg">
      <PageHeader title="Org settings" />

      <Card className="mb-6">
        <h2 className="font-display text-lg text-ink mb-3">Group details</h2>
        <FormAction action={updateOrgSettings} className="space-y-4" resetOnSuccess={false}>
          <div>
            <Label htmlFor="name">Group name</Label>
            <Input id="name" name="name" defaultValue={org.name} required />
          </div>
          <Checkbox
            name="namedVoting"
            label="Record group conscience votes by name (default: totals only, to protect anonymity)"
            defaultChecked={org.namedVoting}
          />
          <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
        </FormAction>
      </Card>

      <Card>
        <h2 className="font-display text-lg text-ink mb-2">Invite code</h2>
        <p className="text-sm text-inkmuted mb-3">Share this with new or existing members so they can join the group.</p>
        <p className="font-mono text-xl text-sage-dark mb-4">{org.inviteCode}</p>
        <form action={regenerateInviteCode}>
          <Button variant="secondary" size="sm" type="submit">
            Generate a new code
          </Button>
        </form>
        <p className="mt-2 text-xs text-inkmuted">Generating a new code immediately invalidates the old one.</p>
      </Card>
    </div>
  );
}
