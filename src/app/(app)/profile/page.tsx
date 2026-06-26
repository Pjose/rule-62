import { requireMembership } from '@/lib/tenant';
import { updateProfile } from '@/actions/members';
import { Card, Checkbox, FormAction, Input, Label, PageHeader, SubmitButton } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const { membership } = await requireMembership();

  return (
    <div className="max-w-lg">
      <PageHeader title="Your profile" description="Control what other members can see about you." />

      <Card>
        <FormAction action={updateProfile} className="space-y-4" resetOnSuccess={false}>
          <div>
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" name="displayName" defaultValue={membership.displayName} required />
            <p className="mt-1 text-xs text-inkmuted">Shown on schedules and the roster, e.g. "Maria S."</p>
          </div>
          <div>
            <Label htmlFor="fullName">Full name (optional)</Label>
            <Input id="fullName" name="fullName" defaultValue={membership.fullName ?? ''} />
          </div>
          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" defaultValue={membership.phone ?? ''} />
          </div>
          <Checkbox name="shareContactInfo" label="Share my full name and phone with other members" defaultChecked={membership.shareContactInfo} />

          <div className="pt-2 border-t border-rule" />

          <div>
            <Label htmlFor="sobrietyDate">Sobriety date (optional)</Label>
            <Input id="sobrietyDate" name="sobrietyDate" type="date" defaultValue={membership.sobrietyDate ?? ''} />
          </div>
          <Checkbox name="shareAnniversary" label="Share my anniversary with the group" defaultChecked={membership.shareAnniversary} />

          <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
        </FormAction>
      </Card>
    </div>
  );
}
