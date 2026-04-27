import { Trophy } from 'lucide-react';
import { PlayerCard } from './PlayerCard';
import type { Player } from '../../lib/types';

interface ScoreboardProps {
  players: Player[];
  currentUserId: string | undefined;
  currentDrawerId?: string;
}

export function Scoreboard({ players, currentUserId, currentDrawerId }: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-stone-200 dark:border-stone-700">
        <Trophy className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-bold text-stone-800 dark:text-stone-200">Scoreboard</span>
        <span className="ml-auto text-xs text-stone-400 dark:text-stone-500">{players.length} players</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sorted.map((player, index) => (
          <PlayerCard
            key={player.id}
            player={{ ...player, status: player.id === currentDrawerId ? 'drawing' : player.status }}
            rank={index + 1}
            isCurrentUser={player.id === currentUserId}
            compact={false}
          />
        ))}
      </div>
    </div>
  );
}
