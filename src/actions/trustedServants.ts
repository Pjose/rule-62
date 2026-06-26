'use server';

import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { requireStaff } from '@/lib/tenant';
import type { ActionResult } from './auth';

export async function createTrustedServantPosition(formData: FormData): Promise<ActionResult> {
  const { org } = await requireStaff();
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const termMonthsRaw = String(formData.get('termMonths') || '').trim();

  if (!title) return { error: 'A title is required (e.g. GSR, Treasurer, Secretary).' };

  await db.insert(schema.trustedServantPositions).values({
    orgId: org.id,
    title,
    description: description || null,
    termMonths: termMonthsRaw ? Number(termMonthsRaw) : null,
  });

  revalidatePath('/admin/trusted-servants');
  revalidatePath('/trusted-servants');
}

export async function deleteTrustedServantPosition(positionId: string) {
  const { org } = await requireStaff();
  await db
    .delete(schema.trustedServantPositions)
    .where(and(eq(schema.trustedServantPositions.id, positionId), eq(schema.trustedServantPositions.orgId, org.id)));
  revalidatePath('/admin/trusted-servants');
  revalidatePath('/trusted-servants');
}

// Starts a new term for a position. If someone is currently serving, their
// term is closed out first so history stays intact.
export async function assignTerm(formData: FormData): Promise<ActionResult> {
  const { org } = await requireStaff();
  const positionId = String(formData.get('positionId') || '');
  const membershipId = String(formData.get('membershipId') || '');
  const termStart = String(formData.get('termStart') || '').trim();

  if (!positionId || !membershipId || !termStart) return { error: 'Please choose a member and a start date.' };

  const positionRows = await db
    .select()
    .from(schema.trustedServantPositions)
    .where(and(eq(schema.trustedServantPositions.id, positionId), eq(schema.trustedServantPositions.orgId, org.id)))
    .limit(1);
  const position = positionRows[0];
  if (!position) return { error: 'Position not found.' };

  await db
    .update(schema.trustedServantTerms)
    .set({ isCurrent: false, termEnd: termStart })
    .where(and(eq(schema.trustedServantTerms.positionId, positionId), eq(schema.trustedServantTerms.isCurrent, true)));

  let termEnd: string | null = null;
  if (position.termMonths) {
    const end = new Date(`${termStart}T00:00:00`);
    end.setMonth(end.getMonth() + position.termMonths);
    termEnd = end.toISOString().slice(0, 10);
  }

  await db.insert(schema.trustedServantTerms).values({
    positionId,
    membershipId,
    termStart,
    termEnd,
    isCurrent: true,
  });

  revalidatePath('/admin/trusted-servants');
  revalidatePath('/trusted-servants');
}

export async function endTerm(termId: string) {
  await requireStaff();
  await db
    .update(schema.trustedServantTerms)
    .set({ isCurrent: false, termEnd: new Date().toISOString().slice(0, 10) })
    .where(eq(schema.trustedServantTerms.id, termId));
  revalidatePath('/admin/trusted-servants');
  revalidatePath('/trusted-servants');
}
