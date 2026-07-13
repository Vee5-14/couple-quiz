'use client';
import { useState, useEffect } from 'react';
import ThemeToggle from '@/app/components/ThemeToggle';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editQuestions, setEditQuestions] = useState<any[]>([]);

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

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`/api/quizzes?id=${quizId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setQuizzes(quizzes.filter(q => q.id !== quizId));
        setShowDeleteConfirm(null);
        if (selectedQuiz === quizId) {
          setSelectedQuiz(null);
          setShowResults(false);
        }
      } else {
        alert('Failed to delete quiz');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setEditTitle(quiz.title);
    setEditQuestions(quiz.questions);
  };

  const handleSaveEdit = async () => {
    if (!editingQuiz) return;
    
    try {
      const response = await fetch(`/api/quizzes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingQuiz.id,
          title: editTitle,
          questions: editQuestions,
        }),
      });
      
      if (response.ok) {
        setQuizzes(quizzes.map(q => 
          q.id === editingQuiz.id 
            ? { ...q, title: editTitle, questions: editQuestions }
            : q
        ));
        setEditingQuiz(null);
      } else {
        alert('Failed to update quiz');
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      alert('Failed to update quiz');
    }
  };

  const handleDeleteQuestion = (index: number) => {
    setEditQuestions(editQuestions.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    setEditQuestions([
      ...editQuestions,
      {
        id: `q${Date.now()}`,
        text: '',
        options: ['', '', '', ''],
        correctIndexes: [],
        hasCorrectAnswer: true,
      }
    ]);
  };

  const getRelationLabel = (type: string) => {
    return type === 'partner' ? '💑 Partner' : '🤝 Friend';
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage === 100) return 'text-green-600 dark:text-green-400';
    if (percentage >= 70) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center transition-colors duration-300">
        <ThemeToggle />
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  if (editingQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
        <ThemeToggle />
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">✏️ Edit Quiz</h1>
            <button
              onClick={() => setEditingQuiz(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              ❌ Cancel
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-300">
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Quiz Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold">
                  Questions ({editQuestions.length})
                </label>
                <button
                  onClick={handleAddQuestion}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  + Add Question
                </button>
              </div>
              
              {editQuestions.map((q, index) => (
                <div key={index} className="border dark:border-gray-700 rounded-lg p-4 mb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={`Question ${index + 1}`}
                        value={q.text}
                        onChange={(e) => {
                          const newQ = [...editQuestions];
                          newQ[index].text = e.target.value;
                          setEditQuestions(newQ);
                        }}
                        className="w-full p-2 border rounded-lg mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      {q.options.map((opt: string, optIndex: number) => (
                        <input
                          key={optIndex}
                          type="text"
                          placeholder={`Option ${optIndex + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newQ = [...editQuestions];
                            newQ[index].options[optIndex] = e.target.value;
                            setEditQuestions(newQ);
                          }}
                          className="w-full p-2 border rounded-lg mb-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleSaveEdit}
              className="w-full bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition font-semibold"
            >
              💾 Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <ThemeToggle />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            📊 Quiz Dashboard
          </h1>
          <div className="flex gap-3">
            <a
              href="/create"
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
            >
              ✨ New Quiz
            </a>
            <a
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              🏠 Home
            </a>
          </div>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center transition-colors duration-300">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Quizzes Yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first quiz and share it with others!</p>
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
              <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Your Quizzes</h2>
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="relative">
                  <button
                    onClick={() => handleQuizClick(quiz.id)}
                    className={`w-full text-left p-4 rounded-xl transition ${
                      selectedQuiz === quiz.id
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 hover:shadow-md border border-gray-200 dark:border-gray-700 dark:text-white'
                    }`}
                  >
                    <div className="font-semibold">{quiz.title || 'Untitled'}</div>
                    <div className="text-sm opacity-80">{getRelationLabel(quiz.guesser_type)}</div>
                    <div className="text-xs opacity-60 mt-1">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </div>
                  </button>
                  
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditQuiz(quiz);
                      }}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(quiz.id);
                      }}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Results Section */}
            <div className="md:col-span-2">
              {showResults ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-300">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    📊 Results
                  </h2>
                  
                  {results.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No one has taken this quiz yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {results.map((result, index) => (
                        <div
                          key={index}
                          className="border dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-gray-800 dark:text-white">
                                {result.name || `Participant ${result.participant_id}`}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(result.completed_at).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(result.score, result.total)}`}>
                                {result.score}/{result.total}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center transition-colors duration-300">
                  <div className="text-4xl mb-4">👆</div>
                  <p className="text-gray-500 dark:text-gray-400">Select a quiz to view results</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Delete Quiz?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This action cannot be undone. All results will be permanently deleted.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteQuiz(showDeleteConfirm)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}