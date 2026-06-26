'use client';

import * as React from 'react';
import { Badge, Button, Card } from '@/components/ui';
import { archiveRecurringCommitment, restoreRecurringCommitment, addPosition, removePosition, generateOccurrences } from '@/actions/commitments';
import { DAY_NAMES, formatTime12h } from '@/lib/dates';

type Kind = 'meeting' | 'hi';

type Commitment = {
  id: string;
  name: string;
  location: string | null;
  dayOfWeek: number;
  time: string;
  format: string | null;
  isActive: boolean;
};

export function GenerateScheduleButton({ kind }: { kind: Kind }) {
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);

  return (
    <Button
      disabled={pending}
      onClick={async () => {
        setPending(true);
        setDone(false);
        try {
          await generateOccurrences(kind, 8);
          setDone(true);
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? 'Rolling schedule forward…' : done ? 'Schedule updated ✓' : 'Roll schedule forward 8 weeks'}
    </Button>
  );
}

export function CommitmentCard({ commitment, positions, kind }: { commitment: Commitment; positions: { id: string; name: string }[]; kind: Kind }) {
  const [pending, setPending] = React.useState(false);
  const [newPosition, setNewPosition] = React.useState('');

  return (
    <Card className={commitment.isActive ? '' : 'opacity-60'}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-ink">{commitment.name}</h3>
          <p className="text-sm text-inkmuted">
            {DAY_NAMES[commitment.dayOfWeek]}s at {formatTime12h(commitment.time)}
            {commitment.location ? ` · ${commitment.location}` : ''}
            {commitment.format ? ` · ${commitment.format}` : ''}
          </p>
        </div>
        {!commitment.isActive && <Badge tone="neutral">archived</Badge>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {positions.map((p) => (
          <span key={p.id} className="inline-flex items-center gap-1 rounded-full border border-rule bg-white/60 px-3 py-1 text-xs text-ink">
            {p.name}
            <button
              aria-label={`Remove ${p.name}`}
              className="text-inkmuted hover:text-brick"
              onClick={async () => {
                setPending(true);
                try {
                  await removePosition(p.id, kind);
                } finally {
                  setPending(false);
                }
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newPosition.trim()) return;
          setPending(true);
          try {
            await addPosition(commitment.id, newPosition.trim(), kind);
            setNewPosition('');
          } finally {
            setPending(false);
          }
        }}
      >
        <input
          value={newPosition}
          onChange={(e) => setNewPosition(e.target.value)}
          placeholder="Add a position"
          className="rounded-card border border-ink/20 bg-white/70 px-2 py-1.5 text-sm flex-1"
        />
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          Add
        </Button>
      </form>

      <div className="mt-4">
        {commitment.isActive ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              try {
                await archiveRecurringCommitment(commitment.id, kind);
              } finally {
                setPending(false);
              }
            }}
          >
            Archive
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              try {
                await restoreRecurringCommitment(commitment.id, kind);
              } finally {
                setPending(false);
              }
            }}
          >
            Restore
          </Button>
        )}
      </div>
    </Card>
  );
}
