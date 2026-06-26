'use client';

import * as React from 'react';
import { adminUpdateRole, adminToggleActive } from '@/actions/members';
import { Button } from '@/components/ui';

export function RoleSelect({ membershipId, role, canEdit }: { membershipId: string; role: 'admin' | 'coordinator' | 'member'; canEdit: boolean }) {
  const [pending, setPending] = React.useState(false);

  if (!canEdit) return <span className="text-sm capitalize text-inkmuted">{role}</span>;

  return (
    <select
      className="rounded-card border border-ink/20 bg-white/70 px-2 py-1 text-sm capitalize"
      value={role}
      disabled={pending}
      onChange={async (e) => {
        setPending(true);
        try {
          await adminUpdateRole(membershipId, e.target.value as 'admin' | 'coordinator' | 'member');
        } finally {
          setPending(false);
        }
      }}
    >
      <option value="member">Member</option>
      <option value="coordinator">Coordinator</option>
      <option value="admin">Admin</option>
    </select>
  );
}

export function ActiveToggle({ membershipId, isActive, canEdit }: { membershipId: string; isActive: boolean; canEdit: boolean }) {
  const [pending, setPending] = React.useState(false);
  if (!canEdit) return null;

  return (
    <Button
      variant={isActive ? 'ghost' : 'secondary'}
      size="sm"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await adminToggleActive(membershipId);
        } finally {
          setPending(false);
        }
      }}
    >
      {isActive ? 'Deactivate' : 'Reactivate'}
    </Button>
  );
}
