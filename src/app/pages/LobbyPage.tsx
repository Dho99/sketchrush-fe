import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Crown, CheckCircle2, Circle, ArrowRight, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { RoomCodeBadge } from '../components/RoomCodeBadge';
import { SettingsPanel } from '../components/SettingsPanel';
import { EmptyState } from '../components/EmptyState';
import { useGameStore } from '../../store/game-store';
import { setReady, startGame } from '../../lib/socket-placeholder';
import { cn } from '../../lib/utils';

const MIN_PLAYERS = 2;

export function LobbyPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();

  const {
    currentUser,
    players,
    settings,
    room,
    updateSettings,
    updatePlayerReady,
    initializeMockLobby,
  } = useGameStore();

  // Initialize with mock data if no room in store
  useEffect(() => {
    if (!room) {
      initializeMockLobby();
    }
  }, [room, initializeMockLobby]);

  const isHost = currentUser?.isHost ?? false;
  const isReady = players.find((p) => p.id === currentUser?.id)?.isReady ?? false;
  const readyCount = players.filter((p) => p.isReady).length;
  const canStart = isHost && players.length >= MIN_PLAYERS && readyCount === players.length;
  const displayCode = roomCode ?? room?.code ?? '------';

  const handleToggleReady = () => {
    const nextReady = !isReady;
    if (currentUser) {
      updatePlayerReady(currentUser.id, nextReady);
    }
    // TODO: Replace with socket.emit('player:ready', { isReady: nextReady })
    setReady(nextReady);
    toast.success(nextReady ? 'You are ready! ✅' : 'You are no longer ready.');
  };

  const handleStartGame = () => {
    if (!canStart) return;
    // TODO: Replace with socket.emit('game:start')
    startGame();
    navigate(`/game/${displayCode}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Invite link copied!');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* ── Left: Room info & Players ─────────────────── */}
        <div className="space-y-4">
          {/* Room code card */}
          <div className="bg-white dark:bg-stone-900 border-2 border-stone-800 dark:border-stone-500 rounded-2xl p-6 shadow-[4px_4px_0px_#1C1917] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.1)] text-center space-y-4">
            <RoomCodeBadge code={displayCode} size="lg" />

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm text-stone-700 dark:text-stone-300"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy invite link
              </button>
            </div>

            <p className="text-xs text-stone-400 dark:text-stone-500">
              Share this code with friends to invite them
            </p>
          </div>

          {/* Player list */}
          <div className="bg-white dark:bg-stone-900 border-2 border-stone-800 dark:border-stone-500 rounded-2xl p-4 shadow-[4px_4px_0px_#1C1917] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.1)]">
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-lg text-stone-900 dark:text-stone-100"
                style={{ fontFamily: "'Fredoka One', sans-serif" }}
              >
                Players ({players.length})
              </h2>
              <span className="text-xs text-stone-400 dark:text-stone-500">
                {readyCount}/{players.length} ready
              </span>
            </div>

            {players.length < MIN_PLAYERS ? (
              <EmptyState
                icon="👥"
                title="Waiting for players..."
                description={`Need at least ${MIN_PLAYERS} players to start. Share the room code!`}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border-2 transition-colors',
                      player.isReady
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50',
                    )}
                  >
                    <PlayerAvatar name={player.name} color={player.avatarColor} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                          {player.name}
                        </span>
                        {player.isHost && (
                          <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-label="Host" />
                        )}
                        {player.id === currentUser?.id && (
                          <span className="text-xs text-violet-500 dark:text-violet-400 shrink-0">(You)</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {player.isReady ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-label="Ready" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-300 dark:text-stone-600" aria-label="Not ready" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Min players warning */}
            {players.length > 0 && players.length < MIN_PLAYERS && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 text-center">
                ⚠️ Minimum {MIN_PLAYERS} players required to start
              </p>
            )}
          </div>

          {/* Ready / Start buttons */}
          <div className="flex gap-3">
            {/* Ready toggle */}
            <button
              onClick={handleToggleReady}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all',
                isReady
                  ? 'border-stone-800 dark:border-stone-400 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 shadow-[2px_2px_0px_#1C1917]'
                  : 'border-stone-800 dark:border-stone-400 bg-emerald-400 hover:bg-emerald-500 text-stone-900 shadow-[3px_3px_0px_#1C1917] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917]',
              )}
            >
              {isReady ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Cancel Ready
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Ready!
                </>
              )}
            </button>

            {/* Start game (host only) */}
            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={!canStart}
                title={!canStart ? `Need all ${players.length} players to be ready` : 'Start the game!'}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all',
                  'border-stone-800 dark:border-stone-400',
                  canStart
                    ? 'bg-amber-400 hover:bg-amber-500 text-stone-900 shadow-[3px_3px_0px_#1C1917] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917]'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed border-stone-300 dark:border-stone-700',
                )}
              >
                <ArrowRight className="w-4 h-4" />
                Start Game
              </button>
            )}
          </div>

          {!isHost && (
            <p className="text-xs text-center text-stone-400 dark:text-stone-500">
              Waiting for the host to start the game...
            </p>
          )}
        </div>

        {/* ── Right: Settings ───────────────────────────── */}
        <div className="bg-white dark:bg-stone-900 border-2 border-stone-800 dark:border-stone-500 rounded-2xl p-4 shadow-[4px_4px_0px_#1C1917] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.1)] h-fit">
          <SettingsPanel
            settings={settings}
            isHost={isHost}
            onChange={updateSettings}
          />
        </div>
      </div>
    </div>
  );
}
