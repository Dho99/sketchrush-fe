import { Trophy, Star, Play } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';
import type { RoundResult, Player } from '../../lib/types';
import { cn } from '../../lib/utils';

interface RoundResultModalProps {
  result: RoundResult;
  players: Player[];
  isHost: boolean;
  onNextRound: () => void;
  onWatchReplay: () => void;
}

export function RoundResultModal({ result, players, isHost, onNextRound, onWatchReplay }: RoundResultModalProps) {
  const drawer = players.find((p) => p.id === result.drawerId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Round result"
    >
      <div className="bg-white dark:bg-stone-900 border-2 border-stone-800 dark:border-stone-500 rounded-2xl shadow-[6px_6px_0px_#1C1917] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.1)] w-full max-w-md p-6 space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-widest">Round Over!</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl" aria-hidden>🎉</span>
            <h2
              className="text-3xl text-stone-900 dark:text-stone-100"
              style={{ fontFamily: "'Fredoka One', sans-serif" }}
            >
              The word was
            </h2>
          </div>
          <p
            className="text-4xl font-bold text-amber-500 tracking-widest uppercase"
            style={{ fontFamily: "'Fredoka One', sans-serif" }}
          >
            {result.correctWord}
          </p>
        </div>

        {/* Drawer bonus */}
        {drawer && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700">
            <PlayerAvatar name={drawer.name} color={drawer.avatarColor} size="md" />
            <div className="flex-1">
              <p className="text-sm font-bold text-stone-800 dark:text-stone-200">{drawer.name} (Drawer)</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {result.correctGuessers.length > 0 ? 'People guessed correctly!' : 'No one guessed...'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Star className="w-4 h-4" />
              <span className="font-bold">+{result.drawerBonus}</span>
            </div>
          </div>
        )}

        {/* Correct guessers */}
        {result.correctGuessers.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
              Correct Guessers
            </p>
            <div className="space-y-1.5">
              {result.correctGuessers.map((g, i) => {
                const player = players.find((p) => p.id === g.playerId);
                return (
                  <div
                    key={g.playerId}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                  >
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-bold w-5 text-center">
                      #{i + 1}
                    </span>
                    {player && <PlayerAvatar name={player.name} color={player.avatarColor} size="sm" />}
                    <span className="flex-1 text-sm font-semibold text-stone-800 dark:text-stone-200">{g.playerName}</span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">{g.guessTime}s</span>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Trophy className="w-3.5 h-3.5" />
                      <span className="text-sm font-bold">+{g.pointsGained}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-3 rounded-xl bg-stone-100 dark:bg-stone-800">
            <p className="text-sm text-stone-500 dark:text-stone-400">No one guessed this round 😅</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onWatchReplay}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-stone-300 dark:border-stone-600',
              'hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm text-stone-700 dark:text-stone-300',
            )}
          >
            <Play className="w-4 h-4" />
            Watch Replay
          </button>
          <button
            onClick={onNextRound}
            disabled={!isHost}
            title={!isHost ? 'Only the host can start the next round' : undefined}
            className={cn(
              'flex-1 py-2.5 rounded-xl border-2 border-stone-800 dark:border-stone-400',
              'bg-amber-400 hover:bg-amber-500 text-stone-900',
              'shadow-[3px_3px_0px_#1C1917] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.1)]',
              'active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917]',
              'transition-all text-sm font-bold',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0',
            )}
          >
            {isHost ? 'Next Round →' : 'Waiting for host...'}
          </button>
        </div>
      </div>
    </div>
  );
}
