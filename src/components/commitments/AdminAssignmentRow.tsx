'use client';

import * as React from 'react';
import { Badge } from '@/components/ui';
import { adminAssign } from '@/actions/commitments';

type Row = {
  assignment: { id: string; status: 'open' | 'filled' };
  position: { id: string; name: string };
  membership: { id: string; displayName: string } | null;
  pendingSwap: { id: string; note: string | null } | null;
};

export function AdminAssignmentRow({ row, rosterOptions }: { row: Row; rosterOptions: { id: string; displayName: string }[] }) {
  const [pending, setPending] = React.useState(false);

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="w-32 shrink-0 text-sm font-semibold text-inkmuted">{row.position.name}</span>

      <div className="flex-1 flex items-center gap-2">
        <select
          className="rounded-card border border-ink/20 bg-white/70 px-2 py-1.5 text-sm flex-1 max-w-xs"
          value={row.membership?.id ?? ''}
          disabled={pending}
          onChange={async (e) => {
            setPending(true);
            try {
              await adminAssign(row.assignment.id, e.target.value || null);
            } finally {
              setPending(false);
            }
          }}
        >
          <option value="">— unsigned —</option>
          {rosterOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.displayName}
            </option>
          ))}
        </select>
        {row.pendingSwap && <Badge tone="pending">cover requested</Badge>}
      </div>
    </div>
  );
}
