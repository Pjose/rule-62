'use server';

import { eq, and, gte, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/db';
import { requireMembership, requireStaff } from '@/lib/tenant';
import { toISODate } from '@/lib/dates';
import { generateOccurrencesForOrg } from '@/lib/scheduling';
import type { ActionResult } from './auth';

type Kind = 'meeting' | 'hi';

// ---------- Setting up recurring meetings / H&I panels ----------

export async function createRecurringCommitment(kind: Kind, formData: FormData): Promise<ActionResult> {
  const { org } = await requireStaff();

  const name = String(formData.get('name') || '').trim();
  const location = String(formData.get('location') || '').trim();
  const dayOfWeek = Number(formData.get('dayOfWeek'));
  const time = String(formData.get('time') || '').trim();
  const format = String(formData.get('format') || '').trim();
  const positionsRaw = String(formData.get('positions') || '');
  const positionNames = positionsRaw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  if (!name || Number.isNaN(dayOfWeek) || !time || positionNames.length === 0) {
    return { error: 'Please provide a name, day, time, and at least one position.' };
  }

  const [commitment] = await db
    .insert(schema.recurringCommitments)
    .values({ orgId: org.id, kind, name, location: location || null, dayOfWeek, time, format: format || null })
    .returning();

  await db.insert(schema.commitmentPositions).values(
    positionNames.map((positionName, i) => ({
      recurringCommitmentId: commitment.id,
      name: positionName,
      sortOrder: i,
    })),
  );

  revalidatePath(kind === 'meeting' ? '/admin/meetings' : '/admin/hi');
}

export async function createMeetingCommitment(formData: FormData) {
  return createRecurringCommitment('meeting', formData);
}

export async function createHiCommitment(formData: FormData) {
  return createRecurringCommitment('hi', formData);
}

export async function archiveRecurringCommitment(id: string, kind: Kind) {
  const { org } = await requireStaff();
  await db
    .update(schema.recurringCommitments)
    .set({ isActive: false })
    .where(and(eq(schema.recurringCommitments.id, id), eq(schema.recurringCommitments.orgId, org.id)));
  revalidatePath(kind === 'meeting' ? '/admin/meetings' : '/admin/hi');
}

export async function restoreRecurringCommitment(id: string, kind: Kind) {
  const { org } = await requireStaff();
  await db
    .update(schema.recurringCommitments)
    .set({ isActive: true })
    .where(and(eq(schema.recurringCommitments.id, id), eq(schema.recurringCommitments.orgId, org.id)));
  revalidatePath(kind === 'meeting' ? '/admin/meetings' : '/admin/hi');
}

export async function addPosition(recurringCommitmentId: string, name: string, kind: Kind) {
  const { org } = await requireStaff();
  const rows = await db
    .select()
    .from(schema.recurringCommitments)
    .where(and(eq(schema.recurringCommitments.id, recurringCommitmentId), eq(schema.recurringCommitments.orgId, org.id)))
    .limit(1);
  if (!rows[0]) return;
  await db.insert(schema.commitmentPositions).values({ recurringCommitmentId, name: name.trim(), sortOrder: 99 });
  revalidatePath(kind === 'meeting' ? '/admin/meetings' : '/admin/hi');
}

export async function removePosition(positionId: string, kind: Kind) {
  await requireStaff();
  await db.delete(schema.commitmentPositions).where(eq(schema.commitmentPositions.id, positionId));
  revalidatePath(kind === 'meeting' ? '/admin/meetings' : '/admin/hi');
}

// ---------- Rolling the schedule forward ----------

// Generates occurrences (and one open assignment per position) for every
// active recurring commitment of the given kind, for the next `weeksAhead`
// weeks. Safe to call repeatedly — it skips dates that already exist.
export async function generateOccurrences(kind: Kind, weeksAhead = 8) {
  const { org } = await requireStaff();
  await generateOccurrencesForOrg(org.id, kind, weeksAhead);

  revalidatePath(kind === 'meeting' ? '/schedule' : '/hi');
  revalidatePath(kind === 'meeting' ? '/admin/schedule' : '/admin/hi');
}

// ---------- Reading the schedule ----------

export async function getUpcomingSchedule(orgId: string, kind: Kind, weeksAhead = 8) {
  const commitments = await db
    .select()
    .from(schema.recurringCommitments)
    .where(
      and(
        eq(schema.recurringCommitments.orgId, orgId),
        eq(schema.recurringCommitments.kind, kind),
        eq(schema.recurringCommitments.isActive, true),
      ),
    );
  if (commitments.length === 0) return [];

  const commitmentIds = commitments.map((c) => c.id);
  const todayISO = toISODate(new Date());

  const occ = await db
    .select()
    .from(schema.occurrences)
    .where(and(inArray(schema.occurrences.recurringCommitmentId, commitmentIds), gte(schema.occurrences.date, todayISO)));

  const occurrenceIds = occ.map((o) => o.id);
  const allAssignments = occurrenceIds.length
    ? await db
        .select({
          assignment: schema.assignments,
          position: schema.commitmentPositions,
          membership: schema.memberships,
        })
        .from(schema.assignments)
        .innerJoin(schema.commitmentPositions, eq(schema.commitmentPositions.id, schema.assignments.positionId))
        .leftJoin(schema.memberships, eq(schema.memberships.id, schema.assignments.membershipId))
        .where(inArray(schema.assignments.occurrenceId, occurrenceIds))
    : [];

  const assignmentIds = allAssignments.map((a) => a.assignment.id);
  const pendingSwaps = assignmentIds.length
    ? await db
        .select()
        .from(schema.swapRequests)
        .where(and(inArray(schema.swapRequests.assignmentId, assignmentIds), eq(schema.swapRequests.status, 'pending')))
    : [];

  const byCommitment = commitments
    .map((commitment) => {
      const occurrences = occ
        .filter((o) => o.recurringCommitmentId === commitment.id)
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .map((occurrence) => ({
          occurrence,
          assignments: allAssignments
            .filter((a) => a.assignment.occurrenceId === occurrence.id)
            .sort((a, b) => a.position.sortOrder - b.position.sortOrder)
            .map((a) => ({
              ...a,
              pendingSwap: pendingSwaps.find((s) => s.assignmentId === a.assignment.id) ?? null,
            })),
        }));
      return { commitment, occurrences };
    })
    .sort((a, b) => a.commitment.dayOfWeek - b.commitment.dayOfWeek);

  return byCommitment;
}

// ---------- Claiming, releasing, and swapping ----------

async function loadAssignmentInOrg(assignmentId: string, orgId: string) {
  const rows = await db
    .select({
      assignment: schema.assignments,
      occurrence: schema.occurrences,
      commitment: schema.recurringCommitments,
    })
    .from(schema.assignments)
    .innerJoin(schema.occurrences, eq(schema.occurrences.id, schema.assignments.occurrenceId))
    .innerJoin(schema.recurringCommitments, eq(schema.recurringCommitments.id, schema.occurrences.recurringCommitmentId))
    .where(and(eq(schema.assignments.id, assignmentId), eq(schema.recurringCommitments.orgId, orgId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function claimAssignment(assignmentId: string): Promise<ActionResult> {
  const { membership, org } = await requireMembership();
  const found = await loadAssignmentInOrg(assignmentId, org.id);
  if (!found) return { error: 'That commitment could not be found.' };
  if (found.assignment.status !== 'open') return { error: 'Someone already claimed that slot.' };

  await db
    .update(schema.assignments)
    .set({ membershipId: membership.id, status: 'filled', claimedAt: new Date() })
    .where(eq(schema.assignments.id, assignmentId));

  revalidatePath(found.commitment.kind === 'meeting' ? '/schedule' : '/hi');
  revalidatePath('/dashboard');
}

export async function unclaimAssignment(assignmentId: string): Promise<ActionResult> {
  const { membership, org } = await requireMembership();
  const found = await loadAssignmentInOrg(assignmentId, org.id);
  if (!found) return { error: 'That commitment could not be found.' };
  if (found.assignment.membershipId !== membership.id) return { error: 'You can only release your own commitments.' };

  await db
    .update(schema.assignments)
    .set({ membershipId: null, status: 'open', claimedAt: null })
    .where(eq(schema.assignments.id, assignmentId));

  revalidatePath(found.commitment.kind === 'meeting' ? '/schedule' : '/hi');
  revalidatePath('/dashboard');
}

export async function adminAssign(assignmentId: string, membershipId: string | null): Promise<ActionResult> {
  const { org } = await requireStaff();
  const found = await loadAssignmentInOrg(assignmentId, org.id);
  if (!found) return { error: 'That commitment could not be found.' };

  await db
    .update(schema.assignments)
    .set({
      membershipId,
      status: membershipId ? 'filled' : 'open',
      claimedAt: membershipId ? new Date() : null,
    })
    .where(eq(schema.assignments.id, assignmentId));

  revalidatePath(found.commitment.kind === 'meeting' ? '/admin/schedule' : '/admin/hi');
  revalidatePath(found.commitment.kind === 'meeting' ? '/schedule' : '/hi');
}

export async function requestSwap(assignmentId: string, note: string): Promise<ActionResult> {
  const { membership, org } = await requireMembership();
  const found = await loadAssignmentInOrg(assignmentId, org.id);
  if (!found) return { error: 'That commitment could not be found.' };
  if (found.assignment.membershipId !== membership.id) return { error: 'You can only request a swap for your own commitment.' };

  await db.insert(schema.swapRequests).values({
    assignmentId,
    requestingMembershipId: membership.id,
    note: note.trim() || null,
  });

  revalidatePath(found.commitment.kind === 'meeting' ? '/schedule' : '/hi');
}

export async function coverSwap(swapRequestId: string): Promise<ActionResult> {
  const { membership, org } = await requireMembership();

  const rows = await db
    .select({ swap: schema.swapRequests, assignment: schema.assignments, commitment: schema.recurringCommitments })
    .from(schema.swapRequests)
    .innerJoin(schema.assignments, eq(schema.assignments.id, schema.swapRequests.assignmentId))
    .innerJoin(schema.occurrences, eq(schema.occurrences.id, schema.assignments.occurrenceId))
    .innerJoin(schema.recurringCommitments, eq(schema.recurringCommitments.id, schema.occurrences.recurringCommitmentId))
    .where(and(eq(schema.swapRequests.id, swapRequestId), eq(schema.recurringCommitments.orgId, org.id)))
    .limit(1);

  const found = rows[0];
  if (!found || found.swap.status !== 'pending') return { error: 'That swap request is no longer open.' };

  await db
    .update(schema.assignments)
    .set({ membershipId: membership.id, status: 'filled', claimedAt: new Date() })
    .where(eq(schema.assignments.id, found.assignment.id));

  await db
    .update(schema.swapRequests)
    .set({ status: 'covered', coveringMembershipId: membership.id, resolvedAt: new Date() })
    .where(eq(schema.swapRequests.id, swapRequestId));

  revalidatePath(found.commitment.kind === 'meeting' ? '/schedule' : '/hi');
  revalidatePath('/dashboard');
}

export async function cancelSwapRequest(swapRequestId: string): Promise<ActionResult> {
  const { membership } = await requireMembership();
  await db
    .update(schema.swapRequests)
    .set({ status: 'cancelled', resolvedAt: new Date() })
    .where(and(eq(schema.swapRequests.id, swapRequestId), eq(schema.swapRequests.requestingMembershipId, membership.id)));
  revalidatePath('/schedule');
  revalidatePath('/hi');
}
