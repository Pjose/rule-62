'use client';

import * as React from 'react';
import { Button } from '@/components/ui';
import { deletePost, togglePin } from '@/actions/posts';

export function PostControls({ postId, pinned }: { postId: string; pinned: boolean }) {
  const [pending, setPending] = React.useState(false);

  return (
    <div className="flex gap-2 shrink-0">
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          try {
            await togglePin(postId);
          } finally {
            setPending(false);
          }
        }}
      >
        {pinned ? 'Unpin' : 'Pin'}
      </Button>
      <Button
        variant="danger"
        size="sm"
        disabled={pending}
        onClick={async () => {
          if (!confirm('Delete this post?')) return;
          setPending(true);
          try {
            await deletePost(postId);
          } finally {
            setPending(false);
          }
        }}
      >
        Delete
      </Button>
    </div>
  );
}
