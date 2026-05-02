import { Lightbulb, ChevronRight } from 'lucide-react';
import { RoundClue } from '../../lib/types';
import { cn } from '../../lib/utils';

interface ClueDisplayProps {
  clues: RoundClue[];
  isDrawer: boolean;
}

export function ClueDisplay({ clues, isDrawer }: ClueDisplayProps) {
  if (isDrawer) return null;
  if (clues.length === 0) return null;

  const latestClue = clues[clues.length - 1];

  return (
    <div className="flex flex-col gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-300 dark:border-amber-800 rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
          <Lightbulb className="w-4 h-4 fill-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">Clue Unlocked!</span>
        </div>
        <div className="text-[10px] font-bold text-stone-400 dark:text-stone-500 bg-white dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700">
          {latestClue.index}/{latestClue.total}
        </div>
      </div>
      
      <div className="space-y-2">
        {clues.map((c, i) => (
          <div 
            key={i} 
            className={cn(
              "text-sm font-bold text-stone-700 dark:text-stone-200 flex items-start gap-1.5",
              i < clues.length - 1 ? "opacity-50 text-xs" : "animate-pulse"
            )}
          >
            <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
            <p className="leading-tight">{c.clue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
