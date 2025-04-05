// src/app/page.js
import { getTodayMatches } from '#backend/matches';

export default async function Home() {
  // Fetch today's matches
  const todayMatches = await getTodayMatches();
  
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-center mb-8">IPL Fantasy</h1>
      
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Today's Matches</h2>
        
        {todayMatches.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {todayMatches.map((match, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2">
                        <span className="text-xl font-bold">{match.Team1.slice(0, 3)}</span>
                      </div>
                      <span className="font-semibold text-white">{match.Team1}</span>
                    </div>
                    
                    <div className="text-white text-lg font-bold">VS</div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2">
                        <span className="text-xl font-bold">{match.Team2.slice(0, 3)}</span>
                      </div>
                      <span className="font-semibold text-white">{match.Team2}</span>
                    </div>
                  </div>
                  
                  <div className="text-center text-white">
                    <p className="text-sm opacity-90">
                      {new Date(match.Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {match.Venue}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-xl">No matches scheduled for today</p>
          </div>
        )}
      </div>
    </div>
  );
}