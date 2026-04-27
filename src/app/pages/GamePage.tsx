import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { GameStatusBar } from '../components/GameStatusBar';
import { Scoreboard } from '../components/Scoreboard';
import { DrawingCanvas } from '../components/DrawingCanvas';
import { ChatPanel } from '../components/ChatPanel';
import { RoundResultModal } from '../components/RoundResultModal';
import { GameEndModal } from '../components/GameEndModal';
import { ReplayModal } from '../components/ReplayModal';
import { RulesModal } from '../components/RulesModal';
import { ThemeToggle } from '../components/ThemeToggle';
import { useGameStore } from '../../store/game-store';
import { generateId } from '../../lib/utils';
import { sendChatMessage, requestNextRound, leaveRoom } from '../../lib/socket-placeholder';
import type { ChatMessage, Stroke } from '../../lib/types';
import { cn } from '../../lib/utils';

// Mobile tab type
type MobileTab = 'players' | 'canvas' | 'chat';

export function GamePage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [mobileTab, setMobileTab] = useState<MobileTab>('canvas');

  const {
    currentUser,
    room,
    players,
    round,
    messages,
    strokes,
    settings,
    connectionStatus,
    showRoundResult,
    showGameEnd,
    showRules,
    showReplay,
    roundResult,
    initializeMockGame,
    addMessage,
    addStroke,
    removeLastStroke,
    clearStrokes,
    setShowRoundResult,
    setShowGameEnd,
    setShowRules,
    setShowReplay,
    decrementTimer,
  } = useGameStore();

  // Initialize mock game state on mount
  useEffect(() => {
    initializeMockGame();
  }, [initializeMockGame]);

  // Timer countdown
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    timerRef.current = setInterval(() => {
      decrementTimer();
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [decrementTimer]);

  // Auto show round result after timer ends (mock)
  useEffect(() => {
    if (round?.timeLeft === 0) {
      setTimeout(() => setShowRoundResult(true), 500);
    }
  }, [round?.timeLeft, setShowRoundResult]);

  const isDrawer = currentUser?.id === round?.currentDrawerId;
  const currentDisplayRoom = room ?? { code: roomCode ?? 'HANEP7', hostId: 'p1' };

  const handleSendMessage = (text: string) => {
    if (!currentUser) return;

    const newMsg: ChatMessage = {
      id: generateId(),
      playerId: currentUser.id,
      playerName: currentUser.name,
      content: text,
      type: 'normal',
      timestamp: Date.now(),
    };

    addMessage(newMsg);

    // TODO: Replace with socket.emit('chat:send' or 'guess:submit', { message: text })
    sendChatMessage(text);

    // Mock: simulate smart answer tolerance for non-drawers
    if (!isDrawer && round) {
      const guess = text.toLowerCase().trim();
      const answer = round.secretWord.toLowerCase();
      const distance = levenshtein(guess, answer);

      if (guess === answer) {
        // Correct guess
        const sysMsg: ChatMessage = {
          id: generateId(),
          playerId: 'system',
          playerName: 'System',
          content: `${currentUser.name} guessed the word! 🎉`,
          type: 'correct-guess',
          timestamp: Date.now(),
        };
        addMessage(sysMsg);
        toast.success('You guessed it! 🎉');
      } else if (settings.enableSmartTolerance && distance <= 2 && guess.length >= 3) {
        // Close guess
        const sysMsg: ChatMessage = {
          id: generateId(),
          playerId: 'system',
          playerName: 'System',
          content: `${currentUser.name}'s guess was close! 👀`,
          type: 'close-guess',
          timestamp: Date.now(),
        };
        addMessage(sysMsg);
        toast(`Your guess was close! Keep trying 👀`, { icon: '🔥' });
      }
    }
  };

  const handleStrokeComplete = (stroke: Stroke) => {
    addStroke(stroke);
  };

  const handleClear = () => {
    clearStrokes();
  };

  const handleUndo = () => {
    removeLastStroke();
  };

  const handleNextRound = () => {
    setShowRoundResult(false);
    // TODO: Replace with socket.emit('round:next')
    requestNextRound();
    toast.success('Starting next round...');
  };

  const handlePlayAgain = () => {
    setShowGameEnd(false);
    navigate(`/lobby/${roomCode}`);
  };

  const handleBackToHome = () => {
    setShowGameEnd(false);
    // TODO: socket.emit('room:leave')
    leaveRoom();
    navigate('/');
  };

  if (!round) {
    return (
      <div className="flex items-center justify-center h-screen bg-amber-50 dark:bg-[#0F0F1A]">
        <div className="text-center space-y-2">
          <div className="text-4xl" aria-hidden>⏳</div>
          <p className="text-stone-600 dark:text-stone-400">Loading game...</p>
        </div>
      </div>
    );
  }

  const mobileTabs: { id: MobileTab; label: string; icon: string }[] = [
    { id: 'players', label: 'Players', icon: '👥' },
    { id: 'canvas', label: 'Canvas', icon: '🎨' },
    { id: 'chat', label: 'Chat', icon: '💬' },
  ];

  return (
    <div className="flex flex-col h-screen bg-amber-50 dark:bg-[#0F0F1A] overflow-hidden">
      {/* Status bar */}
      <GameStatusBar
        round={round}
        players={players}
        room={currentDisplayRoom}
        connectionStatus={connectionStatus}
        isDrawer={isDrawer}
        onShowRules={() => setShowRules(true)}
      />

      {/* ── Desktop layout: 3 columns ─── */}
      <div className="hidden md:flex flex-1 min-h-0 gap-0 overflow-hidden">
        {/* Left: Scoreboard */}
        <aside className="w-56 lg:w-64 shrink-0 border-r-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden flex flex-col">
          <Scoreboard
            players={players}
            currentUserId={currentUser?.id}
            currentDrawerId={round.currentDrawerId}
          />
        </aside>

        {/* Center: Canvas */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-stone-100 dark:bg-stone-800">
          <DrawingCanvas
            isDrawer={isDrawer}
            initialStrokes={strokes}
            onStrokeComplete={handleStrokeComplete}
            onClear={handleClear}
            onUndo={handleUndo}
          />
        </main>

        {/* Right: Chat */}
        <aside className="w-64 lg:w-72 shrink-0 border-l-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden flex flex-col">
          <ChatPanel
            messages={messages}
            isDrawer={isDrawer}
            onSendMessage={handleSendMessage}
          />
        </aside>
      </div>

      {/* ── Mobile layout: tabbed ─── */}
      <div className="flex md:hidden flex-col flex-1 min-h-0 overflow-hidden">
        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-stone-900">
          {mobileTab === 'players' && (
            <div className="h-full overflow-y-auto">
              <Scoreboard
                players={players}
                currentUserId={currentUser?.id}
                currentDrawerId={round.currentDrawerId}
              />
            </div>
          )}
          {mobileTab === 'canvas' && (
            <div className="h-full bg-stone-100 dark:bg-stone-800 flex flex-col">
              <DrawingCanvas
                isDrawer={isDrawer}
                initialStrokes={strokes}
                onStrokeComplete={handleStrokeComplete}
                onClear={handleClear}
                onUndo={handleUndo}
              />
            </div>
          )}
          {mobileTab === 'chat' && (
            <div className="h-full flex flex-col">
              <ChatPanel
                messages={messages}
                isDrawer={isDrawer}
                onSendMessage={handleSendMessage}
              />
            </div>
          )}
        </div>

        {/* Tab bar */}
        <nav className="flex border-t-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          {mobileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              aria-label={tab.label}
              className={cn(
                'flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors text-xs',
                mobileTab === tab.id
                  ? 'text-amber-600 dark:text-amber-400 border-t-2 border-amber-500 -mt-0.5'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800',
              )}
            >
              <span className="text-lg" aria-hidden>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Modals ─── */}
      {showRoundResult && roundResult && (
        <RoundResultModal
          result={roundResult}
          players={players}
          isHost={currentUser?.isHost ?? false}
          onNextRound={handleNextRound}
          onWatchReplay={() => { setShowRoundResult(false); setShowReplay(true); }}
        />
      )}

      {showGameEnd && (
        <GameEndModal
          players={players}
          onPlayAgain={handlePlayAgain}
          onBackToHome={handleBackToHome}
        />
      )}

      {showReplay && (
        <ReplayModal
          strokes={strokes}
          word={round.secretWord}
          onClose={() => setShowReplay(false)}
        />
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* Dev toolbar (only shown in dev) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2 bg-black/70 backdrop-blur-sm rounded-xl p-2 border border-white/10">
        <button onClick={() => setShowRoundResult(true)} className="text-xs text-white/70 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors">
          Round Result ↗
        </button>
        <button onClick={() => setShowGameEnd(true)} className="text-xs text-white/70 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors">
          Game End ↗
        </button>
        <button onClick={() => setShowReplay(true)} className="text-xs text-white/70 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors">
          Replay ↗
        </button>
        <ThemeToggle className="w-7 h-7 rounded-lg border-white/20 bg-white/10 hover:bg-white/20" />
      </div>
    </div>
  );
}

// Simple Levenshtein distance for smart tolerance
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
