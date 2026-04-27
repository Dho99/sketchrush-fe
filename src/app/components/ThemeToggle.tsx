import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative w-10 h-10 rounded-xl border-2 border-stone-800 dark:border-stone-400',
        'bg-white dark:bg-stone-800',
        'flex items-center justify-center',
        'hover:bg-amber-50 dark:hover:bg-stone-700',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
        'shadow-[2px_2px_0px_#1C1917] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.15)]',
        'active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917]',
        className,
      )}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-stone-700" />
      )}
    </button>
  );
}
