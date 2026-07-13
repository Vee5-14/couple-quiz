import { NextResponse } from 'next/server';
import { sql, createTables } from '@/app/lib/database';

createTables();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, creator, title, guesserType, hasCorrectAnswer, questions } = body;
    
    await sql`
      INSERT INTO quizzes (id, creator, title, guesser_type, has_correct_answer, questions)
      VALUES (${id}, ${creator}, ${title}, ${guesserType}, ${hasCorrectAnswer}, ${JSON.stringify(questions)})
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
    
    if (id) {
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
    } else {
      // Get all quizzes for dashboard
      const results = await sql`
        SELECT * FROM quizzes ORDER BY created_at DESC
      `;
      
      return NextResponse.json({ quizzes: results });
    }
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}