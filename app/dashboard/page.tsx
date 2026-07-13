'use client';
import { useState, useEffect } from 'react';

interface Quiz {
  id: string;
  title: string;
  creator: string;
  guesser_type: string;
  questions: any[];
  has_correct_answer: boolean;
  created_at: string;
}

interface ParticipantResult {
  participant_id: number;
  name: string;
  score: number;
  total: number;
  completed_at: string;
}

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [results, setResults] = useState<ParticipantResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes');
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes || []);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (quizId: string) => {
    try {
      const response = await fetch(`/api/results?quizId=${quizId}&all=true`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleQuizClick = (quizId: string) => {
    setSelectedQuiz(quizId);
    fetchResults(quizId);
  };

  const getRelationLabel = (type: string) => {
    return type === 'partner' ? '💑 Partner' : '🤝 Friend';
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage === 100) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600">
            📊 Quiz Dashboard
          </h1>
          <a
            href="/create"
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
          >
            ✨ New Quiz
          </a>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Quizzes Yet</h2>
            <p className="text-gray-500 mb-4">Create your first quiz and share it with others!</p>
            <a
              href="/create"
              className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition inline-block"
            >
              Create Your First Quiz
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Quiz List */}
            <div className="md:col-span-1 space-y-4">
              <h2 className="font-semibold text-gray-700 mb-3">Your Quizzes</h2>
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => handleQuizClick(quiz.id)}
                  className={`w-full text-left p-4 rounded-xl transition ${
                    selectedQuiz === quiz.id
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-white hover:shadow-md border border-gray-200'
                  }`}
                >
                  <div className="font-semibold">{quiz.title || 'Untitled'}</div>
                  <div className="text-sm opacity-80">{getRelationLabel(quiz.guesser_type)}</div>
                  <div className="text-xs opacity-60 mt-1">
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>

            {/* Results Section */}
            <div className="md:col-span-2">
              {showResults ? (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    📊 Results
                  </h2>
                  
                  {results.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No one has taken this quiz yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {results.map((result, index) => (
                        <div
                          key={index}
                          className="border rounded-xl p-4 hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-gray-800">
                                {result.name || `Participant ${result.participant_id}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(result.completed_at).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(result.score, result.total)}`}>
                                {result.score}/{result.total}
                              </div>
                              <div className="text-sm text-gray-500">
                                {Math.round((result.score / result.total) * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                  <div className="text-4xl mb-4">👆</div>
                  <p className="text-gray-500">Select a quiz to view results</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}