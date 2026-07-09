import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quizId, guesserName, answers, score, total } = body;
    
    // Save results to database
    await sql`
      INSERT INTO results (quiz_id, guesser_name, answers, score, total)
      VALUES (${quizId}, ${guesserName}, ${JSON.stringify(answers)}, ${score}, ${total})
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving results:', error);
    return NextResponse.json(
      { error: 'Failed to save results' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const quizId = url.searchParams.get('quizId');
    
    if (!quizId) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      );
    }
    
    // Get results from database
    const result = await sql`
      SELECT * FROM results 
      WHERE quiz_id = ${quizId}
      ORDER BY completed_at DESC
      LIMIT 1
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ results: null });
    }
    
    return NextResponse.json({ results: result[0] });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}