'use client';

import * as React from 'react';
import { Badge, Button } from '@/components/ui';
import { claimAssignment, unclaimAssignment, requestSwap, coverSwap, cancelSwapRequest } from '@/actions/commitments';

type Row = {
  assignment: { id: string; status: 'open' | 'filled' };
  position: { id: string; name: string };
  membership: { id: string; displayName: string } | null;
  pendingSwap: { id: string; requestingMembershipId: string; note: string | null } | null;
};

export function AssignmentRow({ row, currentMembershipId }: { row: Row; currentMembershipId: string }) {
  const [pending, setPending] = React.useState(false);
  const [swapOpen, setSwapOpen] = React.useState(false);
  const isMine = row.membership?.id === currentMembershipId;

  async function run(fn: () => Promise<unknown>) {
    setPending(true);
    try {
      await fn();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="w-32 shrink-0 text-sm font-semibold text-inkmuted">{row.position.name}</span>

      <div className="flex-1 border-b border-dotted border-rule pb-1 min-h-[1.75rem] flex items-center">
        {row.membership ? (
          <span className="font-display italic text-ink text-lg leading-none">{row.membership.displayName}</span>
        ) : (
          <span className="text-inkmuted/60 text-sm">unsigned</span>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {!row.membership && (
          <Button variant="accent" size="sm" disabled={pending} onClick={() => run(() => claimAssignment(row.assignment.id))}>
            Sign up
          </Button>
        )}

        {row.membership && row.pendingSwap && (
          <Badge tone="pending">needs a cover</Badge>
        )}

        {row.membership && row.pendingSwap && !isMine && (
          <Button variant="accent" size="sm" disabled={pending} onClick={() => run(() => coverSwap(row.pendingSwap!.id))}>
            I'll cover it
          </Button>
        )}

        {row.membership && row.pendingSwap && isMine && (
          <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => cancelSwapRequest(row.pendingSwap!.id))}>
            Cancel request
          </Button>
        )}

        {row.membership && !row.pendingSwap && isMine && !swapOpen && (
          <>
            <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => unclaimAssignment(row.assignment.id))}>
              Release
            </Button>
            <Button variant="secondary" size="sm" disabled={pending} onClick={() => setSwapOpen(true)}>
              Ask for a cover
            </Button>
          </>
        )}

        {swapOpen && (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const note = (e.currentTarget.elements.namedItem('note') as HTMLInputElement)?.value ?? '';
              run(() => requestSwap(row.assignment.id, note)).then(() => setSwapOpen(false));
            }}
          >
            <input
              name="note"
              placeholder="Optional note"
              className="rounded-card border border-ink/20 bg-white/70 px-2 py-1 text-sm w-36"
            />
            <Button variant="accent" size="sm" type="submit" disabled={pending}>
              Post request
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => setSwapOpen(false)}>
              Cancel
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
