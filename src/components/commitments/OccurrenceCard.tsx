import { Card } from '@/components/ui';
import { formatDateHuman } from '@/lib/dates';
import { AssignmentRow } from './AssignmentRow';
import { AdminAssignmentRow } from './AdminAssignmentRow';

type Row = {
  assignment: { id: string; status: 'open' | 'filled' };
  position: { id: string; name: string };
  membership: { id: string; displayName: string } | null;
  pendingSwap: { id: string; requestingMembershipId: string; note: string | null } | null;
};

export function OccurrenceCard({
  date,
  subtitle,
  rows,
  currentMembershipId,
  admin,
  rosterOptions,
}: {
  date: string;
  subtitle?: string;
  rows: Row[];
  currentMembershipId: string;
  admin?: boolean;
  rosterOptions?: { id: string; displayName: string }[];
}) {
  const openCount = rows.filter((r) => !r.membership).length;

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h3 className="font-display text-xl text-ink">{formatDateHuman(date)}</h3>
        {openCount > 0 && (
          <span className="font-mono text-xs uppercase tracking-wide text-amber-dark">
            {openCount} open
          </span>
        )}
      </div>
      {subtitle && <p className="text-sm text-inkmuted mb-2">{subtitle}</p>}

      <div className="divide-y divide-rule/60">
        {rows.map((row) =>
          admin && rosterOptions ? (
            <AdminAssignmentRow key={row.assignment.id} row={row} rosterOptions={rosterOptions} />
          ) : (
            <AssignmentRow key={row.assignment.id} row={row} currentMembershipId={currentMembershipId} />
          ),
        )}
      </div>
    </Card>
  );
}
