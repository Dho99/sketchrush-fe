import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api-client';
import { History, Trophy, Users, Hash, Calendar as CalendarIcon, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface PlayRecord {
  id: string;
  roomCode: string;
  finalScore: number;
  rank: number;
  totalPlayers: number;
  totalRounds: number;
  correctGuesses: number;
  drawingTurns: number;
  win: boolean;
  playedAt: string;
}

export function PlayingHistoryPage() {
  const [records, setRecords] = useState<PlayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecords() {
      try {
        const response = await apiRequest<{ data: PlayRecord[] }>('/api/users/me/play-records');
        setRecords(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch playing history');
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-stone-500">Loading your history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
            Playing History
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            Relive your greatest artistic moments and guesses.
          </p>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-2xl border-2 border-amber-200 dark:border-amber-900/30">
          <History className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
      </div>

      {records.length === 0 ? (
        <Card className="border-2 border-dashed border-stone-200 dark:border-stone-800 bg-transparent">
          <CardContent className="py-16 text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-2">No games played yet</h3>
            <p className="text-stone-500 dark:text-stone-400 mb-6">
              Your match history will appear here once you finish a game while logged in.
            </p>
            <a 
              href="/join"
              className="px-6 py-2.5 rounded-xl border-2 border-stone-800 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold shadow-[3px_3px_0px_#1C1917] transition-all"
            >
              Play a Match
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <Card 
              key={record.id}
              className="border-2 border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-400 transition-colors group cursor-default overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left Section: Status & Date */}
                  <div className={cn(
                    "w-full md:w-32 flex flex-col items-center justify-center py-4 px-2 text-center",
                    record.win ? "bg-amber-400 text-stone-900" : "bg-stone-50 dark:bg-stone-900 text-stone-500"
                  )}>
                    {record.win ? (
                      <Trophy className="w-8 h-8 mb-1" />
                    ) : (
                      <span className="text-2xl font-black mb-1">#{record.rank}</span>
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-widest">
                      {record.win ? "WINNER" : `RANK ${record.rank}`}
                    </span>
                  </div>

                  {/* Middle Section: Stats */}
                  <div className="flex-1 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>Date</span>
                      </div>
                      <p className="text-sm font-bold">
                        {new Date(record.playedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                        <Hash className="w-3 h-3" />
                        <span>Room</span>
                      </div>
                      <p className="text-sm font-bold font-mono uppercase text-amber-600 dark:text-amber-400">
                        {record.roomCode}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Guesses</span>
                      </div>
                      <p className="text-sm font-bold">
                        {record.correctGuesses} Correct
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                        <Trophy className="w-3 h-3" />
                        <span>Score</span>
                      </div>
                      <p className="text-sm font-bold">
                        {record.finalScore} pts
                      </p>
                    </div>
                  </div>

                  {/* Right Section: Players/Rounds info */}
                  <div className="p-4 bg-stone-50/50 dark:bg-stone-900/50 border-t md:border-t-0 md:border-l border-stone-100 dark:border-stone-800 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-stone-400" />
                      <span className="font-semibold text-stone-600 dark:text-stone-300">{record.totalPlayers} Players</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
                    <div className="font-semibold text-stone-600 dark:text-stone-300">{record.totalRounds} Rounds</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
