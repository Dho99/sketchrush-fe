import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { createRoom, joinRoom } from '../../lib/socket-placeholder';
import { useGameStore } from '../../store/game-store';
import { AVATAR_COLORS } from '../../lib/mock-data';
import { cn } from '../../lib/utils';

type Mode = 'create' | 'join';

export function JoinPage() {
  const navigate = useNavigate();
  const { setCurrentUser, setRoom, setPlayers, updateSettings } = useGameStore();

  const [mode, setMode] = useState<Mode>('create');
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const nicknameValid = nickname.trim().length >= 2;
  const roomCodeValid = roomCode.trim().length >= 4;
  const canCreate = nicknameValid && !isLoading;
  const canJoin = nicknameValid && roomCodeValid && !isLoading;

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    setIsLoading(true);
    try {
      // TODO: Replace with socket.emit('room:create', payload) and listen for 'room:created'
      const result = await createRoom({
        nickname: nickname.trim(),
        avatarColor,
        settings: {
          maxRounds: 5,
          roundDuration: 90,
          wordPack: 'general',
          enableReplay: true,
          enableSmartTolerance: true,
          enableHints: true,
        },
      });

      const user = {
        id: 'me',
        name: nickname.trim(),
        avatarColor,
        score: 0,
        status: 'waiting' as const,
        isHost: true,
        isReady: false,
      };

      setCurrentUser(user);
      setRoom({ code: result.roomCode, hostId: 'me' });
      setPlayers([user]);
      toast.success(`Room ${result.roomCode} created! 🎉`);
      navigate(`/lobby/${result.roomCode}`);
    } catch {
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canJoin) return;
    setIsLoading(true);
    try {
      // TODO: Replace with socket.emit('room:join', payload) and listen for 'room:joined' or 'room:error'
      const result = await joinRoom({
        roomCode: roomCode.trim().toUpperCase(),
        nickname: nickname.trim(),
        avatarColor,
      });

      if (!result.success) {
        toast.error(result.error ?? 'Failed to join room.');
        return;
      }

      const user = {
        id: 'me',
        name: nickname.trim(),
        avatarColor,
        score: 0,
        status: 'waiting' as const,
        isHost: false,
        isReady: false,
      };

      setCurrentUser(user);
      setRoom({ code: roomCode.trim().toUpperCase(), hostId: 'unknown' });
      setPlayers([user]);
      toast.success(`Joined room ${roomCode.toUpperCase()}! 👋`);
      navigate(`/lobby/${roomCode.trim().toUpperCase()}`);
    } catch {
      toast.error('Failed to join room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1
            className="text-4xl text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fredoka One', sans-serif" }}
          >
            Let's Play! 🎮
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            Pick a nickname, choose your color, and jump in.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-stone-900 border-2 border-stone-800 dark:border-stone-500 rounded-2xl p-6 shadow-[5px_5px_0px_#1C1917] dark:shadow-[5px_5px_0px_rgba(255,255,255,0.1)] space-y-5">
          {/* Mode tabs */}
          <div className="flex rounded-xl border-2 border-stone-200 dark:border-stone-700 overflow-hidden p-1 gap-1">
            {(['create', 'join'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-bold transition-colors',
                  mode === m
                    ? 'bg-amber-400 text-stone-900 border-2 border-stone-800 dark:border-stone-600 shadow-[2px_2px_0px_#1C1917] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.1)]'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800',
                )}
              >
                {m === 'create' ? '✏️ Create Room' : '🚪 Join Room'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={mode === 'create' ? handleCreateRoom : handleJoinRoom} className="space-y-4">
            {/* Nickname */}
            <div className="space-y-1.5">
              <label htmlFor="nickname" className="text-sm font-bold text-stone-800 dark:text-stone-200">
                Your Nickname
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Raka, Sinta, GambarMaster…"
                aria-describedby="nickname-hint"
                maxLength={20}
                autoFocus
                className={cn(
                  'w-full px-3 py-2.5 rounded-xl border-2 bg-stone-50 dark:bg-stone-800',
                  'text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500',
                  'focus:outline-none transition-colors',
                  nickname && !nicknameValid
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-stone-300 dark:border-stone-600 focus:border-amber-400 dark:focus:border-amber-500',
                )}
              />
              <p id="nickname-hint" className="text-xs text-stone-400 dark:text-stone-500">
                {nickname.length > 0 && !nicknameValid
                  ? '⚠️ Nickname must be at least 2 characters'
                  : `${20 - nickname.length} characters remaining`}
              </p>
            </div>

            {/* Room code (join mode only) */}
            {mode === 'join' && (
              <div className="space-y-1.5">
                <label htmlFor="roomCode" className="text-sm font-bold text-stone-800 dark:text-stone-200">
                  Room Code
                </label>
                <input
                  id="roomCode"
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HANEP7"
                  maxLength={10}
                  className={cn(
                    'w-full px-3 py-2.5 rounded-xl border-2 bg-stone-50 dark:bg-stone-800',
                    'text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 tracking-widest',
                    'focus:outline-none transition-colors',
                    'border-stone-300 dark:border-stone-600 focus:border-amber-400 dark:focus:border-amber-500',
                  )}
                  style={{ fontFamily: "'Fredoka One', sans-serif" }}
                />
                <p className="text-xs text-stone-400 dark:text-stone-500">
                  Ask the host for the room code
                </p>
              </div>
            )}

            {/* Avatar color */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-stone-800 dark:text-stone-200">
                Pick Your Color
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    aria-label={`Select color ${c}`}
                    aria-pressed={avatarColor === c}
                    className={cn(
                      'w-9 h-9 rounded-xl border-2 transition-all',
                      avatarColor === c
                        ? 'border-stone-900 dark:border-stone-200 scale-110 shadow-[2px_2px_0px_#1C1917] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.2)]'
                        : 'border-stone-300 dark:border-stone-600 hover:scale-105',
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            {nickname && (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800">
                <PlayerAvatar name={nickname} color={avatarColor} size="md" />
                <div>
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                    {nickname || '...'}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {mode === 'create' ? 'Host 👑' : 'Player'}
                  </p>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={mode === 'create' ? !canCreate : !canJoin}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-stone-800 dark:border-stone-400',
                'bg-amber-400 hover:bg-amber-500 text-stone-900',
                'shadow-[3px_3px_0px_#1C1917] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.1)]',
                'active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0',
                'transition-all font-bold',
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'create' ? 'Creating room...' : 'Joining room...'}
                </>
              ) : (
                <>
                  {mode === 'create' ? '✏️ Create Room' : '🚪 Join Room'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footnote */}
        <p className="text-center text-xs text-stone-400 dark:text-stone-500">
          No account needed. Just pick a nickname and play! 🎨
        </p>
      </div>
    </div>
  );
}
