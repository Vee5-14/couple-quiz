'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface QuizResult {
  quizId: string;
  guesserName: string;
  guesserType: string;
  answers: number[];
  score: number;
  total: number;
  completedAt: string;
}

export default function CreateQuiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: 'Which would I prefer?',
    options: ['', '', '', ''],
    correctIndex: 0,
    imageFiles: [null, null, null, null] as (File | null)[],
    imagePreviews: ['', '', '', ''] as string[],
  });
  const [creatorName, setCreatorName] = useState('');
  const [guesserName, setGuesserName] = useState('');
  const [guesserType, setGuesserType] = useState('partner'); // 'partner' or 'friend'
  const [quizCreated, setQuizCreated] = useState(false);
  const [quizLink, setQuizLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);
  const [checkingResults, setCheckingResults] = useState(false);

  useEffect(() => {
    if (!quizCreated) return;
    
    const quizId = quizLink.split('/').pop();
    if (!quizId) return;
    
    const checkResults = () => {
      const result1 = localStorage.getItem(`results_${quizId}`);
      const result2 = localStorage.getItem(`quiz_results_${quizId}`);
      
      let data = result1 || result2;
      
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setQuizResults(parsed);
          setCheckingResults(false);
        } catch (e) {
          console.error('Error parsing results:', e);
        }
      }
    };
    
    checkResults();
    const interval = setInterval(checkResults, 5000);
    
    return () => clearInterval(interval);
  }, [quizCreated, quizLink]);

  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPreviews = [...currentQuestion.imagePreviews];
      newPreviews[index] = e.target?.result as string;
      
      const newFiles = [...currentQuestion.imageFiles];
      newFiles[index] = file;
      
      setCurrentQuestion({
        ...currentQuestion,
        imageFiles: newFiles,
        imagePreviews: newPreviews,
        options: newPreviews,
      });
    };
    reader.readAsDataURL(file);
  };

  const addQuestion = () => {
    const validOptions = currentQuestion.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please add at least 2 options with images or text');
      return;
    }
    
    setQuestions([...questions, { 
      ...currentQuestion, 
      id: uuidv4(),
      options: currentQuestion.options.filter(opt => opt.trim() !== '')
    }]);
    
    setCurrentQuestion({
      text: 'Which would I prefer?',
      options: ['', '', '', ''],
      correctIndex: 0,
      imageFiles: [null, null, null, null],
      imagePreviews: ['', '', '', ''],
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const saveQuiz = () => {
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    
    const quizId = uuidv4();
    const quizData = {
      id: quizId,
      creator: creatorName || 'Someone',
      guesser: guesserName || (guesserType === 'partner' ? 'Partner' : 'Friend'),
      guesserType: guesserType,
      questions: questions,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`quiz_${quizId}`, JSON.stringify(quizData));
    
    const url = `${window.location.origin}/quiz/${quizId}`;
    setQuizLink(url);
    setQuizCreated(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(quizLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = quizLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewResults = () => {
    setShowResults(true);
  };

  const getRelationLabel = () => {
    return guesserType === 'partner' ? 'Partner' : 'Friend';
  };

  const getResultsLabel = () => {
    return guesserType === 'partner' ? "Partner's Results" : "Friend's Results";
  };

  if (showResults && quizResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-4 text-purple-600">
            📊 {getResultsLabel()}
          </h1>
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-purple-500">
              {quizResults.score}/{quizResults.total}
            </div>
            <div className="text-xl text-gray-700 mt-2">
              {quizResults.score === quizResults.total ? 'Perfect! They know you so well! 💜' :
               quizResults.score >= quizResults.total * 0.7 ? 'Pretty good! They pay attention! 😊' :
               'They need to spend more time with you! 😄'}
            </div>
          </div>
          
          <div className="space-y-4">
            {quizResults.answers.map((answer, index) => {
              const question = questions[index];
              if (!question) return null;
              const isCorrect = answer === question.correctIndex;
              const selectedOption = question.options[answer];
              const correctOption = question.options[question.correctIndex];
              const isSelectedImage = selectedOption && selectedOption.startsWith('data:image');
              const isCorrectImage = correctOption && correctOption.startsWith('data:image');
              
              return (
                <div key={index} className={`p-4 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className="font-semibold text-gray-800 mb-2">Q{index+1}: {question.text}</div>
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-[100px]">
                      <div className="text-xs text-gray-500 mb-1">Their answer:</div>
                      {isSelectedImage ? (
                        <img 
                          src={selectedOption} 
                          alt="Their choice" 
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                      ) : (
                        <div className="font-medium text-gray-700">{selectedOption || 'Option ' + (answer + 1)}</div>
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
                        <div className="font-medium text-green-700">{correctOption || 'Option ' + (question.correctIndex + 1)}</div>
                      )}
                    </div>
                    
                    <div className="text-2xl">
                      {isCorrect ? '✅' : '❌'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-4 mt-6">
            <button 
              className="flex-1 bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600"
              onClick={() => {
                setShowResults(false);
                window.location.href = '/';
              }}
            >
              🏠 Back to Home
            </button>
            <button 
              className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600"
              onClick={() => setShowResults(false)}
            >
              📝 Back to Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizCreated) {
    const relationLabel = getRelationLabel();
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-purple-600 mb-4">
            Quiz Created Successfully!
          </h1>
          <p className="text-gray-700 mb-6">
            Share this link with your {guesserName || relationLabel.toLowerCase()} to see how well they know you!
          </p>
          
          <div className="bg-gray-100 p-4 rounded-xl mb-6 break-all">
            <p className="text-sm text-gray-600 font-mono">{quizLink}</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={copyToClipboard}
              className={`flex-1 px-6 py-3 rounded-xl text-lg font-semibold transition ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {copied ? '✅ Copied!' : '📋 Copy Link'}
            </button>
            
            <button
              onClick={handleViewResults}
              className={`flex-1 px-6 py-3 rounded-xl text-lg font-semibold transition ${
                quizResults 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!quizResults}
            >
              📊 View {getResultsLabel()} {quizResults && `(${quizResults.score}/${quizResults.total})`}
            </button>
          </div>
          
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 w-full bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition"
          >
            🏠 Back to Home
          </button>
          
          {!quizResults && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                ⏳ Waiting for your {guesserName || relationLabel.toLowerCase()} to complete the quiz...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Results will appear automatically when they finish
              </p>
              <button
                onClick={() => {
                  const quizId = quizLink.split('/').pop();
                  if (quizId) {
                    const data = localStorage.getItem(`results_${quizId}`);
                    if (data) {
                      setQuizResults(JSON.parse(data));
                    } else {
                      alert(`No results found yet. Make sure your ${relationLabel.toLowerCase()} has completed the quiz.`);
                    }
                  }
                }}
                className="mt-2 text-purple-500 text-sm hover:underline"
              >
                🔄 Check for results now
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-purple-600">
          📝 Create Your Quiz
        </h1>
        
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <p className="text-sm text-gray-500 mb-3">Names are optional ✨</p>
          <input
            type="text"
            placeholder="Your name (optional)"
            className="w-full p-3 border rounded-lg mb-3 text-gray-800"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
          />
          
          <input
            type="text"
            placeholder="Who is this for? (e.g. partner's name or friend's name)"
            className="w-full p-3 border rounded-lg mb-3 text-gray-800"
            value={guesserName}
            onChange={(e) => setGuesserName(e.target.value)}
          />
          
          {/* ✅ NEW: Partner or Friend selection */}
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="guesserType"
                value="partner"
                checked={guesserType === 'partner'}
                onChange={(e) => setGuesserType(e.target.value)}
                className="w-4 h-4 text-purple-500"
              />
              <span className="text-gray-700">💑 Partner</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="guesserType"
                value="friend"
                checked={guesserType === 'friend'}
                onChange={(e) => setGuesserType(e.target.value)}
                className="w-4 h-4 text-purple-500"
              />
              <span className="text-gray-700">🤝 Friend</span>
            </label>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="font-semibold mb-4 text-gray-800">Add a Question</h2>
          
          <input
            type="text"
            placeholder="Question text (e.g. 'Which dessert would I prefer?')"
            className="w-full p-3 border rounded-lg mb-4 text-gray-800"
            value={currentQuestion.text}
            onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="border rounded-lg p-3">
                <label className="block text-sm text-gray-700 mb-2 font-medium">
                  Option {index + 1}
                </label>
                
                <label className="w-full block">
                  <div className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition ${
                    currentQuestion.imagePreviews[index] ? 'border-purple-400 bg-purple-50' : 'border-gray-300'
                  }`}>
                    <span className="text-purple-500 font-medium">
                      {currentQuestion.imagePreviews[index] ? '🔄 Change Image' : '📸 Click to Upload Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(index, e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </label>
                
                {currentQuestion.imagePreviews[index] && (
                  <img 
                    src={currentQuestion.imagePreviews[index]} 
                    alt={`Option ${index + 1}`}
                    className="mt-2 w-full h-24 object-cover rounded"
                  />
                )}
                
                <input
                  type="text"
                  placeholder="Or type text option"
                  className="w-full p-2 border rounded-lg mt-2 text-gray-800"
                  value={currentQuestion.options[index] || ''}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                
                <button
                  className={`mt-2 w-full text-sm px-3 py-2 rounded ${
                    currentQuestion.correctIndex === index 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setCurrentQuestion({...currentQuestion, correctIndex: index})}
                >
                  {currentQuestion.correctIndex === index ? '✅ Correct Answer' : 'Set as correct'}
                </button>
              </div>
            ))}
          </div>
          
          <button
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            onClick={addQuestion}
          >
            + Add Question
          </button>
        </div>
        
        {questions.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h2 className="font-semibold mb-4 text-gray-800">Your Questions ({questions.length})</h2>
            {questions.map((q, i) => (
              <div key={i} className="border-b py-2 text-gray-700">
                <span className="font-medium">Q{i+1}:</span> {q.text}
                <span className="text-sm text-gray-400 ml-2">({q.options.length} options)</span>
              </div>
            ))}
          </div>
        )}
        
        <button
          className="w-full bg-purple-500 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-purple-600 transition"
          onClick={saveQuiz}
        >
          🎉 Generate Quiz Link
        </button>
      </div>
    </div>
  );
}