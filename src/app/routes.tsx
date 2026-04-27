import { createBrowserRouter } from 'react-router';
import { AppShell } from './components/AppShell';
import { LandingPage } from './pages/LandingPage';
import { JoinPage } from './pages/JoinPage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <span className="text-6xl" aria-hidden>🎨</span>
      <h1
        className="text-4xl text-stone-900 dark:text-stone-100"
        style={{ fontFamily: "'Fredoka One', sans-serif" }}
      >
        404 – Page Not Found
      </h1>
      <p className="text-stone-500 dark:text-stone-400">
        Looks like you drew outside the lines.
      </p>
      <a
        href="/"
        className="px-6 py-2.5 rounded-xl border-2 border-stone-800 dark:border-stone-400 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold shadow-[3px_3px_0px_#1C1917] transition-all"
      >
        Back to Home
      </a>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: LandingPage },
      { path: 'join', Component: JoinPage },
      { path: 'lobby/:roomCode', Component: LobbyPage },
      { path: 'game/:roomCode', Component: GamePage },
      { path: '*', Component: NotFound },
    ],
  },
]);
