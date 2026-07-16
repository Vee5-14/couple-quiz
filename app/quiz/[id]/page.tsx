'use client';
import { useState, useEffect, use } from 'react';

interface QuizData {
  id: string;
  creator: string;
  title: string;
  guesser_type: string;
  has_correct_answer: boolean;
  questions: {
    id: string;
    text: string;
    options: string[];
    correctIndexes: number[];
    hasCorrectAnswer: boolean;
  }[];
  created_at: string;
}

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [started, setStarted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/quizzes?id=${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Quiz not found');
          } else {
            setError('Failed to load quiz');
          }
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setQuiz(data.quiz);
        setAnswers(new Array(data.quiz.questions.length).fill(-1));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz');
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [id]);

  const handleAnswer = (optionIndex: number) => {
    if (hasSubmitted) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    
    const unanswered = answers.some(a => a === -1);
    if (unanswered) {
      alert('Please answer all questions before submitting.');
      return;
    }
    
    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          participantName: participantName || 'Anonymous',
          answers: answers,
          hasCorrectAnswer: quiz.has_correct_answer,
          questions: quiz.questions,
        }),
      });
      
      if (response.ok) {
        setHasSubmitted(true);
        setShowResults(true);
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  const getRelationLabel = () => {
    return quiz?.guesser_type === 'partner' ? 'Partner' : 'Friend';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-purple-500/20">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-300">Loading quiz...</h2>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-purple-500/20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-300 mb-2">Quiz Not Found</h2>
          <p className="text-gray-400">{error || 'This quiz might have been deleted or the link is incorrect.'}</p>
          <button 
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            onClick={() => window.location.href = '/'}
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-purple-500/20">
          <h1 className="text-3xl font-bold text-purple-400 mb-4">
            💜 {quiz.title || 'Quiz'}
          </h1>
          <p className="text-gray-300 mb-6">
            Created by {quiz.creator || 'Someone'} for their {getRelationLabel().toLowerCase()}
          </p>
          
          <div className="mb-6">
            <input
              type="text"
              placeholder="Your name (optional)"
              className="w-full p-3 border border-gray-600 rounded-lg text-white bg-gray-700"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => setStarted(true)}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition text-lg font-semibold"
          >
            🚀 Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const total = quiz.questions.length;
    let correct = 0;
    
    if (quiz.has_correct_answer) {
      quiz.questions.forEach((q, i) => {
        if (q.correctIndexes.includes(answers[i])) {
          correct++;
        }
      });
    } else {
      correct = answers.filter(a => a !== -1).length;
    }
    
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-500/20">
          <h1 className="text-3xl font-bold text-center mb-4 text-purple-400">
            🎉 Results!
          </h1>
          
          {quiz.has_correct_answer && (
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-purple-400">
                {correct}/{total}
              </div>
              <div className="text-xl text-gray-300 mt-2">
                {correct === total ? `Perfect! You know ${quiz.creator || 'them'} so well! 💜` :
                 correct >= total * 0.7 ? 'Pretty good! You pay attention! 😊' :
                 'You need to spend more time together! 😄'}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {quiz.questions.map((q, i) => {
              const selectedOption = q.options[answers[i]];
              const isSelectedImage = selectedOption?.startsWith('data:image');
              const isCorrect = q.correctIndexes.includes(answers[i]);
              
              return (
                <div key={i} className={`p-4 rounded-lg ${quiz.has_correct_answer ? (isCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700') : 'bg-blue-900/30 border border-blue-700'}`}>
                  <div className="font-semibold text-gray-200 mb-2">Q{i+1}: {q.text}</div>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-xs text-gray-400">Your choice:</div>
                      {isSelectedImage ? (
                        <img 
                          src={selectedOption} 
                          alt="Your choice" 
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-600"
                        />
                      ) : (
                        <div className="font-medium text-gray-300">{selectedOption || 'Not answered'}</div>
                      )}
                    </div>
                    
                    {quiz.has_correct_answer && (
                      <div className="text-2xl">
                        {isCorrect ? '✅' : '❌'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-4 mt-6">
            <button 
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700"
              onClick={() => window.location.href = '/'}
            >
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = quiz.questions[currentQuestion];
  const validOptions = q.options.filter(opt => opt && opt.trim() !== '');
  const isAnswered = answers[currentQuestion] !== -1;
  
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-500/20">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-400">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </div>
          <div className="text-sm text-gray-400">
            {answers.filter(a => a !== -1).length} / {quiz.questions.length} answered
          </div>
        </div>
        
        <div className="w-full bg-gray-700 h-2 rounded-full mb-6">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion) / quiz.questions.length) * 100}%` }}
          />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-200">
          {q.text}
        </h2>
        <p className="text-center text-sm text-gray-400 mb-6">
          {quiz.has_correct_answer ? 'Select the correct answer(s)' : 'Select your preference'}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validOptions.map((option, index) => {
            const originalIndex = q.options.indexOf(option);
            const isImage = option && option.startsWith('data:image');
            const selected = answers[currentQuestion] === originalIndex;
            
            return (
              <button
                key={index}
                className={`border-2 rounded-xl p-4 transition hover:shadow-lg ${
                  selected 
                    ? 'border-purple-500 bg-purple-900/30' 
                    : 'border-gray-600 hover:border-purple-400 hover:bg-gray-700/50'
                }`}
                onClick={() => handleAnswer(originalIndex)}
              >
                {isImage ? (
                  <div>
                    <img 
                      src={option} 
                      alt={`Option ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                    <div className="text-sm text-gray-400">Option {index + 1}</div>
                  </div>
                ) : (
                  <div className="text-lg font-medium text-gray-200 py-4">{option}</div>
                )}
                {selected && (
                  <div className="text-sm text-purple-400 font-semibold mt-1">✅ Selected</div>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="flex gap-4 mt-6">
          <button
            onClick={goToPrevious}
            className={`flex-1 px-4 py-2 rounded-lg ${
              currentQuestion > 0 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            disabled={currentQuestion === 0}
          >
            ⬅ Previous
          </button>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={submitQuiz}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              disabled={!isAnswered}
            >
              📤 Submit Quiz
            </button>
          ) : (
            <button
              onClick={goToNext}
              className={`flex-1 px-4 py-2 rounded-lg ${
                isAnswered 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isAnswered}
            >
              Next ➡
            </button>
          )}
        </div>
        
        {!isAnswered && (
          <p className="text-sm text-yellow-500 text-center mt-2">
            ⚠️ Please select an option to continue
          </p>
        )}
      </div>
    </div>
  );
}