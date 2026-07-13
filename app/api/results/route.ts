import { NextResponse } from 'next/server';
import { sql } from '@/app/lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quizId, participantName, answers, hasCorrectAnswer, questions } = body;
    
    // Check if participant already exists
    let participantResult = await sql`
      SELECT id FROM participants 
      WHERE quiz_id = ${quizId} AND name = ${participantName || 'Anonymous'} AND completed = false
    `;
    
    let participantId;
    
    if (participantResult.length === 0) {
      // Create new participant
      const newParticipant = await sql`
        INSERT INTO participants (quiz_id, name, completed)
        VALUES (${quizId}, ${participantName || 'Anonymous'}, true)
        RETURNING id
      `;
      participantId = newParticipant[0].id;
    } else {
      participantId = participantResult[0].id;
      // Update participant to completed
      await sql`
        UPDATE participants 
        SET completed = true, completed_at = NOW()
        WHERE id = ${participantId}
      `;
    }
    
    // Calculate score if there's a correct answer
    let score = 0;
    let total = questions.length;
    
    if (hasCorrectAnswer) {
      questions.forEach((q: any, i: number) => {
        if (q.correctIndexes.includes(answers[i])) {
          score++;
        }
      });
    } else {
      score = answers.filter((a: number) => a !== -1).length;
    }
    
    // Save results (only first attempt)
    await sql`
      INSERT INTO results (quiz_id, participant_id, answers, score, total, is_first_attempt)
      VALUES (${quizId}, ${participantId}, ${JSON.stringify(answers)}, ${score}, ${total}, true)
    `;
    
    return NextResponse.json({ success: true, score, total });
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
    const all = url.searchParams.get('all') === 'true';
    
    if (!quizId) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      );
    }
    
    if (all) {
      // Get all results for dashboard
      const results = await sql`
        SELECT 
          r.id,
          r.participant_id,
          r.score,
          r.total,
          r.created_at,
          p.name
        FROM results r
        JOIN participants p ON r.participant_id = p.id
        WHERE r.quiz_id = ${quizId}
        ORDER BY r.created_at DESC
      `;
      
      return NextResponse.json({ results });
    } else {
      // Get single result (latest)
      const result = await sql`
        SELECT * FROM results 
        WHERE quiz_id = ${quizId}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      if (result.length === 0) {
        return NextResponse.json({ results: null });
      }
      
      return NextResponse.json({ results: result[0] });
    }
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}