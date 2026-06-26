import { requireStaff } from '@/lib/tenant';
import { getRoster } from '@/lib/queries';
import { Card, PageHeader } from '@/components/ui';
import { RoleSelect, ActiveToggle } from '@/components/admin/RosterControls';

export const dynamic = 'force-dynamic';

export default async function RosterPage() {
  const { membership } = await requireStaff();
  const roster = await getRoster(membership.orgId);
  const canEditRoles = membership.role === 'admin';

  return (
    <div>
      <PageHeader title="Roster" description="Everyone who has joined this group, and their role." />
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-inkmuted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-rule/60">
            {roster.map((m) => (
              <tr key={m.id} className={m.isActive ? '' : 'opacity-50'}>
                <td className="px-4 py-3 font-semibold text-ink">{m.displayName}</td>
                <td className="px-4 py-3 text-inkmuted">
                  {m.shareContactInfo ? [m.fullName, m.phone].filter(Boolean).join(' · ') || '—' : 'private'}
                </td>
                <td className="px-4 py-3">
                  <RoleSelect membershipId={m.id} role={m.role} canEdit={canEditRoles} />
                </td>
                <td className="px-4 py-3 text-inkmuted">{m.isActive ? 'Active' : 'Inactive'}</td>
                <td className="px-4 py-3 text-right">
                  <ActiveToggle membershipId={m.id} isActive={m.isActive} canEdit={canEditRoles} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
