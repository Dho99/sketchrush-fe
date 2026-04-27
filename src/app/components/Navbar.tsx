import { Link, useLocation } from 'react-router';
import { HelpCircle, Github } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useGameStore } from '../../store/game-store';
import { cn } from '../../lib/utils';

export function Navbar() {
  const location = useLocation();
  const { setShowRules } = useGameStore();
  const isGamePage = location.pathname.startsWith('/game/');

  // Don't show navbar on game page (it has its own status bar)
  if (isGamePage) return null;

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-stone-900 border-b-2 border-stone-200 dark:border-stone-700 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
          aria-label="Hanep.io – go home"
        >
          <div
            className={cn(
              'w-8 h-8 rounded-xl border-2 border-stone-800 dark:border-stone-400',
              'bg-amber-400 flex items-center justify-center',
              'shadow-[2px_2px_0px_#1C1917] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.15)]',
              'group-hover:shadow-[3px_3px_0px_#1C1917] dark:group-hover:shadow-[3px_3px_0px_rgba(255,255,255,0.2)]',
              'transition-shadow text-stone-900',
            )}
            aria-hidden
          >
            ✏️
          </div>
          <span
            className="text-xl text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fredoka One', sans-serif" }}
          >
            Hanep.io
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            to="/join"
            className={cn(
              'px-3 py-1.5 rounded-xl border-2 border-transparent text-sm font-semibold',
              'hover:border-stone-200 dark:hover:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800',
              'text-stone-700 dark:text-stone-300 transition-colors',
              location.pathname === '/join' && 'border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800',
            )}
          >
            Play Now
          </Link>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRules(true)}
            aria-label="Game rules"
            className="p-2 rounded-xl border-2 border-stone-200 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-400"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="p-2 rounded-xl border-2 border-stone-200 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-400"
          >
            <Github className="w-4 h-4" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
