'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, getSession } from '@/lib/auth';
import { listMembershipsForUser, switchOrg } from '@/lib/tenant';
import { randomInviteCode, slugify } from '@/lib/utils';

export type ActionResult = { error?: string } | void;

// Creates a brand-new group workspace. The person submitting this becomes
// that group's first admin.
export async function signupOrg(formData: FormData): Promise<ActionResult> {
  const groupName = String(formData.get('groupName') || '').trim();
  const displayName = String(formData.get('displayName') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!groupName || !displayName || !email || password.length < 8) {
    return { error: 'Please fill in every field. Passwords need at least 8 characters.' };
  }

  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existing[0]) {
    return { error: 'An account already exists with that email. Try logging in instead.' };
  }

  const baseSlug = slugify(groupName) || 'group';
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const taken = await db.select().from(schema.orgs).where(eq(schema.orgs.slug, slug)).limit(1);
    if (!taken[0]) break;
    slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
  }

  const [org] = await db
    .insert(schema.orgs)
    .values({ name: groupName, slug, inviteCode: randomInviteCode() })
    .returning();

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(schema.users).values({ email, passwordHash }).returning();

  await db.insert(schema.memberships).values({
    userId: user.id,
    orgId: org.id,
    role: 'admin',
    displayName,
  });

  await setSessionCookie({ userId: user.id, currentOrgId: org.id });
  redirect('/dashboard');
}

// Joins an existing group using its invite code. Works for brand-new people
// (creates an account) and for people who already have an account and are
// adding a second group (e.g. home group + H&I committee).
export async function joinOrg(formData: FormData): Promise<ActionResult> {
  const inviteCode = String(formData.get('inviteCode') || '').trim().toUpperCase();
  const displayName = String(formData.get('displayName') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!inviteCode || !displayName || !email || password.length < 8) {
    return { error: 'Please fill in every field. Passwords need at least 8 characters.' };
  }

  const orgRows = await db.select().from(schema.orgs).where(eq(schema.orgs.inviteCode, inviteCode)).limit(1);
  const org = orgRows[0];
  if (!org) {
    return { error: "We couldn't find a group with that invite code. Double-check it with whoever sent it to you." };
  }

  let userRows = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  let user = userRows[0];

  if (user) {
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return { error: 'That email already has an account. Enter its existing password to continue, or use a different email.' };
    }
  } else {
    const passwordHash = await hashPassword(password);
    const [created] = await db.insert(schema.users).values({ email, passwordHash }).returning();
    user = created;
  }

  const already = await db
    .select()
    .from(schema.memberships)
    .where(eq(schema.memberships.userId, user.id))
    .then((rows) => rows.find((r) => r.orgId === org.id));

  if (!already) {
    await db.insert(schema.memberships).values({
      userId: user.id,
      orgId: org.id,
      role: 'member',
      displayName,
    });
  }

  await setSessionCookie({ userId: user.id, currentOrgId: org.id });
  redirect('/dashboard');
}

export async function login(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  const rows = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: 'That email and password combination doesn\'t match our records.' };
  }

  const memberships = await listMembershipsForUser(user.id);
  if (memberships.length === 1) {
    await switchOrg(user.id, memberships[0].org.id);
    redirect('/dashboard');
  }

  await setSessionCookie({ userId: user.id, currentOrgId: null });
  redirect('/switch-org');
}

export async function logout() {
  await clearSessionCookie();
  redirect('/login');
}

export async function selectOrg(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login');
  const orgId = String(formData.get('orgId') || '');
  await switchOrg(session.userId, orgId);
  redirect('/dashboard');
}
