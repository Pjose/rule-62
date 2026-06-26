'use client';

import * as React from 'react';
import { cx } from '@/lib/utils';
import { rsvp } from '@/actions/events';

export function RsvpButtons({ eventId, current }: { eventId: string; current: 'yes' | 'no' | 'maybe' | null }) {
  const [pending, setPending] = React.useState(false);
  const [local, setLocal] = React.useState(current);

  const options: { value: 'yes' | 'maybe' | 'no'; label: string }[] = [
    { value: 'yes', label: "I'm going" },
    { value: 'maybe', label: 'Maybe' },
    { value: 'no', label: "Can't make it" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          disabled={pending}
          onClick={async () => {
            setPending(true);
            setLocal(opt.value);
            try {
              await rsvp(eventId, opt.value);
            } finally {
              setPending(false);
            }
          }}
          className={cx(
            'rounded-card px-3 py-1.5 text-xs font-semibold border transition-colors',
            local === opt.value ? 'bg-sage text-paper border-sage' : 'border-ink/20 text-ink hover:bg-ink/5',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
