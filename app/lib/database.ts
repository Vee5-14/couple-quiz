import { neon } from '@neondatabase/serverless';

// Use the DATABASE_URL from environment variables
const databaseUrl = process.env.DATABASE_URL || process.env.STORAGE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment variables');
  throw new Error('DATABASE_URL is required');
}

const sql = neon(databaseUrl);

export async function createTables() {
  try {
    console.log('📦 Creating tables...');
    
    // Create quizzes table
    await sql`
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        creator TEXT,
        guesser TEXT,
        guesser_type TEXT,
        questions JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create results table
    await sql`
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        quiz_id TEXT REFERENCES quizzes(id) ON DELETE CASCADE,
        guesser_name TEXT,
        answers JSONB,
        score INT,
        total INT,
        completed_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('✅ Tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

export { sql };