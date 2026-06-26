import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';

// ---------- Enums ----------
export const roleEnum = pgEnum('role', ['admin', 'coordinator', 'member']);
export const commitmentKindEnum = pgEnum('commitment_kind', ['meeting', 'hi']);
export const assignmentStatusEnum = pgEnum('assignment_status', ['open', 'filled']);
export const swapStatusEnum = pgEnum('swap_status', ['pending', 'covered', 'cancelled']);
export const rsvpStatusEnum = pgEnum('rsvp_status', ['yes', 'no', 'maybe']);
export const motionOutcomeEnum = pgEnum('motion_outcome', ['pending', 'passed', 'failed', 'tabled']);
export const postTypeEnum = pgEnum('post_type', ['announcement', 'news']);

// ---------- Orgs & people ----------
export const orgs = pgTable('orgs', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  inviteCode: text('invite_code').notNull().unique(),
  namedVoting: boolean('named_voting').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const memberships = pgTable('memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orgId: uuid('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  role: roleEnum('role').notNull().default('member'),
  displayName: text('display_name').notNull(),
  fullName: text('full_name'),
  phone: text('phone'),
  shareContactInfo: boolean('share_contact_info').notNull().default(false),
  sobrietyDate: date('sobriety_date'),
  shareAnniversary: boolean('share_anniversary').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

// ---------- Recurring commitments (weekly meetings AND H&I panel visits) ----------
export const recurringCommitments = pgTable('recurring_commitments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  kind: commitmentKindEnum('kind').notNull(),
  name: text('name').notNull(), // meeting name, or facility/panel name for H&I
  location: text('location'), // address or virtual link, or facility address
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday ... 6 = Saturday
  time: text('time').notNull(), // "19:30"
  format: text('format'), // open/closed/speaker/discussion, or visit notes for H&I
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const commitmentPositions = pgTable('commitment_positions', {
  id: uuid('id').defaultRandom().primaryKey(),
  recurringCommitmentId: uuid('recurring_commitment_id')
    .notNull()
    .references(() => recurringCommitments.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // Chair, Co-Chair, Greeter, Literature, Panel Lead...
  sortOrder: integer('sort_order').notNull().default(0),
});

export const occurrences = pgTable('occurrences', {
  id: uuid('id').defaultRandom().primaryKey(),
  recurringCommitmentId: uuid('recurring_commitment_id')
    .notNull()
    .references(() => recurringCommitments.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
});

export const assignments = pgTable('assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  occurrenceId: uuid('occurrence_id').notNull().references(() => occurrences.id, { onDelete: 'cascade' }),
  positionId: uuid('position_id').notNull().references(() => commitmentPositions.id, { onDelete: 'cascade' }),
  membershipId: uuid('membership_id').references(() => memberships.id, { onDelete: 'set null' }),
  status: assignmentStatusEnum('status').notNull().default('open'),
  claimedAt: timestamp('claimed_at'),
});

export const swapRequests = pgTable('swap_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  assignmentId: uuid('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }),
  requestingMembershipId: uuid('requesting_membership_id')
    .notNull()
    .references(() => memberships.id, { onDelete: 'cascade' }),
  coveringMembershipId: uuid('covering_membership_id').references(() => memberships.id, { onDelete: 'set null' }),
  status: swapStatusEnum('status').notNull().default('pending'),
  note: text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

// ---------- Trusted servant (officer) positions ----------
export const trustedServantPositions = pgTable('trusted_servant_positions', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // GSR, Alt GSR, Secretary, Treasurer, Literature Chair...
  description: text('description'),
  termMonths: integer('term_months'),
});

export const trustedServantTerms = pgTable('trusted_servant_terms', {
  id: uuid('id').defaultRandom().primaryKey(),
  positionId: uuid('position_id')
    .notNull()
    .references(() => trustedServantPositions.id, { onDelete: 'cascade' }),
  membershipId: uuid('membership_id')
    .notNull()
    .references(() => memberships.id, { onDelete: 'cascade' }),
  termStart: date('term_start').notNull(),
  termEnd: date('term_end'),
  isCurrent: boolean('is_current').notNull().default(true),
});

// ---------- Announcements & news ----------
export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  type: postTypeEnum('type').notNull().default('announcement'),
  title: text('title').notNull(),
  body: text('body').notNull(),
  pinned: boolean('pinned').notNull().default(false),
  createdByMembershipId: uuid('created_by_membership_id').references(() => memberships.id, { onDelete: 'set null' }),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ---------- Events ----------
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  startAt: timestamp('start_at').notNull(),
  endAt: timestamp('end_at'),
  createdByMembershipId: uuid('created_by_membership_id').references(() => memberships.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const eventRsvps = pgTable('event_rsvps', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  membershipId: uuid('membership_id').notNull().references(() => memberships.id, { onDelete: 'cascade' }),
  status: rsvpStatusEnum('status').notNull().default('yes'),
});

// ---------- Group conscience ----------
export const conscienceMeetings = pgTable('conscience_meetings', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  meetingDate: date('meeting_date').notNull(),
  notes: text('notes'),
  createdByMembershipId: uuid('created_by_membership_id').references(() => memberships.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const motions = pgTable('motions', {
  id: uuid('id').defaultRandom().primaryKey(),
  conscienceMeetingId: uuid('conscience_meeting_id')
    .notNull()
    .references(() => conscienceMeetings.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  outcome: motionOutcomeEnum('outcome').notNull().default('pending'),
  yesCount: integer('yes_count').notNull().default(0),
  noCount: integer('no_count').notNull().default(0),
  abstainCount: integer('abstain_count').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
});
