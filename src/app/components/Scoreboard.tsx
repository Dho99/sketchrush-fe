import { Crown, Pencil, Eye } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';
import type { Player } from '../../lib/types';
import { cn } from '../../lib/utils';

interface PlayerItemProps {
  player: Player;
  isCurrentUser: boolean;
  isDrawer: boolean;
  rank: number;
}

function PlayerItem({ player, isCurrentUser, isDrawer, rank }: PlayerItemProps) {
  const isSpectator = player.role === 'spectator';

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 transition-colors group relative',
        isCurrentUser ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-stone-50 dark:hover:bg-stone-800',
        player.status === 'disconnected' && 'opacity-50 grayscale',
      )}
    >
      {/* Rank/Status indicator */}
      <div className="w-6 flex items-center justify-center">
        {isDrawer ? (
          <Pencil className="w-4 h-4 text-amber-500 animate-bounce" />
        ) : isSpectator ? (
          <Eye className="w-3.5 h-3.5 text-stone-400" />
        ) : (
          <span className="text-xs font-black text-stone-400 group-hover:text-stone-600 transition-colors">
            #{rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="relative">
        <PlayerAvatar name={player.name} color={player.avatarColor} size="sm" />
        {player.isHost && (
          <div className="absolute -top-1 -right-1 bg-white dark:bg-stone-900 rounded-full p-0.5 border border-stone-200 dark:border-stone-700">
            <Crown className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
          </div>
        )}
      </div>

      {/* Name & Score */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={cn(
            'text-sm font-bold truncate leading-tight',
            isCurrentUser ? 'text-stone-900 dark:text-stone-100' : 'text-stone-700 dark:text-stone-300'
          )}>
            {player.name} {isCurrentUser && <span className="text-[10px] opacity-50">(You)</span>}
          </p>
        </div>
        <p className="text-xs font-black text-amber-600 dark:text-amber-500">
          {isSpectator ? 'WATCHING' : `${player.score} pts`}
        </p>
      </div>

      {/* Status badge */}
      {!isSpectator && player.status === 'guessed' && (
        <div className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
          Done
        </div>
      )}
    </div>
  );
}

interface ScoreboardProps {
  players: Player[];
  currentUserId?: string;
  currentDrawerId?: string;
}

export function Scoreboard({ players, currentUserId, currentDrawerId }: ScoreboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-stone-900">
      <div className="px-4 py-3 border-b-2 border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
        <h3 className="text-xs font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">
          Leaderboard
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto divide-y-2 divide-stone-50 dark:divide-stone-800/50">
        {sortedPlayers.map((player, index) => (
          <PlayerItem
            key={player.id}
            player={player}
            isCurrentUser={player.id === currentUserId}
            isDrawer={player.id === currentDrawerId}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}
