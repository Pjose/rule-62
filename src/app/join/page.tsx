import Link from 'next/link';
import { joinOrg } from '@/actions/auth';
import { Card, FormAction, Input, Label, SubmitButton } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default function JoinPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <p className="font-mono text-xs uppercase tracking-widest text-sage-dark mb-2">join a group</p>
        <h1 className="font-display text-2xl text-ink mb-1">Enter your invite code</h1>
        <p className="text-sm text-inkmuted mb-6">
          Ask your group's admin for this code. If you already use this app for another group, use
          the same email and password to keep one account.
        </p>

        <FormAction action={joinOrg} className="space-y-4">
          <div>
            <Label htmlFor="inviteCode">Invite code</Label>
            <Input id="inviteCode" name="inviteCode" placeholder="HOPE-1234" required className="font-mono uppercase" />
          </div>
          <div>
            <Label htmlFor="displayName">Your display name</Label>
            <Input id="displayName" name="displayName" placeholder="Maria S." required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>
          <SubmitButton className="w-full" pendingText="Joining…">
            Join group
          </SubmitButton>
        </FormAction>

        <p className="mt-6 text-sm text-inkmuted">
          Starting a brand-new group instead?{' '}
          <Link href="/signup" className="font-semibold text-sage-dark">
            Create one
          </Link>
          .
        </p>
      </Card>
    </main>
  );
}
