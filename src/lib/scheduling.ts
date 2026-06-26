import 'server-only';
import { eq, and, gte, inArray } from 'drizzle-orm';
import { db, schema } from '@/db';
import { nextDatesForDayOfWeek, toISODate } from './dates';

export async function generateOccurrencesForOrg(orgId: string, kind: 'meeting' | 'hi', weeksAhead = 8) {
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

  for (const commitment of commitments) {
    const positions = await db
      .select()
      .from(schema.commitmentPositions)
      .where(eq(schema.commitmentPositions.recurringCommitmentId, commitment.id));
    if (positions.length === 0) continue;

    const existing = await db
      .select({ date: schema.occurrences.date })
      .from(schema.occurrences)
      .where(
        and(
          eq(schema.occurrences.recurringCommitmentId, commitment.id),
          gte(schema.occurrences.date, toISODate(new Date())),
        ),
      );
    const existingDates = new Set(existing.map((e) => e.date));

    const candidateDates = nextDatesForDayOfWeek(commitment.dayOfWeek, weeksAhead);
    const newDates = candidateDates.filter((d) => !existingDates.has(d));

    for (const date of newDates) {
      const [occurrence] = await db
        .insert(schema.occurrences)
        .values({ recurringCommitmentId: commitment.id, date })
        .returning();

      await db.insert(schema.assignments).values(
        positions.map((p) => ({
          occurrenceId: occurrence.id,
          positionId: p.id,
          status: 'open' as const,
        })),
      );
    }
  }
}

export async function generateOccurrencesForAllOrgs(weeksAhead = 8) {
  const orgs = await db.select().from(schema.orgs);
  for (const org of orgs) {
    await generateOccurrencesForOrg(org.id, 'meeting', weeksAhead);
    await generateOccurrencesForOrg(org.id, 'hi', weeksAhead);
  }
  return orgs.length;
}
