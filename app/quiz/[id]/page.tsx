'use client';
import { useState, useEffect, use } from 'react';

interface QuizData {
  id: string;
  creator: string;
  guesser: string;
  guesserType: string;
  questions: {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
  }[];
  createdAt: string;
}

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [resultsSaved, setResultsSaved] = useState(false);
  
  useEffect(() => {
    const quizData = localStorage.getItem(`quiz_${id}`);
    if (quizData) {
      const parsed = JSON.parse(quizData);
      setQuiz(parsed);
      setAnswers(new Array(parsed.questions.length).fill(null));
    } else {
      const allKeys = Object.keys(localStorage);
      const quizKey = allKeys.find(key => key.startsWith('quiz_') && key.includes(id));
      if (quizKey) {
        const parsed = JSON.parse(localStorage.getItem(quizKey) || '');
        setQuiz(parsed);
        setAnswers(new Array(parsed.questions.length).fill(null));
      }
    }
  }, [id]);

  const handleAnswer = (optionIndex: number) => {
    if (!quiz) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
    
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      saveResults(newAnswers);
      setShowResults(true);
    }
  };

  const saveResults = (finalAnswers: number[]) => {
    if (!quiz) return;
    
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (finalAnswers[i] === q.correctIndex) correct++;
    });
    
    const results = {
      quizId: quiz.id,
      guesserName: quiz.guesser || 'Partner',
      guesserType: quiz.guesserType || 'partner',
      answers: finalAnswers,
      score: correct,
      total: quiz.questions.length,
      completedAt: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(`results_${quiz.id}`, JSON.stringify(results));
      localStorage.setItem(`quiz_results_${quiz.id}`, JSON.stringify(results));
      localStorage.setItem(`quiz_completed_${quiz.id}`, new Date().toISOString());
      console.log('Results saved successfully!', results);
      setResultsSaved(true);
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const getRelationLabel = () => {
    return quiz?.guesserType === 'partner' ? 'Partner' : 'Friend';
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Not Found</h2>
          <p className="text-gray-600">This quiz might have been deleted or the link is incorrect.</p>
          <button 
            className="mt-4 bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
            onClick={() => window.location.href = '/'}
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  if (showResults) {
    let correct = 0;
    const results = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) correct++;
      return {
        ...q,
        selected: answers[i],
        correct: isCorrect
      };
    });
    
    const relationLabel = getRelationLabel();
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-4 text-purple-600">
            🎉 Results!
          </h1>
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-purple-500">
              {correct}/{quiz.questions.length}
            </div>
            <div className="text-xl text-gray-700 mt-2">
              {correct === quiz.questions.length ? `Perfect! You know your ${relationLabel.toLowerCase()} so well! 💜` :
               correct >= quiz.questions.length * 0.7 ? `Pretty good! You pay attention! 😊` :
               `You need to spend more time with your ${relationLabel.toLowerCase()}! 😄`}
            </div>
          </div>
          
          <div className="space-y-4">
            {results.map((q, i) => {
              const selectedOption = q.options[q.selected];
              const correctOption = q.options[q.correctIndex];
              const isSelectedImage = selectedOption && selectedOption.startsWith('data:image');
              const isCorrectImage = correctOption && correctOption.startsWith('data:image');
              
              return (
                <div key={i} className={`p-4 rounded-lg ${q.correct ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className="font-semibold text-gray-800 mb-2">Q{i+1}: {q.text}</div>
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-[100px]">
                      <div className="text-xs text-gray-500 mb-1">Your choice:</div>
                      {isSelectedImage ? (
                        <img 
                          src={selectedOption} 
                          alt="Your choice" 
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                      ) : (
                        <div className="font-medium text-gray-700">{selectedOption || 'Option ' + (q.selected + 1)}</div>
                      )}
                    </div>
                    
                    <div className="text-gray-400 text-xl font-bold">VS</div>
                    
                    <div className="flex-1 min-w-[100px]">
                      <div className="text-xs text-gray-500 mb-1">Correct answer:</div>
                      {isCorrectImage ? (
                        <img 
                          src={correctOption} 
                          alt="Correct answer" 
                          className="w-20 h-20 object-cover rounded-lg border-2 border-green-500"
                        />
                      ) : (
                        <div className="font-medium text-green-700">{correctOption || 'Option ' + (q.correctIndex + 1)}</div>
                      )}
                    </div>
                    
                    <div className="text-2xl">
                      {q.correct ? '✅' : '❌'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-4 mt-6">
            <button 
              className="flex-1 bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600"
              onClick={() => window.location.href = '/'}
            >
              🏠 Back to Home
            </button>
            <button 
              className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600"
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setAnswers(new Array(quiz.questions.length).fill(null));
              }}
            >
              🔄 Retry Quiz
            </button>
          </div>
          
          {resultsSaved && (
            <p className="text-sm text-green-600 text-center mt-4">
              ✅ Results saved! {quiz.creator || 'Quiz creator'} can now view them.
            </p>
          )}
        </div>
      </div>
    );
  }

  const q = quiz.questions[currentQuestion];
  const validOptions = q.options.filter(opt => opt && opt.trim() !== '');
  const relationLabel = getRelationLabel();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-sm text-gray-600 mb-4">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion) / quiz.questions.length) * 100}%` }}
          />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
          {q.text}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Choose the answer that best matches {quiz.creator || 'the creator'}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validOptions.map((option, index) => {
            const originalIndex = q.options.indexOf(option);
            const isImage = option && option.startsWith('data:image');
            return (
              <button
                key={index}
                className="border-2 rounded-xl p-4 hover:border-purple-500 transition hover:shadow-lg hover:bg-purple-50"
                onClick={() => handleAnswer(originalIndex)}
              >
                {isImage ? (
                  <div>
                    <img 
                      src={option} 
                      alt={`Option ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                    <div className="text-sm text-gray-500">Option {index + 1}</div>
                  </div>
                ) : (
                  <div className="text-lg font-medium text-gray-800 py-4">{option}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}