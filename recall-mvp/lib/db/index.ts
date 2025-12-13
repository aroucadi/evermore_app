
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// If no DATABASE_URL is provided, we can either throw or warn.
// For the MVP in this environment without keys, we might want to be careful.
// However, the prompt says "Complete implementation (only external integration could be mocked)".
// DB is usually considered internal infrastructure, but without a running Postgres, we can't really "implement" it fully running.
// I will assume the code should be written to connect to a real DB.

const connectionString = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/recall_mvp';

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
