import { pgTable, uuid, text, decimal, timestamp, boolean, integer, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * TABLE: users
 * Purpose: Centralize identity.
 * Design: We include 'user_key' here to quickly validate mobile requests.
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(), // E.g., "alex"
  email: text('email').unique(), // Optional, for future web login
  userKey: text('user_key').unique().notNull(), // THE KEY for shortcuts
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * TABLE: categories
 * Purpose: Dynamic classification of expenses.
 */
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(), // E.g., "Food"
  slug: text('slug').notNull().unique(), // E.g., "food"
  icon: text('icon'), // E.g., "🍔"
});

/**
 * TABLE: time_units
 * Purpose: Define valid periods for business logic.
 */
export const timeUnits = pgTable('time_units', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(), // E.g., "Months"
  value: text('value').notNull().unique(), // E.g., "months"
});

/**
 * TABLE: expenses
 * Purpose: Immutable history.
 */
export const expenses = pgTable('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  concept: text('concept').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date').defaultNow().notNull(),
  expenseDate: date('expenseDate', { mode: 'string' }).notNull(),
  
  // RELATIONS (Foreign Keys)
  userId: uuid('user_id').notNull().references(() => users.id),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  
  // Traceability
  isRecurring: boolean('is_recurring').default(false),
});

/**
 * TABLE: subscriptions
 * Purpose: Configuration for the automation engine.
 */
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  
  // RELATIONS
  userId: uuid('user_id').notNull().references(() => users.id),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  
  // Recurrence Logic (Value + Unit)
  frequencyValue: integer('frequency_value').notNull().default(1),
  timeUnitId: uuid('time_unit_id').notNull().references(() => timeUnits.id),
  
  // Status
  nextRun: timestamp('next_run').notNull(),
  active: boolean('active').default(true),
});

// RELATION DEFINITIONS
export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
  subscriptions: many(subscriptions),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [subscriptions.categoryId],
    references: [categories.id],
  }),
  timeUnit: one(timeUnits, {
    fields: [subscriptions.timeUnitId],
    references: [timeUnits.id],
  }),
}));