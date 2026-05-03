import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api-client';
import { BarChart3, Trophy, Target, Palette, Star, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface UserStats {
  totalGames: number;
  wins: number;
  averageScore: number;
  bestScore: number;
  totalCorrectGuesses: number;
  totalDrawingTurns: number;
}

export function StatsPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await apiRequest<UserStats>('/api/users/me/stats');
        setStats(response);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-stone-500">Calculating your greatness...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-red-500 mb-4">⚠️ {error || 'No stats available'}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
          User Statistics
        </h1>
        <p className="text-stone-500 dark:text-stone-400">
          Your performance across all games played on SketchRush.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Main Stats Card */}
        <Card className="border-2 border-stone-800 dark:border-stone-400 bg-amber-400 text-stone-900 shadow-[6px_6px_0px_#1C1917] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4" /> Total Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black">{stats.totalGames}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-stone-800 dark:border-stone-700 shadow-[6px_6px_0px_#1C1917] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-stone-500">
              <Trophy className="w-4 h-4 text-amber-500" /> Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black">{winRate}%</div>
            <p className="text-xs font-bold text-stone-400 mt-1">{stats.wins} Wins total</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-stone-800 dark:border-stone-700 shadow-[6px_6px_0px_#1C1917] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-stone-500">
              <Star className="w-4 h-4 text-amber-500" /> Best Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black">{stats.bestScore}</div>
            <p className="text-xs font-bold text-stone-400 mt-1">Pts in one game</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-stone-200 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" /> Guessing Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-black">{stats.totalCorrectGuesses}</p>
                <p className="text-sm text-stone-500">Total Correct Guesses</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{stats.averageScore}</p>
                <p className="text-xs text-stone-400">Avg. Score per Game</p>
              </div>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-900 rounded-full h-3 border border-stone-200 dark:border-stone-800 overflow-hidden">
               <div className="bg-amber-400 h-full" style={{ width: `${Math.min(100, (stats.totalCorrectGuesses / (stats.totalGames || 1)) * 20)}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-stone-200 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-500" /> Artistic Contribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-black">{stats.totalDrawingTurns}</p>
                <p className="text-sm text-stone-500">Total Drawing Turns</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{(stats.totalDrawingTurns / (stats.totalGames || 1)).toFixed(1)}</p>
                <p className="text-xs text-stone-400">Avg. Turns per Game</p>
              </div>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-900 rounded-full h-3 border border-stone-200 dark:border-stone-800 overflow-hidden">
               <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, (stats.totalDrawingTurns / (stats.totalGames || 1)) * 50)}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
