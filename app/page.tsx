export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-4xl font-bold text-purple-600 mb-4">
          💜 Know Me Better
        </h1>
        <p className="text-gray-800 text-lg mb-8">
          Create a quiz and see how well your partner or friends know you!
        </p>
        
        <div className="space-y-4">
          <a href="/create" 
             className="block bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition text-lg font-semibold">
            ✨ Create a Quiz
          </a>
          <a href="/dashboard" 
             className="block bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition text-lg font-semibold">
            📊 Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}