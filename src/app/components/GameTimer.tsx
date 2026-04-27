import { cn, formatTime } from '../../lib/utils';

interface GameTimerProps {
  timeLeft: number;
  totalTime: number;
  className?: string;
}

export function GameTimer({ timeLeft, totalTime, className }: GameTimerProps) {
  const progress = (timeLeft / totalTime) * 100;
  const isUrgent = timeLeft <= 10;
  const isWarning = timeLeft <= 20 && timeLeft > 10;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div
        className={cn(
          'text-2xl font-bold tabular-nums transition-colors',
          isUrgent && 'text-rose-600 dark:text-rose-400 animate-pulse',
          isWarning && 'text-amber-600 dark:text-amber-400',
          !isUrgent && !isWarning && 'text-stone-800 dark:text-stone-200',
        )}
        style={{ fontFamily: "'Fredoka One', sans-serif" }}
      >
        {formatTime(timeLeft)}
      </div>
      <div className="w-24 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden border border-stone-300 dark:border-stone-600">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000',
            isUrgent && 'bg-rose-500',
            isWarning && 'bg-amber-500',
            !isUrgent && !isWarning && 'bg-emerald-500',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
