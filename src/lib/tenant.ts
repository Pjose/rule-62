import 'server-only';
import { redirect } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getSession, setSessionCookie } from './auth';

export type CurrentMembership = {
  membership: typeof schema.memberships.$inferSelect;
  org: typeof schema.orgs.$inferSelect;
};

// Returns the signed-in user's session, or sends them to /login.
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

// Returns the membership + org the user currently has selected, or sends
// them to /switch-org if they haven't picked one yet (e.g. belong to 0 or
// several orgs).
export async function requireMembership(): Promise<CurrentMembership> {
  const session = await requireSession();

  if (!session.currentOrgId) redirect('/switch-org');

  const rows = await db
    .select({ membership: schema.memberships, org: schema.orgs })
    .from(schema.memberships)
    .innerJoin(schema.orgs, eq(schema.orgs.id, schema.memberships.orgId))
    .where(and(eq(schema.memberships.userId, session.userId), eq(schema.memberships.orgId, session.currentOrgId)))
    .limit(1);

  const row = rows[0];
  if (!row) redirect('/switch-org');
  return row;
}

// Same as requireMembership, but also requires an admin/coordinator role.
export async function requireStaff(): Promise<CurrentMembership> {
  const current = await requireMembership();
  if (current.membership.role === 'member') redirect('/dashboard');
  return current;
}

// Same as requireMembership, but requires the org-owner-level admin role.
export async function requireAdmin(): Promise<CurrentMembership> {
  const current = await requireMembership();
  if (current.membership.role !== 'admin') redirect('/dashboard');
  return current;
}

export async function listMembershipsForUser(userId: string) {
  return db
    .select({ membership: schema.memberships, org: schema.orgs })
    .from(schema.memberships)
    .innerJoin(schema.orgs, eq(schema.orgs.id, schema.memberships.orgId))
    .where(eq(schema.memberships.userId, userId));
}

export async function switchOrg(userId: string, orgId: string) {
  const rows = await db
    .select()
    .from(schema.memberships)
    .where(and(eq(schema.memberships.userId, userId), eq(schema.memberships.orgId, orgId)))
    .limit(1);
  if (!rows[0]) throw new Error('Not a member of that group');
  await setSessionCookie({ userId, currentOrgId: orgId });
}
