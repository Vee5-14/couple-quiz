import { NextResponse } from 'next/server';
import { sql, createTables } from '@/app/lib/database';

// Initialize tables on first run
createTables();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, creator, guesser, guesserType, questions } = body;
    
    // Save quiz to database
    await sql`
      INSERT INTO quizzes (id, creator, guesser, guesser_type, questions)
      VALUES (${id}, ${creator}, ${guesser}, ${guesserType}, ${JSON.stringify(questions)})
    `;
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving quiz:', error);
    return NextResponse.json(
      { error: 'Failed to save quiz' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      );
    }
    
    // Get quiz from database
    const result = await sql`
      SELECT * FROM quizzes WHERE id = ${id}
    `;
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ quiz: result[0] });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}