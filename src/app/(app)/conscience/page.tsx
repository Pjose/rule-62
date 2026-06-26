import { requireMembership } from '@/lib/tenant';
import { getConscienceArchive } from '@/lib/queries';
import { Badge, Card, EmptyState, PageHeader } from '@/components/ui';

export const dynamic = 'force-dynamic';

const outcomeTone = { passed: 'filled', failed: 'pending', tabled: 'neutral', pending: 'open' } as const;

export default async function ConsciencePage() {
  const { org } = await requireMembership();
  const archive = await getConscienceArchive(org.id);

  return (
    <div>
      <PageHeader title="Group conscience" description="A record of past group conscience meetings, motions, and outcomes." />

      {archive.length === 0 ? (
        <EmptyState title="No group conscience meetings recorded yet" />
      ) : (
        <div className="space-y-6">
          {archive.map(({ meeting, motions }) => (
            <Card key={meeting.id}>
              <h2 className="font-display text-lg text-ink">{meeting.title}</h2>
              <p className="text-sm text-inkmuted mb-3">{meeting.meetingDate}</p>
              {meeting.notes && <p className="text-ink whitespace-pre-wrap mb-3">{meeting.notes}</p>}

              {motions.length > 0 && (
                <ul className="divide-y divide-rule/60">
                  {motions.map((motion) => (
                    <li key={motion.id} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{motion.title}</p>
                          {motion.description && <p className="text-sm text-inkmuted mt-0.5">{motion.description}</p>}
                        </div>
                        <Badge tone={outcomeTone[motion.outcome]}>{motion.outcome}</Badge>
                      </div>
                      {(motion.yesCount > 0 || motion.noCount > 0 || motion.abstainCount > 0) && (
                        <p className="mt-1 text-xs font-mono text-inkmuted">
                          {motion.yesCount} yes · {motion.noCount} no · {motion.abstainCount} abstain
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
