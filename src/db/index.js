import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

let db

export function getDb() {
  if (db) return db

  if (!connectionString) {
    throw new Error('DATABASE_URL not configured in .env')
  }

  const client = postgres(connectionString, { prepare: false })
  db = drizzle(client, { schema })
  return db
}
