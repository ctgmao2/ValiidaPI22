import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { users, projects, tasks, activities } from '../shared/schema';

// Create the database connection
const connectionString = process.env.DATABASE_URL as string;

async function main() {
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Connecting to the database...');
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log('Creating database schema...');

  try {
    // Create tables
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT,
        initials TEXT NOT NULL,
        avatar_color TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        priority TEXT NOT NULL DEFAULT 'medium',
        due_date TIMESTAMP,
        project_id INTEGER REFERENCES projects(id),
        assignee_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        task_id INTEGER REFERENCES tasks(id),
        project_id INTEGER REFERENCES projects(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Database schema created successfully');
    
    // Seed data
    console.log('Seeding initial data...');
    
    // Create users
    await db.execute(`
      INSERT INTO users (username, password, full_name, role, initials, avatar_color)
      VALUES 
        ('mwilson', 'password', 'Margaret Wilson', 'Admin', 'MW', '#4f46e5'),
        ('jsmith', 'password', 'John Smith', 'Developer', 'JS', '#06b6d4'),
        ('alee', 'password', 'Amy Lee', 'Designer', 'AL', '#ec4899')
      ON CONFLICT (username) DO NOTHING;
    `);
    
    // Create projects
    await db.execute(`
      INSERT INTO projects (name, description)
      VALUES 
        ('Green City Initiative', 'A project aimed at making our city more environmentally friendly.'),
        ('Sustainable Energy Campaign', 'Promoting renewable energy sources and reducing carbon footprint.')
      ON CONFLICT DO NOTHING;
    `);
    
    // Create tasks
    await db.execute(`
      INSERT INTO tasks (title, description, status, priority, project_id, assignee_id)
      VALUES 
        ('Solar Panel Installation Guidelines', 'Create guidelines for residential solar panel installation', 'in-progress', 'high', 1, 1),
        ('Community Garden Planning', 'Design layouts for community gardens in public spaces', 'new', 'medium', 1, 3),
        ('Energy Audit Checklist', 'Develop a checklist for home energy audits', 'in-progress', 'medium', 2, 2),
        ('Recycling Program Proposal', 'Draft proposal for improved recycling program', 'completed', 'high', 1, 1),
        ('Bicycle Path Mapping', 'Create maps of potential bicycle paths throughout the city', 'new', 'low', 1, 2)
      ON CONFLICT DO NOTHING;
    `);
    
    // Create activities
    await db.execute(`
      INSERT INTO activities (type, description, user_id, task_id)
      VALUES 
        ('task-completed', 'Completed the Recycling Program Proposal', 1, 4),
        ('task-updated', 'Updated the Solar Panel Installation Guidelines task', 1, 1),
        ('comment-added', 'Added comment: "Let''s include parks in the garden planning"', 3, 2),
        ('task-created', 'Created new task: Energy Audit Checklist', 2, 3)
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('Initial data seeded successfully');
  } catch (error) {
    console.error('Error creating schema or seeding data:', error);
    process.exit(1);
  } finally {
    await sql.end();
    console.log('Database connection closed');
  }
}

main();