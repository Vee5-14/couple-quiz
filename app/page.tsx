export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-purple-500/20">
        <h1 className="text-4xl font-bold text-purple-400 mb-4">
          💜 How Well Do You Know Me?
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Create a quiz and see how well your partner or friends know you!
        </p>
        
        <div className="space-y-4">
          <a href="/create" 
             className="block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition text-lg font-semibold">
            ✨ Create a Quiz
          </a>
          <a href="/dashboard" 
             className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition text-lg font-semibold">
            📊 Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}