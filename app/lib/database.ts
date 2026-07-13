import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || process.env.STORAGE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment variables');
  throw new Error('DATABASE_URL is required');
}

const sql = neon(databaseUrl);

export async function createTables() {
  try {
    console.log('📦 Creating tables...');
    
    // Quizzes table - updated with new fields
    await sql`
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        creator TEXT,
        title TEXT DEFAULT 'Untitled Quiz',
        guesser_type TEXT DEFAULT 'partner',
        questions JSONB,
        has_correct_answer BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Participants table - track who took the quiz
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

    // Results table - store answers
    await sql`
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        quiz_id TEXT REFERENCES quizzes(id) ON DELETE CASCADE,
        participant_id INT REFERENCES participants(id),
        answers JSONB,
        score INT,
        total INT,
        is_first_attempt BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('✅ Tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

export { sql };