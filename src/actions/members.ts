'use server';

import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { requireMembership, requireAdmin } from '@/lib/tenant';
import { randomInviteCode, slugify } from '@/lib/utils';
import type { ActionResult } from './auth';

// A member updates their own profile and privacy preferences.
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const { membership } = await requireMembership();

  const displayName = String(formData.get('displayName') || '').trim();
  const fullName = String(formData.get('fullName') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const shareContactInfo = formData.get('shareContactInfo') === 'on';
  const sobrietyDate = String(formData.get('sobrietyDate') || '').trim();
  const shareAnniversary = formData.get('shareAnniversary') === 'on';

  if (!displayName) return { error: 'A display name is required.' };

  await db
    .update(schema.memberships)
    .set({
      displayName,
      fullName: fullName || null,
      phone: phone || null,
      shareContactInfo,
      sobrietyDate: sobrietyDate || null,
      shareAnniversary,
    })
    .where(eq(schema.memberships.id, membership.id));

  revalidatePath('/profile');
  revalidatePath('/admin/roster');
}

// Admins can change a member's role, or deactivate them (keeps history intact
// instead of deleting it).
export async function adminUpdateRole(membershipId: string, role: 'admin' | 'coordinator' | 'member') {
  const { org } = await requireAdmin();
  await db
    .update(schema.memberships)
    .set({ role })
    .where(and(eq(schema.memberships.id, membershipId), eq(schema.memberships.orgId, org.id)));
  revalidatePath('/admin/roster');
}

export async function adminToggleActive(membershipId: string) {
  const { org } = await requireAdmin();
  const rows = await db
    .select()
    .from(schema.memberships)
    .where(and(eq(schema.memberships.id, membershipId), eq(schema.memberships.orgId, org.id)))
    .limit(1);
  const current = rows[0];
  if (!current) return;
  await db.update(schema.memberships).set({ isActive: !current.isActive }).where(eq(schema.memberships.id, membershipId));
  revalidatePath('/admin/roster');
}

export async function regenerateInviteCode() {
  const { org } = await requireAdmin();
  const code = randomInviteCode();
  await db.update(schema.orgs).set({ inviteCode: code }).where(eq(schema.orgs.id, org.id));
  revalidatePath('/admin');
}

export async function updateOrgSettings(formData: FormData): Promise<ActionResult> {
  const { org } = await requireAdmin();
  const name = String(formData.get('name') || '').trim();
  const namedVoting = formData.get('namedVoting') === 'on';
  if (!name) return { error: 'Group name is required.' };

  await db
    .update(schema.orgs)
    .set({ name, namedVoting })
    .where(eq(schema.orgs.id, org.id));

  revalidatePath('/admin');
}
