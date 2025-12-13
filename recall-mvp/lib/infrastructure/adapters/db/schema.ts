
import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, boolean } from 'drizzle-orm/pg-core';

import { AnyPgColumn } from 'drizzle-orm/pg-core';

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 50 }).notNull(), // 'senior' | 'family'
  seniorId: uuid('senior_id').references((): AnyPgColumn => users.id),
  phoneNumber: varchar('phone_number', { length: 50 }),
  preferences: jsonb('preferences').$type<{
    conversationSchedule?: string[];
    voiceTone?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Sessions Table
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  transcriptRaw: text('transcript_raw'), // JSON string of Message[]
  audioUrl: varchar('audio_url', { length: 512 }),
  duration: integer('duration'), // seconds
  status: varchar('status', { length: 50 }).notNull(), // 'active' | 'completed' | 'failed'
  metadata: jsonb('metadata').$type<{
    strategy_usage?: { [key: string]: number };
    avg_response_length?: number;
    sentiment_distribution?: { [key: string]: number };
  }>(),
  startedAt: timestamp('started_at').notNull(),
  endedAt: timestamp('ended_at')
});

// Chapters Table
export const chapters = pgTable('chapters', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 512 }).notNull(),
  content: text('content').notNull(), // Markdown
  excerpt: text('excerpt').notNull(),
  audioHighlightUrl: varchar('audio_highlight_url', { length: 512 }),
  audioDuration: integer('audio_duration'), // seconds
  pdfUrl: varchar('pdf_url', { length: 512 }),
  entities: jsonb('entities').$type<Array<{
    type: 'person' | 'place' | 'topic';
    name: string;
    mentions: number;
  }>>(),
  metadata: jsonb('metadata').$type<{
    sessionNumber: number;
    wordCount: number;
    emotionalTone: string;
    lifePeriod?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Background Jobs Table (optional, if not using BullMQ)
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 100 }).notNull(), // 'chapter_generation', 'entity_extraction'
  status: varchar('status', { length: 50 }).notNull(), // 'pending' | 'processing' | 'completed' | 'failed'
  payload: jsonb('payload'),
  result: jsonb('result'),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at')
});
