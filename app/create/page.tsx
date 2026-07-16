'use client';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndexes: number[];
  hasCorrectAnswer: boolean;
  imageFiles: (File | null)[];
  imagePreviews: string[];
}

export default function CreateQuiz() {
  const [quizTitle, setQuizTitle] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [guesserType, setGuesserType] = useState('partner');
  const [hasCorrectAnswer, setHasCorrectAnswer] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctIndexes: [] as number[],
    hasCorrectAnswer: true,
    imageFiles: [null, null, null, null] as (File | null)[],
    imagePreviews: ['', '', '', ''] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [quizCreated, setQuizCreated] = useState(false);
  const [quizLink, setQuizLink] = useState('');
  const [copied, setCopied] = useState(false);

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

  const toggleCorrectAnswer = (index: number) => {
    if (!hasCorrectAnswer) return;
    
    setCurrentQuestion(prev => {
      const newCorrectIndexes = [...prev.correctIndexes];
      const idx = newCorrectIndexes.indexOf(index);
      if (idx > -1) {
        newCorrectIndexes.splice(idx, 1);
      } else {
        newCorrectIndexes.push(index);
      }
      return { ...prev, correctIndexes: newCorrectIndexes };
    });
  };

  const addQuestion = () => {
    const validOptions = currentQuestion.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please add at least 2 options');
      return;
    }
    
    if (hasCorrectAnswer && currentQuestion.correctIndexes.length === 0) {
      alert('Please select at least one correct answer');
      return;
    }
    
    setQuestions([...questions, { 
      ...currentQuestion, 
      id: uuidv4(),
      options: currentQuestion.options.filter(opt => opt.trim() !== ''),
      hasCorrectAnswer: hasCorrectAnswer,
    }]);
    
    setCurrentQuestion({
      text: '',
      options: ['', '', '', ''],
      correctIndexes: [],
      hasCorrectAnswer: true,
      imageFiles: [null, null, null, null],
      imagePreviews: ['', '', '', ''],
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const saveQuiz = async () => {
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    
    if (!quizTitle.trim()) {
      alert('Please give your quiz a title');
      return;
    }
    
    setSaving(true);
    
    try {
      const quizId = uuidv4();
      const quizData = {
        id: quizId,
        creator: creatorName || 'Someone',
        title: quizTitle,
        guesserType: guesserType,
        hasCorrectAnswer: hasCorrectAnswer,
        questions: questions.map(q => ({
          ...q,
          imageFiles: undefined,
        })),
        createdAt: new Date().toISOString()
      };
      
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData),
      });
      
      if (!response.ok) throw new Error('Failed to save quiz');
      
      const url = `${window.location.origin}/quiz/${quizId}`;
      setQuizLink(url);
      setQuizCreated(true);
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz. Please try again.');
    } finally {
      setSaving(false);
    }
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

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  if (quizCreated) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-purple-500/20">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-purple-400 mb-4">
            Quiz Created Successfully!
          </h1>
          <p className="text-gray-300 mb-6">
            Share this link with others to take your quiz!
          </p>
          
          <div className="bg-gray-700 p-4 rounded-xl mb-6 break-all">
            <p className="text-sm text-gray-300 font-mono">{quizLink}</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={copyToClipboard}
              className={`flex-1 px-6 py-3 rounded-xl text-lg font-semibold transition ${
                copied ? 'bg-green-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {copied ? '✅ Copied!' : '📋 Copy Link'}
            </button>
            <a
              href="/dashboard"
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition text-center"
            >
              📊 Dashboard
            </a>
          </div>
          
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 w-full bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-purple-400">
          📝 Create Your Quiz
        </h1>
        
        <div className="bg-gray-800 p-6 rounded-xl shadow-md mb-6 border border-purple-500/20">
          <h2 className="font-semibold mb-4 text-gray-300">Quiz Settings</h2>
          
          <input
            type="text"
            placeholder="Quiz Title (e.g., 'How Well Do You Know Me?')"
            className="w-full p-3 border border-gray-600 rounded-lg mb-3 text-white bg-gray-700"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
          />
          
          <input
            type="text"
            placeholder="Your name (optional)"
            className="w-full p-3 border border-gray-600 rounded-lg mb-3 text-white bg-gray-700"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
          />
          
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-2 cursor-pointer text-gray-300">
              <input
                type="radio"
                name="guesserType"
                value="partner"
                checked={guesserType === 'partner'}
                onChange={(e) => setGuesserType(e.target.value)}
                className="w-4 h-4 text-purple-500"
              />
              💑 Partner
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-300">
              <input
                type="radio"
                name="guesserType"
                value="friend"
                checked={guesserType === 'friend'}
                onChange={(e) => setGuesserType(e.target.value)}
                className="w-4 h-4 text-purple-500"
              />
              🤝 Friend
            </label>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-gray-300">
              <input
                type="radio"
                name="answerMode"
                checked={hasCorrectAnswer === true}
                onChange={() => setHasCorrectAnswer(true)}
                className="w-4 h-4 text-purple-500"
              />
              ✅ Has Correct Answer
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-300">
              <input
                type="radio"
                name="answerMode"
                checked={hasCorrectAnswer === false}
                onChange={() => setHasCorrectAnswer(false)}
                className="w-4 h-4 text-purple-500"
              />
              🔍 Preference Only (No Correct)
            </label>
          </div>
          
          {hasCorrectAnswer && (
            <p className="text-sm text-gray-400 mt-2">
              💡 Select one or more correct answers for each question
            </p>
          )}
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl shadow-md mb-6 border border-purple-500/20">
          <h2 className="font-semibold mb-4 text-gray-300">Add a Question</h2>
          
          <input
            type="text"
            placeholder="Question text"
            className="w-full p-3 border border-gray-600 rounded-lg mb-4 text-white bg-gray-700"
            value={currentQuestion.text}
            onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-3">
                <label className="block text-sm text-gray-300 mb-2 font-medium">
                  Option {index + 1}
                </label>
                
                <label className="w-full block">
                  <div className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:border-purple-500 hover:bg-gray-700 transition ${
                    currentQuestion.imagePreviews[index] ? 'border-purple-400 bg-gray-700' : 'border-gray-600'
                  }`}>
                    <span className="text-purple-400 font-medium">
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
                  className="w-full p-2 border border-gray-600 rounded-lg mt-2 text-white bg-gray-700"
                  value={currentQuestion.options[index] || ''}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                
                {hasCorrectAnswer && (
                  <button
                    className={`mt-2 w-full text-sm px-3 py-2 rounded ${
                      currentQuestion.correctIndexes.includes(index) 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                    onClick={() => toggleCorrectAnswer(index)}
                  >
                    {currentQuestion.correctIndexes.includes(index) ? '✅ Correct' : 'Mark as correct'}
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {hasCorrectAnswer && currentQuestion.correctIndexes.length > 0 && (
            <p className="text-sm text-green-400 mt-2">
              ✅ {currentQuestion.correctIndexes.length} option(s) marked as correct
            </p>
          )}
          
          <button
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={addQuestion}
          >
            + Add Question
          </button>
        </div>
        
        {questions.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-xl shadow-md mb-6 border border-purple-500/20">
            <h2 className="font-semibold mb-4 text-gray-300">Your Questions ({questions.length})</h2>
            {questions.map((q, i) => (
              <div key={i} className="border-b border-gray-700 py-3 flex justify-between items-center">
                <div>
                  <div className="font-medium text-white">Q{i+1}: {q.text}</div>
                  <div className="text-sm text-gray-400">
                    {q.hasCorrectAnswer 
                      ? `✅ ${q.correctIndexes.length} correct answer(s)`
                      : '🔍 No correct answer (preference only)'}
                  </div>
                </div>
                <button
                  onClick={() => removeQuestion(i)}
                  className="text-red-400 hover:text-red-300"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
        
        <button
          className="w-full bg-purple-600 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          onClick={saveQuiz}
          disabled={saving || questions.length === 0}
        >
          {saving ? '⏳ Saving...' : '🎉 Save Quiz'}
        </button>
      </div>
    </div>
  );
}