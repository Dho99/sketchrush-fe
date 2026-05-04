import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { Navbar } from './Navbar';
import { RulesModal } from './RulesModal';
import { useGameStore } from '../../store/game-store';

export function AppShell() {
  const { showRules, setShowRules } = useGameStore();

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-[#0F0F1A]" style={{ fontFamily: 'var(--font-body)' }}>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Toaster
        richColors
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-body)',
            border: '2px solid',
            borderRadius: '12px',
          },
        }}
      />
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
