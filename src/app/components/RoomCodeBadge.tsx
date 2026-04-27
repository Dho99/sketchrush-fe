import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { copyToClipboard, cn } from '../../lib/utils';

interface RoomCodeBadgeProps {
  code: string;
  size?: 'sm' | 'lg';
  className?: string;
}

export function RoomCodeBadge({ code, size = 'sm', className }: RoomCodeBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    toast.success('Room code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (size === 'lg') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-widest">Room Code</p>
        <div className="flex items-center gap-3">
          <span
            className="font-display text-5xl tracking-widest text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fredoka One', sans-serif" }}
          >
            {code}
          </span>
          <button
            onClick={handleCopy}
            aria-label="Copy room code"
            className="p-2 rounded-xl border-2 border-stone-800 dark:border-stone-500 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors shadow-[2px_2px_0px_#1C1917] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.1)] active:translate-y-[1px]"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-600" />
            ) : (
              <Copy className="w-5 h-5 text-stone-700 dark:text-stone-300" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy room code"
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-stone-800 dark:border-stone-500',
        'bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50',
        'text-stone-800 dark:text-stone-200 transition-colors',
        'shadow-[2px_2px_0px_#1C1917] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.1)]',
        'active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917]',
        className,
      )}
    >
      <span className="text-xs font-bold tracking-wider">{code}</span>
      {copied ? (
        <Check className="w-3 h-3 text-emerald-600" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </button>
  );
}
