import { Crown, Pencil, CheckCircle2, Clock, WifiOff } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';
import { cn, getPlayerStatusColor } from '../../lib/utils';
import type { Player } from '../../lib/types';

interface PlayerCardProps {
  player: Player;
  rank?: number;
  isCurrentUser?: boolean;
  compact?: boolean;
  className?: string;
}

const statusIcons = {
  drawing: <Pencil className="w-3.5 h-3.5" />,
  guessed: <CheckCircle2 className="w-3.5 h-3.5" />,
  waiting: <Clock className="w-3.5 h-3.5" />,
  disconnected: <WifiOff className="w-3.5 h-3.5" />,
};

export function PlayerCard({ player, rank, isCurrentUser, compact = false, className }: PlayerCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 transition-colors',
        player.status === 'drawing'
          ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50',
        isCurrentUser && 'ring-2 ring-violet-400 ring-offset-1',
        player.status === 'disconnected' && 'opacity-50',
        className,
      )}
    >
      {/* Rank */}
      {rank !== undefined && (
        <span className="text-xs w-4 text-center text-stone-400 dark:text-stone-500 shrink-0">
          {rank}
        </span>
      )}

      {/* Avatar */}
      <PlayerAvatar name={player.name} color={player.avatarColor} size={compact ? 'sm' : 'md'} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
            {player.name}
          </span>
          {player.isHost && (
            <Crown className="w-3 h-3 text-amber-500 shrink-0" aria-label="Host" />
          )}
          {isCurrentUser && (
            <span className="text-xs text-violet-500 dark:text-violet-400 shrink-0">(You)</span>
          )}
        </div>
        {!compact && (
          <div className={cn('flex items-center gap-1 text-xs', getPlayerStatusColor(player.status))}>
            {statusIcons[player.status]}
            <span className="capitalize">{player.status}</span>
          </div>
        )}
      </div>

      {/* Score */}
      <span className="text-sm font-bold text-stone-800 dark:text-stone-200 shrink-0">
        {player.score}
      </span>
    </div>
  );
}
