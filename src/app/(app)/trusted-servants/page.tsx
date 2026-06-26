import { requireMembership } from '@/lib/tenant';
import { getTrustedServants } from '@/lib/queries';
import { Card, EmptyState, PageHeader } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function TrustedServantsPage() {
  const { org } = await requireMembership();
  const positions = await getTrustedServants(org.id);

  return (
    <div>
      <PageHeader title="Trusted servants" description="Current officers and committee chairs, and who's served before them." />

      {positions.length === 0 ? (
        <EmptyState title="No positions set up yet" description="An admin can add trusted servant positions like GSR or Treasurer." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {positions.map(({ position, current, history }) => (
            <Card key={position.id}>
              <h2 className="font-display text-lg text-ink">{position.title}</h2>
              {position.description && <p className="text-sm text-inkmuted mt-0.5">{position.description}</p>}

              <div className="mt-3 border-b border-dotted border-rule pb-2">
                {current ? (
                  <span className="font-display italic text-ink text-lg">{current.membership.displayName}</span>
                ) : (
                  <span className="text-inkmuted/60 text-sm">currently vacant</span>
                )}
              </div>

              {history.length > 0 && (
                <details className="mt-2">
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
      )}
    </div>
  );
}
