import Link from 'next/link';
import { signupOrg } from '@/actions/auth';
import { Button, Card, FormAction, Input, Label, SubmitButton } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <p className="font-mono text-xs uppercase tracking-widest text-sage-dark mb-2">new group</p>
        <h1 className="font-display text-2xl text-ink mb-1">Start your group's workspace</h1>
        <p className="text-sm text-inkmuted mb-6">
          You'll become this group's first admin and can invite others with a code afterward.
        </p>

        <FormAction action={signupOrg} className="space-y-4">
          <div>
            <Label htmlFor="groupName">Group name</Label>
            <Input id="groupName" name="groupName" placeholder="Tuesday Night Group" required />
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
            <p className="mt-1 text-xs text-inkmuted">At least 8 characters.</p>
          </div>
          <SubmitButton className="w-full" pendingText="Creating…">
            Create group
          </SubmitButton>
        </FormAction>

        <p className="mt-6 text-sm text-inkmuted">
          Joining an existing group?{' '}
          <Link href="/join" className="font-semibold text-sage-dark">
            Use an invite code
          </Link>
          . Already have an account?{' '}
          <Link href="/login" className="font-semibold text-sage-dark">
            Log in
          </Link>
          .
        </p>
      </Card>
    </main>
  );
}
