'use client';

import * as React from 'react';
import { Button } from '@/components/ui';
import { deleteEvent } from '@/actions/events';

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [pending, setPending] = React.useState(false);
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={async () => {
        if (!confirm('Delete this event?')) return;
        setPending(true);
        try {
          await deleteEvent(eventId);
        } finally {
          setPending(false);
        }
      }}
    >
      Delete
    </Button>
  );
}
