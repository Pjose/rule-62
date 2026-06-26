import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL ?? 'postgres://placeholder:placeholder@localhost:5432/placeholder';

// `max: 1` keeps this friendly to serverless environments (one connection per
// invocation). Increase if you move to a long-running server.
const client = postgres(connectionString, { max: 1 });

export const db = drizzle(client, { schema });
export * as schema from './schema';
