'use client';

import * as React from 'react';
import { Button } from '@/components/ui';
import { endTerm, deleteTrustedServantPosition } from '@/actions/trustedServants';

export function EndTermButton({ termId }: { termId: string }) {
  const [pending, setPending] = React.useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await endTerm(termId);
        } finally {
          setPending(false);
        }
      }}
    >
      End term
    </Button>
  );
}

export function DeletePositionButton({ positionId }: { positionId: string }) {
  const [pending, setPending] = React.useState(false);
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={async () => {
        if (!confirm('Delete this position and all its history?')) return;
        setPending(true);
        try {
          await deleteTrustedServantPosition(positionId);
        } finally {
          setPending(false);
        }
      }}
    >
      Delete
    </Button>
  );
}
