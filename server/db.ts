import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, projects, tasks, activities } from '../shared/schema';

// Create the database connection
const connectionString = process.env.DATABASE_URL as string;
const sql = postgres(connectionString, { max: 10 });

// Create the database instance
export const db = drizzle(sql, { schema: { users, projects, tasks, activities } });

// Helper function to check database connection
export async function checkDatabaseConnection() {
  try {
    const result = await sql`SELECT 1 as connected`;
    return !!result[0]?.connected;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}