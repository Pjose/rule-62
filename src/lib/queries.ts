import 'server-only';
import { eq, and, gte, or, isNull, desc, asc, inArray } from 'drizzle-orm';
import { db, schema } from '@/db';
import { toISODate } from './dates';

export async function getRecurringCommitmentsWithPositions(orgId: string, kind: 'meeting' | 'hi') {
  const commitments = await db
    .select()
    .from(schema.recurringCommitments)
    .where(and(eq(schema.recurringCommitments.orgId, orgId), eq(schema.recurringCommitments.kind, kind)))
    .orderBy(asc(schema.recurringCommitments.dayOfWeek));

  const ids = commitments.map((c) => c.id);
  const positions = ids.length
    ? await db
        .select()
        .from(schema.commitmentPositions)
        .where(inArray(schema.commitmentPositions.recurringCommitmentId, ids))
        .orderBy(asc(schema.commitmentPositions.sortOrder))
    : [];

  return commitments.map((commitment) => ({
    commitment,
    positions: positions.filter((p) => p.recurringCommitmentId === commitment.id),
  }));
}

export async function getRoster(orgId: string) {
  return db
    .select()
    .from(schema.memberships)
    .where(eq(schema.memberships.orgId, orgId))
    .orderBy(asc(schema.memberships.displayName));
}

export async function getActiveRoster(orgId: string) {
  const all = await getRoster(orgId);
  return all.filter((m) => m.isActive);
}

export async function getPosts(orgId: string, type?: 'announcement' | 'news') {
  const rows = await db
    .select({ post: schema.posts, author: schema.memberships })
    .from(schema.posts)
    .leftJoin(schema.memberships, eq(schema.memberships.id, schema.posts.createdByMembershipId))
    .where(type ? and(eq(schema.posts.orgId, orgId), eq(schema.posts.type, type)) : eq(schema.posts.orgId, orgId))
    .orderBy(desc(schema.posts.pinned), desc(schema.posts.createdAt));
  return rows;
}

export async function getActivePosts(orgId: string, type?: 'announcement' | 'news') {
  const all = await getPosts(orgId, type);
  const now = new Date();
  return all.filter((p) => !p.post.expiresAt || p.post.expiresAt > now);
}

export async function getEvents(orgId: string) {
  const rows = await db
    .select({ event: schema.events, author: schema.memberships })
    .from(schema.events)
    .leftJoin(schema.memberships, eq(schema.memberships.id, schema.events.createdByMembershipId))
    .where(eq(schema.events.orgId, orgId))
    .orderBy(asc(schema.events.startAt));

  const rsvps = await db.select().from(schema.eventRsvps);
  return rows.map((r) => ({
    ...r,
    rsvps: rsvps.filter((rs) => rs.eventId === r.event.id),
  }));
}

export async function getTrustedServants(orgId: string) {
  const positions = await db.select().from(schema.trustedServantPositions).where(eq(schema.trustedServantPositions.orgId, orgId));
  const terms = await db
    .select({ term: schema.trustedServantTerms, membership: schema.memberships })
    .from(schema.trustedServantTerms)
    .innerJoin(schema.memberships, eq(schema.memberships.id, schema.trustedServantTerms.membershipId))
    .where(inArray(schema.trustedServantTerms.positionId, positions.map((p) => p.id).length ? positions.map((p) => p.id) : ['00000000-0000-0000-0000-000000000000']));

  return positions.map((position) => ({
    position,
    current: terms.find((t) => t.term.positionId === position.id && t.term.isCurrent) ?? null,
    history: terms
      .filter((t) => t.term.positionId === position.id && !t.term.isCurrent)
      .sort((a, b) => (a.term.termStart < b.term.termStart ? 1 : -1)),
  }));
}

export async function getConscienceArchive(orgId: string) {
  const meetings = await db
    .select()
    .from(schema.conscienceMeetings)
    .where(eq(schema.conscienceMeetings.orgId, orgId))
    .orderBy(desc(schema.conscienceMeetings.meetingDate));

  const meetingIds = meetings.map((m) => m.id);
  const allMotions = meetingIds.length
    ? await db
        .select()
        .from(schema.motions)
        .where(inArray(schema.motions.conscienceMeetingId, meetingIds))
        .orderBy(asc(schema.motions.sortOrder))
    : [];

  return meetings.map((meeting) => ({
    meeting,
    motions: allMotions.filter((m) => m.conscienceMeetingId === meeting.id),
  }));
}

export async function getMemberDashboard(orgId: string, membershipId: string) {
  const todayISO = toISODate(new Date());

  const myAssignments = await db
    .select({
      assignment: schema.assignments,
      occurrence: schema.occurrences,
      position: schema.commitmentPositions,
      commitment: schema.recurringCommitments,
    })
    .from(schema.assignments)
    .innerJoin(schema.occurrences, eq(schema.occurrences.id, schema.assignments.occurrenceId))
    .innerJoin(schema.recurringCommitments, eq(schema.recurringCommitments.id, schema.occurrences.recurringCommitmentId))
    .innerJoin(schema.commitmentPositions, eq(schema.commitmentPositions.id, schema.assignments.positionId))
    .where(
      and(
        eq(schema.recurringCommitments.orgId, orgId),
        eq(schema.assignments.membershipId, membershipId),
        gte(schema.occurrences.date, todayISO),
      ),
    )
    .orderBy(asc(schema.occurrences.date))
    .limit(8);

  const openSlots = await db
    .select({
      assignment: schema.assignments,
      occurrence: schema.occurrences,
      position: schema.commitmentPositions,
      commitment: schema.recurringCommitments,
    })
    .from(schema.assignments)
    .innerJoin(schema.occurrences, eq(schema.occurrences.id, schema.assignments.occurrenceId))
    .innerJoin(schema.recurringCommitments, eq(schema.recurringCommitments.id, schema.occurrences.recurringCommitmentId))
    .innerJoin(schema.commitmentPositions, eq(schema.commitmentPositions.id, schema.assignments.positionId))
    .where(
      and(
        eq(schema.recurringCommitments.orgId, orgId),
        eq(schema.assignments.status, 'open'),
        gte(schema.occurrences.date, todayISO),
      ),
    )
    .orderBy(asc(schema.occurrences.date))
    .limit(6);

  const announcements = await getActivePosts(orgId, 'announcement');
  const eventsRows = await getEvents(orgId);
  const upcomingEvents = eventsRows.filter((e) => e.event.startAt >= new Date()).slice(0, 4);

  const myPendingSwaps = await db
    .select()
    .from(schema.swapRequests)
    .where(and(eq(schema.swapRequests.requestingMembershipId, membershipId), eq(schema.swapRequests.status, 'pending')));

  return {
    myAssignments,
    openSlots,
    announcements: announcements.slice(0, 4),
    upcomingEvents,
    myPendingSwaps,
  };
}
