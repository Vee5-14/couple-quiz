import { NextResponse } from 'next/server';
import { sql, createTables } from '@/app/lib/database';

// Only create tables if we have a database connection
if (sql) {
  createTables();
}

export async function POST(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL.' },
        { status: 500 }
      );
    }

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
    if (!sql) {
      // Return empty data during build time
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ quizzes: [] });
      }
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

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

export async function DELETE(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      );
    }
    
    await sql`
      DELETE FROM quizzes WHERE id = ${id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { id, title, questions } = body;
    
    await sql`
      UPDATE quizzes 
      SET title = ${title}, questions = ${JSON.stringify(questions)}
      WHERE id = ${id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}