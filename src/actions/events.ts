'use server';

import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { requireMembership, requireStaff } from '@/lib/tenant';
import type { ActionResult } from './auth';

export async function createEvent(formData: FormData): Promise<ActionResult> {
  const { org, membership } = await requireStaff();
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const location = String(formData.get('location') || '').trim();
  const startAtRaw = String(formData.get('startAt') || '').trim();
  const endAtRaw = String(formData.get('endAt') || '').trim();

  if (!title || !startAtRaw) return { error: 'An event needs at least a title and a start time.' };

  await db.insert(schema.events).values({
    orgId: org.id,
    title,
    description: description || null,
    location: location || null,
    startAt: new Date(startAtRaw),
    endAt: endAtRaw ? new Date(endAtRaw) : null,
    createdByMembershipId: membership.id,
  });

  revalidatePath('/events');
  revalidatePath('/dashboard');
  revalidatePath('/admin/events');
}

export async function deleteEvent(eventId: string) {
  const { org } = await requireStaff();
  await db.delete(schema.events).where(and(eq(schema.events.id, eventId), eq(schema.events.orgId, org.id)));
  revalidatePath('/events');
  revalidatePath('/admin/events');
}

export async function rsvp(eventId: string, status: 'yes' | 'no' | 'maybe') {
  const { membership } = await requireMembership();

  const existing = await db
    .select()
    .from(schema.eventRsvps)
    .where(and(eq(schema.eventRsvps.eventId, eventId), eq(schema.eventRsvps.membershipId, membership.id)))
    .limit(1);

  if (existing[0]) {
    await db.update(schema.eventRsvps).set({ status }).where(eq(schema.eventRsvps.id, existing[0].id));
  } else {
    await db.insert(schema.eventRsvps).values({ eventId, membershipId: membership.id, status });
  }

  revalidatePath('/events');
}
