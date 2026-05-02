import { useEffect } from 'react';
import { Trophy, Crown, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlayerAvatar } from './PlayerAvatar';
import type { Player } from '../../lib/types';
import { cn } from '../../lib/utils';

interface GameEndModalProps {
  players: Player[];
  onBackToPublicLobby: () => void;
}

export function GameEndModal({ players, onBackToPublicLobby }: GameEndModalProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  useEffect(() => {
    // Confetti burst for winner
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.4 },
      colors: ['#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6'],
    });
    const t2 = setTimeout(() => {
      confetti({ particleCount: 60, spread: 60, origin: { x: 0.1, y: 0.6 } });
    }, 400);
    const t3 = setTimeout(() => {
      confetti({ particleCount: 60, spread: 60, origin: { x: 0.9, y: 0.6 } });
    }, 700);
    return () => { clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const medalColors = ['#F59E0B', '#94A3B8', '#C97C3A'];
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Game over"
    >
      <div className="bg-white dark:bg-stone-900 border-2 border-stone-800 dark:border-stone-500 rounded-2xl shadow-[6px_6px_0px_#1C1917] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.1)] w-full max-w-md p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-widest">Game Over</p>
          <h2
            className="text-4xl text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fredoka One', sans-serif" }}
          >
            Game Over
          </h2>
        </div>

        {/* Winner highlight */}
        {winner && (
          <div className="relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/20">
            <span className="text-4xl" aria-hidden>👑</span>
            <PlayerAvatar name={winner.name} color={winner.avatarColor} size="lg" />
            <div className="text-center">
              <p
                className="text-2xl text-stone-900 dark:text-stone-100"
                style={{ fontFamily: "'Fredoka One', sans-serif" }}
              >
                {winner.name}
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-bold">{winner.score} points</p>
            </div>
            <span className="absolute top-2 right-2">
              <Crown className="w-5 h-5 text-amber-500" />
            </span>
          </div>
        )}

        {/* Full leaderboard */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Leaderboard</p>
          <div className="space-y-1.5">
            {sorted.length > 0 ? sorted.map((player, index) => (
              <div
                key={player.id}
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-xl border',
                  index === 0
                    ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50',
                )}
              >
                <span className="text-lg w-6 text-center" aria-hidden>
                  {index < 3 ? medals[index] : `${index + 1}.`}
                </span>
                <PlayerAvatar name={player.name} color={player.avatarColor} size="sm" />
                <span className="flex-1 text-sm font-semibold text-stone-800 dark:text-stone-200">
                  {player.name}
                </span>
                <span
                  className="text-base font-bold"
                  style={{ color: index < 3 ? medalColors[index] : undefined }}
                >
                  {player.score}
                </span>
                <Trophy className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
              </div>
            )) : (
              <p className="text-center py-4 text-sm text-stone-400 font-medium">No final scores available.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex">
          <button
            onClick={onBackToPublicLobby}
            className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl border-2 border-stone-800 dark:border-stone-400 bg-amber-400 hover:bg-amber-500 text-stone-900 transition-colors text-sm font-bold shadow-[3px_3px_0px_#1C1917]"
          >
            <Home className="w-4 h-4" />
            Back to Public Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
