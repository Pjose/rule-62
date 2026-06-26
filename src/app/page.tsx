import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui';

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect(session.currentOrgId ? '/dashboard' : '/switch-org');

  return (
    <main className="min-h-screen">
      <header className="mx-auto max-w-5xl px-6 pt-8 flex items-center justify-between">
        <span className="font-display text-xl text-ink">The Service Board</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-ink hover:text-sage-dark">
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm">Start a group</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-sage-dark mb-3">
            for AA groups, districts &amp; H&amp;I committees
          </p>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.1] text-ink">
            The clipboard sign-up sheet, <span className="italic">online.</span>
          </h1>
          <p className="mt-5 text-lg text-inkmuted max-w-md">
            Schedule chairs, co-chairs, and H&amp;I panels. Track trusted servant terms. Keep
            announcements, events, and group conscience minutes in one place your group already
            checks before a meeting.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button>Start a group</Button>
            </Link>
            <Link href="/join">
              <Button variant="secondary">Join with an invite code</Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-inkmuted">
            Not affiliated with or endorsed by Alcoholics Anonymous World Services, Inc.
          </p>
        </div>

        <div className="rounded-card border border-rule bg-paper shadow-card p-6 -rotate-1">
          <p className="font-display text-lg text-ink mb-1">Tuesday Night Group</p>
          <p className="text-sm text-inkmuted mb-4">7:30 PM · Open discussion</p>
          <div className="divide-y divide-rule/60">
            {[
              { role: 'Chair', name: 'Maria S.' },
              { role: 'Co-Chair', name: null },
              { role: 'Greeter', name: 'Tom R.' },
              { role: 'Literature', name: null },
              { role: 'Treasurer', name: 'Dee W.' },
            ].map((r) => (
              <div key={r.role} className="flex items-center gap-3 py-2.5">
                <span className="w-24 shrink-0 text-sm font-semibold text-inkmuted">{r.role}</span>
                <div className="flex-1 border-b border-dotted border-rule pb-1">
                  {r.name ? (
                    <span className="font-display italic text-ink text-lg leading-none">{r.name}</span>
                  ) : (
                    <span className="text-inkmuted/60 text-sm">unsigned</span>
                  )}
                </div>
                {!r.name && (
                  <span className="shrink-0 rounded-card bg-amber px-3 py-1 text-xs font-semibold text-ink">Sign up</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Service scheduling', body: 'Rotate chairs, co-chairs, and other weekly positions fairly, with open slots members can claim themselves.' },
          { title: 'H&I panels', body: 'Schedule facility visits and panel teams separately from your regular meeting roles.' },
          { title: 'Announcements & events', body: 'Post updates, anniversaries, and upcoming events so the whole group sees them in one place.' },
          { title: 'Group conscience', body: 'Keep a searchable record of motions and vote outcomes from past group conscience meetings.' },
        ].map((f) => (
          <div key={f.title}>
            <h2 className="font-display text-lg text-ink mb-1">{f.title}</h2>
            <p className="text-sm text-inkmuted">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
