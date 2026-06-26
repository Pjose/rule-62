import Link from 'next/link';
import { login } from '@/actions/auth';
import { Card, FormAction, Input, Label, SubmitButton } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <p className="font-mono text-xs uppercase tracking-widest text-sage-dark mb-2">welcome back</p>
        <h1 className="font-display text-2xl text-ink mb-6">Log in</h1>

        <FormAction action={login} className="space-y-4" resetOnSuccess={false}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <SubmitButton className="w-full" pendingText="Logging in…">
            Log in
          </SubmitButton>
        </FormAction>

        <p className="mt-6 text-sm text-inkmuted">
          New here?{' '}
          <Link href="/signup" className="font-semibold text-sage-dark">
            Start a group
          </Link>{' '}
          or{' '}
          <Link href="/join" className="font-semibold text-sage-dark">
            join one with a code
          </Link>
          .
        </p>
      </Card>
    </main>
  );
}
