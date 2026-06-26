'use server';

import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { requireStaff } from '@/lib/tenant';
import type { ActionResult } from './auth';

export async function createConscienceMeeting(formData: FormData): Promise<ActionResult> {
  const { org, membership } = await requireStaff();
  const title = String(formData.get('title') || '').trim();
  const meetingDate = String(formData.get('meetingDate') || '').trim();
  const notes = String(formData.get('notes') || '').trim();

  if (!title || !meetingDate) return { error: 'Please add a title and a date.' };

  const [created] = await db
    .insert(schema.conscienceMeetings)
    .values({ orgId: org.id, title, meetingDate, notes: notes || null, createdByMembershipId: membership.id })
    .returning();

  revalidatePath('/conscience');
  revalidatePath('/admin/conscience');
  return undefined;
}

export async function deleteConscienceMeeting(id: string) {
  const { org } = await requireStaff();
  await db.delete(schema.conscienceMeetings).where(and(eq(schema.conscienceMeetings.id, id), eq(schema.conscienceMeetings.orgId, org.id)));
  revalidatePath('/conscience');
  revalidatePath('/admin/conscience');
}

export async function addMotion(conscienceMeetingId: string, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  if (!title) return { error: 'A motion needs a title.' };

  await db.insert(schema.motions).values({
    conscienceMeetingId,
    title,
    description: description || null,
  });

  revalidatePath('/conscience');
  revalidatePath('/admin/conscience');
}

export async function recordVote(motionId: string, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const yesCount = Number(formData.get('yesCount') || 0);
  const noCount = Number(formData.get('noCount') || 0);
  const abstainCount = Number(formData.get('abstainCount') || 0);
  const outcome = String(formData.get('outcome') || 'pending') as 'pending' | 'passed' | 'failed' | 'tabled';

  await db
    .update(schema.motions)
    .set({ yesCount, noCount, abstainCount, outcome })
    .where(eq(schema.motions.id, motionId));

  revalidatePath('/conscience');
  revalidatePath('/admin/conscience');
}

export async function deleteMotion(motionId: string) {
  await requireStaff();
  await db.delete(schema.motions).where(eq(schema.motions.id, motionId));
  revalidatePath('/conscience');
  revalidatePath('/admin/conscience');
}
