'use server';

import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { requireMembership, requireStaff } from '@/lib/tenant';
import type { ActionResult } from './auth';

export async function createPost(type: 'announcement' | 'news', formData: FormData): Promise<ActionResult> {
  const { org, membership } = await requireStaff();
  const title = String(formData.get('title') || '').trim();
  const body = String(formData.get('body') || '').trim();
  const pinned = formData.get('pinned') === 'on';
  const expiresAtRaw = String(formData.get('expiresAt') || '').trim();

  if (!title || !body) return { error: 'Please add a title and a message.' };

  await db.insert(schema.posts).values({
    orgId: org.id,
    type,
    title,
    body,
    pinned,
    createdByMembershipId: membership.id,
    expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
  });

  revalidatePath('/announcements');
  revalidatePath('/dashboard');
  revalidatePath('/admin/announcements');
}

export async function createAnnouncement(formData: FormData) {
  return createPost('announcement', formData);
}

export async function createNewsPost(formData: FormData) {
  return createPost('news', formData);
}

export async function deletePost(postId: string) {
  const { org } = await requireStaff();
  await db.delete(schema.posts).where(and(eq(schema.posts.id, postId), eq(schema.posts.orgId, org.id)));
  revalidatePath('/announcements');
  revalidatePath('/dashboard');
  revalidatePath('/admin/announcements');
}

export async function togglePin(postId: string) {
  const { org } = await requireStaff();
  const rows = await db.select().from(schema.posts).where(and(eq(schema.posts.id, postId), eq(schema.posts.orgId, org.id))).limit(1);
  const post = rows[0];
  if (!post) return;
  await db.update(schema.posts).set({ pinned: !post.pinned }).where(eq(schema.posts.id, postId));
  revalidatePath('/announcements');
  revalidatePath('/admin/announcements');
}
