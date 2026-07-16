import { neon } from '@neondatabase/serverless';

// Log status (without exposing the full URL)
console.log('🔍 Checking DATABASE_URL...');
console.log('📌 DATABASE_URL exists:', !!process.env.DATABASE_URL);

const databaseUrl = process.env.DATABASE_URL || process.env.STORAGE_URL;

if (!databaseUrl) {
  console.warn('⚠️ DATABASE_URL not found. API routes will fail if accessed.');
}

let sql: any = null;

if (databaseUrl) {
  try {
    sql = neon(databaseUrl);
    console.log('✅ Database client initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database client:', error);
  }
}

export async function createTables() {
  if (!sql) {
    console.warn('⚠️ Skipping table creation - no database connection');
    return;
  }
  
  try {
    console.log('📦 Creating tables...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        creator TEXT,
        title TEXT DEFAULT 'Untitled Quiz',
        guesser_type TEXT DEFAULT 'partner',
        has_correct_answer BOOLEAN DEFAULT true,
        questions JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        quiz_id TEXT REFERENCES quizzes(id) ON DELETE CASCADE,
        name TEXT,
        email TEXT,
        started_at TIMESTAMP DEFAULT NOW(),
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        quiz_id TEXT REFERENCES quizzes(id) ON DELETE CASCADE,
        participant_id INT REFERENCES participants(id),
        answers JSONB,
        score INT DEFAULT 0,
        total INT DEFAULT 0,
        is_first_attempt BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('✅ Tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

// Only create tables if we have a connection
if (sql) {
  createTables();
}

export { sql };