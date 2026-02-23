import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ── Enums ────────────────────────────────────────────────────────────────────

export const planEnum = pgEnum("plan", ["free", "pro"]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "active",
  "cancelled",
  "expired",
]);

// ── Tables ───────────────────────────────────────────────────────────────────

/**
 * One row per Whop community that has installed the app.
 * Access token is stored encrypted and refreshed as needed.
 */
export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    whopCompanyId: varchar("whop_company_id", { length: 64 }).notNull().unique(),
    accessToken: text("access_token").notNull(),
    plan: planEnum("plan").notNull().default("free"),
    stripeCustomerId: varchar("stripe_customer_id", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("companies_whop_company_id_idx").on(t.whopCompanyId)]
);

/**
 * Courses created by creators. Each belongs to one company.
 */
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Individual modules within a course.
 * unlock_day = 0 → available immediately on join
 * unlock_day = 7 → available 7 days after join
 */
export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content"),      // Tiptap JSON stored as text; rendered as HTML in member view
  videoUrl: text("video_url"),   // YouTube / Loom / Vimeo embed URL
  unlockDay: integer("unlock_day").notNull().default(0),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * One row per Whop membership.
 * joined_at is the single source of truth for all drip calculations.
 * Populated by the membership.went_valid webhook.
 */
export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    whopMembershipId: varchar("whop_membership_id", { length: 64 }).notNull().unique(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    whopUserId: varchar("whop_user_id", { length: 64 }).notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull(),
    status: membershipStatusEnum("status").notNull().default("active"),
    username: varchar("username", { length: 128 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("memberships_whop_id_idx").on(t.whopMembershipId)]
);

/**
 * Tracks which modules a member has completed.
 * Unique constraint prevents duplicate completions.
 */
export const progress = pgTable("progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  membershipId: uuid("membership_id")
    .notNull()
    .references(() => memberships.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Prevents the cron job from sending duplicate unlock notifications.
 * One row = "this member was already notified about this module".
 */
export const notificationsLog = pgTable("notifications_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  membershipId: uuid("membership_id")
    .notNull()
    .references(() => memberships.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Inferred Types ───────────────────────────────────────────────────────────

export type Company    = typeof companies.$inferSelect;
export type Course     = typeof courses.$inferSelect;
export type Module     = typeof modules.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Progress   = typeof progress.$inferSelect;

export type NewCompany    = typeof companies.$inferInsert;
export type NewCourse     = typeof courses.$inferInsert;
export type NewModule     = typeof modules.$inferInsert;
export type NewMembership = typeof memberships.$inferInsert;
