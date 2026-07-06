import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const registrations = pgTable('registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  section: text('section').notNull(),
  roll_no: text('roll_no').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull().unique(),
  payment_screenshot_url: text('payment_screenshot_url'),
  payment_verified: boolean('payment_verified').default(false),
  qr_data: text('qr_data').unique(),
  email_sent: boolean('email_sent').default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const attendance = pgTable('attendance', {
  id: uuid('id').defaultRandom().primaryKey(),
  registration_id: uuid('registration_id')
    .notNull()
    .references(() => registrations.id, { onDelete: 'cascade' }),
  verified_by: text('verified_by'),
  verified_at: timestamp('verified_at', { withTimezone: true }).defaultNow(),
})
