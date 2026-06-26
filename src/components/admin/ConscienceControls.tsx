'use client';

import * as React from 'react';
import { Button } from '@/components/ui';
import { deleteConscienceMeeting, deleteMotion } from '@/actions/conscience';

export function DeleteMeetingButton({ id }: { id: string }) {
  const [pending, setPending] = React.useState(false);
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={async () => {
        if (!confirm('Delete this meeting record and all its motions?')) return;
        setPending(true);
        try {
          await deleteConscienceMeeting(id);
        } finally {
          setPending(false);
        }
      }}
    >
      Delete meeting
    </Button>
  );
}

export function DeleteMotionButton({ id }: { id: string }) {
  const [pending, setPending] = React.useState(false);
  return (
    <button
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await deleteMotion(id);
        } finally {
          setPending(false);
        }
      }}
      className="text-xs text-inkmuted hover:text-brick"
    >
      Remove
    </button>
  );
}
