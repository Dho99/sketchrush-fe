import { Trophy, Star, Play } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';
import type { RoundResult, Player } from '../../lib/types';
import { cn } from '../../lib/utils';
import { useGameStore } from '../../store/game-store';

interface RoundResultModalProps {
  result: RoundResult;
  players: Player[];
  isHost: boolean;
  onNextRound: () => void;
  onWatchReplay: () => void;
}

export function RoundResultModal({
  result,
  players,
  onNextRound,
  onWatchReplay,
}: RoundResultModalProps) {
  const currentUserId = useGameStore((state) => state.currentUser?.id);
  const isLastRound = Boolean(result.isLastRound);
  const canChooseWord = !isLastRound && currentUserId === result.canChooseNextWordPlayerId;
  const waitingName = result.nextDrawerName || 'the next drawer';

  const winner = [...players].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-stone-900 border-2 border-stone-800 dark:border-stone-400 rounded-3xl w-full max-w-lg shadow-[8px_8px_0px_#1C1917] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.1)] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-amber-400 border-b-2 border-stone-800 dark:border-stone-400 p-6 text-center space-y-2">
          <div className="inline-block bg-white dark:bg-stone-900 rounded-2xl p-3 shadow-[3px_3px_0px_#1C1917] mb-2 border-2 border-stone-800">
             <Trophy className="w-8 h-8 text-amber-500 fill-amber-500" />
          </div>
          <h2 className="text-3xl font-black text-stone-900" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
            Round Result
          </h2>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-600 opacity-60">The word was</span>
            <span className="text-2xl font-black text-stone-900 uppercase tracking-widest">{result.correctWord}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Winner Section */}
          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl border-2 border-stone-100 dark:border-stone-800 p-4 flex items-center gap-4">
             <PlayerAvatar name={winner?.name || '?'} color={winner?.avatarColor || '#ccc'} size="lg" />
             <div className="flex-1">
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-stone-400">Current Leader</span>
                </div>
                <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{winner?.name}</p>
             </div>
             <div className="text-right">
                <p className="text-2xl font-black text-stone-900 dark:text-stone-100">{winner?.score}</p>
                <p className="text-[10px] font-bold text-stone-400">POINTS</p>
             </div>
          </div>

          {/* Guesser List */}
          <div className="space-y-3">
             <h3 className="text-xs font-black uppercase tracking-widest text-stone-500">Correct Guessers</h3>
             <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {result.correctGuessers.length > 0 ? (
                  result.correctGuessers.map((guesser) => (
                    <div key={guesser.playerId} className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
                        <span className="text-sm font-bold text-stone-700 dark:text-stone-300">{guesser.playerName}</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">+{guesser.pointsGained}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-sm text-stone-400 font-medium italic">No one guessed it this time!</p>
                )}
             </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onWatchReplay}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-stone-800 dark:border-stone-400 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-all shadow-[3px_3px_0px_#1C1917] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917]"
            >
              <Play className="w-4 h-4" />
              Watch Replay
            </button>
            {isLastRound ? (
              <div className="flex-1 flex items-center justify-center py-3 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-bold">
                Final round completed.
              </div>
            ) : (
              <button
                onClick={onNextRound}
                disabled={!canChooseWord}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all',
                  canChooseWord
                    ? 'border-stone-800 dark:border-stone-400 bg-amber-400 hover:bg-amber-500 text-stone-900 shadow-[3px_3px_0px_#1C1917] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917]'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 border-stone-200 dark:border-stone-700 cursor-not-allowed opacity-50 shadow-none translate-y-0',
                )}
              >
                {canChooseWord ? 'Choose Word & Continue' : `Waiting for ${waitingName} to choose...`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
