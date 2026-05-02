import { Eye, HelpCircle } from 'lucide-react';
import { GameTimer } from './GameTimer';
import { RoomCodeBadge } from './RoomCodeBadge';
import { ConnectionStatus } from './ConnectionStatus';
import { ThemeToggle } from './ThemeToggle';
import { Badge } from './ui/badge';
import { useGameStore } from '../../store/game-store';
import type { Player, Room, RoundState, ConnectionStatus as ConnStatus } from '../../lib/types';
import { cn } from '../../lib/utils';

interface GameStatusBarProps {
  round: RoundState;
  players: Player[];
  room: Room;
  connectionStatus: ConnStatus;
  isDrawer: boolean;
  onShowRules: () => void;
}

export function GameStatusBar({ round, players, room, connectionStatus, isDrawer, onShowRules }: GameStatusBarProps) {
  const isSpectator = useGameStore((state) => state.currentUser?.role === 'spectator');
  
  return (
    <header className="flex items-center gap-4 px-4 py-2 bg-white dark:bg-stone-900 border-b-2 border-stone-200 dark:border-stone-700 h-16 shrink-0 relative z-20">
      {/* Left: Round info */}
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500">Round</span>
        <span className="text-sm font-bold text-stone-700 dark:text-stone-200 leading-tight">
          {round.roundNumber} <span className="text-stone-400 font-medium">/ {round.totalRounds}</span>
        </span>
      </div>

      <div className="w-px h-8 bg-stone-100 dark:bg-stone-800" />

      {/* Middle: Word / Hint */}
      <div className="flex-1 flex flex-col items-center justify-center min-w-0">
        <div className="flex flex-col items-center max-w-full">
          {isDrawer ? (
            <>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 animate-pulse">DRAW THIS:</span>
              <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider truncate">
                {round.secretWord}
              </h2>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500">GUESS THE WORD:</span>
                {isSpectator && (
                    <Badge className="h-4 text-[8px] bg-stone-100 text-stone-500 border-stone-200 py-0 px-1">SPECTATING</Badge>
                )}
              </div>
              <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 tracking-[0.2em] font-mono truncate">
                {round.wordHint}
              </h2>
            </>
          )}
        </div>
      </div>

      {/* Right: Timer & Settings */}
      <div className="flex items-center gap-3">
        <GameTimer timeLeft={round.timeLeft} totalTime={round.duration || 60} />
        
        <div className="hidden sm:flex items-center gap-2">
          <RoomCodeBadge code={room.code} />
          <div className="w-px h-6 bg-stone-100 dark:bg-stone-800" />
          <ConnectionStatus status={connectionStatus} />
        </div>

        <button
          onClick={onShowRules}
          aria-label="How to play"
          className="p-2 rounded-xl border-2 border-transparent text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-stone-500 dark:text-stone-400" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
