import { Eye, HelpCircle } from 'lucide-react';
import { GameTimer } from './GameTimer';
import { RoomCodeBadge } from './RoomCodeBadge';
import { ConnectionStatus } from './ConnectionStatus';
import { ThemeToggle } from './ThemeToggle';
import { PlayerAvatar } from './PlayerAvatar';
import type { RoundState, Player, ConnectionStatus as ConnectionStatusType, Room } from '../../lib/types';

interface GameStatusBarProps {
  round: RoundState;
  players: Player[];
  room: Room;
  connectionStatus: ConnectionStatusType;
  isDrawer: boolean;
  onShowRules: () => void;
}

export function GameStatusBar({ round, players, room, connectionStatus, isDrawer, onShowRules }: GameStatusBarProps) {
  const drawer = players.find((p) => p.id === round.currentDrawerId);

  return (
    <header className="flex items-center gap-3 px-4 py-2 border-b-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 flex-wrap">
      {/* Room code */}
      <RoomCodeBadge code={room.code} />

      {/* Round info */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/30 border border-violet-300 dark:border-violet-700">
        <span className="text-xs font-bold text-violet-700 dark:text-violet-300">
          Round {round.roundNumber}/{round.totalRounds}
        </span>
      </div>

      {/* Drawer info */}
      {drawer && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
          <PlayerAvatar name={drawer.name} color={drawer.avatarColor} size="sm" showBorder={false} />
          <span className="text-xs text-stone-700 dark:text-stone-300">
            <strong>{drawer.name}</strong> is drawing
          </span>
        </div>
      )}

      {/* Word hint */}
      <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
        {isDrawer ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400">Word:</span>
            <span
              className="text-base font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase"
              style={{ fontFamily: "'Fredoka One', sans-serif" }}
            >
              {round.secretWord}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
            <span
              className="text-base font-bold tracking-[0.3em] text-stone-700 dark:text-stone-300"
              style={{ fontFamily: "'Fredoka One', sans-serif" }}
            >
              {round.wordHint}
            </span>
          </div>
        )}
      </div>

      {/* Timer */}
      <GameTimer timeLeft={round.timeLeft} totalTime={90} />

      {/* Right controls */}
      <div className="flex items-center gap-2 ml-auto">
        <ConnectionStatus status={connectionStatus} />
        <button
          onClick={onShowRules}
          aria-label="Game rules"
          className="p-2 rounded-xl border-2 border-stone-200 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-stone-500 dark:text-stone-400" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
