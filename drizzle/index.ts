import { createClient, ResultSet } from '@libsql/client';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { SQLiteTransaction } from 'drizzle-orm/sqlite-core';

import { sessions, todos, users } from './schema';

// Setup sqlite database connection
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    'DATABASE_URL is required and must use libsql://, https://, http://, ws://, or wss://'
  );
}
if (typeof EdgeRuntime !== 'undefined' && url.startsWith('file:')) {
  throw new Error('file: URLs are not supported in Edge/Middleware.');
}

const client = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
export const db = drizzle(client, { schema: { users, sessions, todos } });

// Setup lucia adapter
export const luciaAdapter = new DrizzleSQLiteAdapter(db, sessions, users);

// Export Transaction type to be used in repositories
type Schema = {
  users: typeof users;
  sessions: typeof sessions;
  todos: typeof todos;
};
export type Transaction = SQLiteTransaction<
  'async',
  ResultSet,
  Schema,
  ExtractTablesWithRelations<Schema>
>;
