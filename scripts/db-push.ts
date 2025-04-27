import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  users, roles, projects, taskTypes, tasks, taskDependencies, comments,
  timeEntries, wikiPages, calendarEvents, customFields, activities, userRoles
} from '../shared/schema';

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
      -- Drop tables if they exist in reverse order of dependencies
      DROP TABLE IF EXISTS activities CASCADE;
      DROP TABLE IF EXISTS calendar_events CASCADE;
      DROP TABLE IF EXISTS wiki_pages CASCADE;
      DROP TABLE IF EXISTS time_entries CASCADE;
      DROP TABLE IF EXISTS comments CASCADE;
      DROP TABLE IF EXISTS task_dependencies CASCADE;
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP TABLE IF EXISTS user_roles CASCADE;
      DROP TABLE IF EXISTS task_types CASCADE;
      DROP TABLE IF EXISTS custom_fields CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
      DROP TABLE IF EXISTS roles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT,
        initials TEXT NOT NULL,
        avatar_color TEXT NOT NULL,
        email TEXT,
        preferences JSONB
      );
      
      -- Roles table
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        permissions JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      -- Projects table
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        parent_id INTEGER,
        status TEXT NOT NULL DEFAULT 'active',
        icon TEXT,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        custom_fields JSONB,
        FOREIGN KEY (parent_id) REFERENCES projects(id)
      );
      
      -- Custom Fields table
      CREATE TABLE IF NOT EXISTS custom_fields (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        field_type TEXT NOT NULL,
        description TEXT,
        required BOOLEAN DEFAULT FALSE,
        default_value TEXT,
        possible_values JSONB,
        applies_to TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      -- Task Types table
      CREATE TABLE IF NOT EXISTS task_types (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        color TEXT,
        project_id INTEGER REFERENCES projects(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      -- User Role Assignments table
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        role_id INTEGER NOT NULL REFERENCES roles(id),
        project_id INTEGER REFERENCES projects(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      -- Tasks table
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        priority TEXT NOT NULL DEFAULT 'medium',
        progress INTEGER DEFAULT 0,
        estimated_hours INTEGER,
        spent_hours INTEGER DEFAULT 0,
        due_date TIMESTAMP,
        start_date TIMESTAMP,
        task_type_id INTEGER REFERENCES task_types(id),
        project_id INTEGER REFERENCES projects(id),
        assignee_id INTEGER REFERENCES users(id),
        reporter_id INTEGER REFERENCES users(id),
        parent_task_id INTEGER,
        custom_fields JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (parent_task_id) REFERENCES tasks(id)
      );
      
      -- Task Dependencies table
      CREATE TABLE IF NOT EXISTS task_dependencies (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id),
        depends_on_task_id INTEGER NOT NULL REFERENCES tasks(id),
        dependency_type TEXT NOT NULL DEFAULT 'blocks',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      -- Comments table
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id),
        task_id INTEGER REFERENCES tasks(id),
        project_id INTEGER REFERENCES projects(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      -- Time Entries table
      CREATE TABLE IF NOT EXISTS time_entries (
        id SERIAL PRIMARY KEY,
        hours INTEGER NOT NULL,
        description TEXT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        task_id INTEGER REFERENCES tasks(id),
        project_id INTEGER NOT NULL REFERENCES projects(id),
        spent_on TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      -- Wiki Pages table
      CREATE TABLE IF NOT EXISTS wiki_pages (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        project_id INTEGER NOT NULL REFERENCES projects(id),
        parent_page_id INTEGER,
        author_id INTEGER NOT NULL REFERENCES users(id),
        version INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (parent_page_id) REFERENCES wiki_pages(id)
      );
      
      -- Calendar Events table
      CREATE TABLE IF NOT EXISTS calendar_events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        all_day BOOLEAN DEFAULT FALSE,
        project_id INTEGER REFERENCES projects(id),
        task_id INTEGER REFERENCES tasks(id),
        creator_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      -- Activities table
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        task_id INTEGER REFERENCES tasks(id),
        project_id INTEGER REFERENCES projects(id),
        wiki_page_id INTEGER REFERENCES wiki_pages(id),
        comment_id INTEGER REFERENCES comments(id),
        time_entry_id INTEGER REFERENCES time_entries(id),
        details JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Database schema created successfully');
    
    // Seed data
    console.log('Seeding initial data...');
    
    // Create users
    await db.execute(`
      INSERT INTO users (username, password, full_name, role, initials, avatar_color, email)
      VALUES 
        ('mwilson', 'password', 'Margaret Wilson', 'Admin', 'MW', '#4f46e5', 'mwilson@example.com'),
        ('jsmith', 'password', 'John Smith', 'Developer', 'JS', '#06b6d4', 'jsmith@example.com'),
        ('alee', 'password', 'Amy Lee', 'Designer', 'AL', '#ec4899', 'alee@example.com')
      ON CONFLICT (username) DO NOTHING;
    `);
    
    // Create roles
    await db.execute(`
      INSERT INTO roles (name, description, permissions)
      VALUES 
        ('Administrator', 'Full access to all features', '{"view_projects": true, "edit_projects": true, "delete_projects": true, "manage_users": true}'),
        ('Developer', 'Can edit tasks and wiki', '{"view_projects": true, "edit_projects": false, "view_tasks": true, "edit_tasks": true}'),
        ('Reporter', 'Can view and report issues', '{"view_projects": true, "view_tasks": true, "edit_tasks": false, "create_tasks": true}')
      ON CONFLICT DO NOTHING;
    `);
    
    // Create projects
    await db.execute(`
      INSERT INTO projects (name, description, status, is_public)
      VALUES 
        ('Green City Initiative', 'A project aimed at making our city more environmentally friendly.', 'active', true),
        ('Sustainable Energy Campaign', 'Promoting renewable energy sources and reducing carbon footprint.', 'active', true),
        ('Urban Planning Redesign', 'Redesigning urban spaces for better living', 'active', true)
      ON CONFLICT DO NOTHING;
    `);
    
    // Create a subproject
    await db.execute(`
      INSERT INTO projects (name, description, parent_id, status, is_public)
      VALUES 
        ('Public Transportation Improvement', 'Enhancing public transportation infrastructure', 1, 'active', true)
      ON CONFLICT DO NOTHING;
    `);
    
    // Create task types
    await db.execute(`
      INSERT INTO task_types (name, description, icon, color)
      VALUES 
        ('Bug', 'Software defect or error', 'bug', '#ef4444'),
        ('Feature', 'New feature implementation', 'star', '#3b82f6'),
        ('Task', 'General work item', 'clipboard', '#8b5cf6'),
        ('Documentation', 'Documentation work', 'file-text', '#14b8a6')
      ON CONFLICT DO NOTHING;
    `);
    
    // Assign roles to users
    await db.execute(`
      INSERT INTO user_roles (user_id, role_id, project_id)
      VALUES 
        (1, 1, NULL), -- Margaret Wilson as Administrator (all projects)
        (2, 2, 1),    -- John Smith as Developer on Green City Initiative
        (3, 2, 2)     -- Amy Lee as Developer on Sustainable Energy Campaign
      ON CONFLICT DO NOTHING;
    `);
    
    // Create tasks
    await db.execute(`
      INSERT INTO tasks (title, description, status, priority, progress, project_id, assignee_id, task_type_id)
      VALUES 
        ('Solar Panel Installation Guidelines', 'Create guidelines for residential solar panel installation', 'in-progress', 'high', 50, 1, 1, 3),
        ('Community Garden Planning', 'Design layouts for community gardens in public spaces', 'new', 'medium', 0, 1, 3, 3),
        ('Energy Audit Checklist', 'Develop a checklist for home energy audits', 'in-progress', 'medium', 25, 2, 2, 3),
        ('Recycling Program Proposal', 'Draft proposal for improved recycling program', 'completed', 'high', 100, 1, 1, 3),
        ('Bicycle Path Mapping', 'Create maps of potential bicycle paths throughout the city', 'new', 'low', 0, 1, 2, 3)
      ON CONFLICT DO NOTHING;
    `);
    
    // Create task dependencies
    await db.execute(`
      INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type)
      VALUES 
        (2, 4, 'blocks'), -- Community Garden Planning is blocked by Recycling Program Proposal
        (5, 2, 'relates_to') -- Bicycle Path Mapping relates to Community Garden Planning
      ON CONFLICT DO NOTHING;
    `);
    
    // Create comments
    await db.execute(`
      INSERT INTO comments (content, user_id, task_id)
      VALUES 
        ('I think we should focus on high-efficiency panels only.', 2, 1),
        ('Let''s include parks in the garden planning', 3, 2),
        ('We need to make sure this is accessible to homeowners.', 1, 3)
      ON CONFLICT DO NOTHING;
    `);
    
    // Create time entries
    await db.execute(`
      INSERT INTO time_entries (hours, description, user_id, task_id, project_id)
      VALUES 
        (4, 'Researched solar panel efficiency ratings', 1, 1, 1),
        (2, 'Created initial mockups for garden layouts', 3, 2, 1),
        (3, 'Drafted checklist sections 1-3', 2, 3, 2)
      ON CONFLICT DO NOTHING;
    `);
    
    // Create wiki pages
    await db.execute(`
      INSERT INTO wiki_pages (title, content, project_id, author_id)
      VALUES 
        ('Green City Initiative Overview', 'This project aims to transform our city into a more sustainable and environmentally friendly place to live.', 1, 1),
        ('Solar Panel Installation Guide', 'A comprehensive guide for installing solar panels in residential buildings.', 1, 2),
        ('Sustainable Energy Best Practices', 'A collection of best practices for implementing sustainable energy solutions.', 2, 1)
      ON CONFLICT DO NOTHING;
    `);
    
    // Create calendar events
    await db.execute(`
      INSERT INTO calendar_events (title, description, start_date, end_date, project_id, creator_id)
      VALUES 
        ('Project Kickoff Meeting', 'Initial meeting to launch the Green City Initiative', '2025-05-01 10:00:00', '2025-05-01 11:30:00', 1, 1),
        ('Community Feedback Session', 'Gathering feedback from community members', '2025-05-15 14:00:00', '2025-05-15 16:00:00', 1, 3),
        ('Energy Audit Training', 'Training session for conducting energy audits', '2025-05-10 09:00:00', '2025-05-10 12:00:00', 2, 2)
      ON CONFLICT DO NOTHING;
    `);
    
    // Create custom fields
    await db.execute(`
      INSERT INTO custom_fields (name, field_type, description, required, applies_to, possible_values)
      VALUES 
        ('Environmental Impact', 'select', 'Environmental impact level of the item', true, 'tasks', '["High", "Medium", "Low"]'),
        ('Budget Category', 'select', 'Budget category for the item', false, 'projects', '["Infrastructure", "Education", "Research", "Marketing"]'),
        ('Target Completion', 'date', 'Target date for completion', false, 'tasks', NULL)
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