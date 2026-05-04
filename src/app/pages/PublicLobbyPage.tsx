import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Users, 
  Search, 
  RefreshCw, 
  Play, 
  Globe, 
  Hash,
  Loader2,
  Gamepad2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../../services/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { cn } from '../../lib/utils';
import { socketService } from '../../lib/socket';
import { useGameStore } from '../../store/game-store';
import { useAuthStore } from '../../store/auth-store';

interface PublicRoom {
  id: string;
  code: string;
  name: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  maxPlayers: number;
  players: any[];
  selectedWordPack: {
    name: string;
  } | null;
  createdAt: string;
}

function activeRoomPlayers(room: PublicRoom) {
  return room.players.filter((player) => player.role !== 'SPECTATOR');
}

export function PublicLobbyPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const { setCurrentUser, setPlayers, setRoom, resetGame, setIsLeavingGame, setShowGameEnd, setShowReplay } = useGameStore();

  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRooms = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await apiRequest<{ data: PublicRoom[] }>('/api/rooms/public');
      setRooms(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch public rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    resetGame();
    setIsLeavingGame(false);
    setShowGameEnd(false);
    setShowReplay(false);
    fetchRooms();
    const interval = setInterval(() => fetchRooms(true), 10000);
    return () => clearInterval(interval);
  }, [resetGame, setIsLeavingGame, setShowGameEnd, setShowReplay]);

  const handleJoinRoom = (roomCode: string, isSpectator = false) => {
    if (!authUser) {
      navigate(`/join?code=${roomCode}${isSpectator ? '&spectate=true' : ''}`);
      return;
    }

    socketService.connect();
    socketService.emit('room:join', {
      roomCode,
      nickname: authUser.name || authUser.email.split('@')[0],
      avatar: authUser.avatarUrl || '',
      isSpectator
    });

    socketService.on('room:state', (data) => {
      if (data.roomCode === roomCode || data.code === roomCode) {
        if (data.players) {
          const mappedPlayers = data.players.map((player: any) => ({
            id: player.id,
            name: player.nickname,
            avatarColor: player.avatar || '#F59E0B',
            score: player.score,
            status: player.status.toLowerCase(),
            isHost: player.isHost,
            isReady: player.status === 'READY',
            role: player.role?.toLowerCase() || 'guesser'
          }));
          setPlayers(mappedPlayers);
        }

        if (data.player) {
          const joinedPlayer = {
            id: data.player.id,
            name: data.player.nickname,
            avatarColor: data.player.avatar || '#F59E0B',
            score: data.player.score,
            status: data.player.status.toLowerCase(),
            isHost: data.player.isHost,
            isReady: data.player.status === 'READY',
            role: data.player.role?.toLowerCase() || 'guesser'
          };
          setCurrentUser(joinedPlayer);
        }
        setRoom({ code: roomCode, hostId: data.hostPlayerId || data.player?.id || 'unknown' });
        toast.success(`Joined room ${roomCode}! 🎮`);
        navigate(`/lobby/${roomCode}`);
      }
    });

    socketService.on('room:error', (error) => {
      toast.error(error.message || 'Failed to join room');
    });
  };

  const filteredRooms = rooms.filter(room => 
    room.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.name && room.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-3" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
            <Globe className="w-8 h-8 text-amber-500" />
            Public Lobby
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">
            Browse and join active public drawing rooms.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text"
              placeholder="Search by code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-colors"
            />
          </div>
          <button 
            onClick={() => fetchRooms(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border-2 border-stone-800 dark:border-stone-400 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={cn("w-5 h-5 text-stone-600 dark:text-stone-400", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-stone-500 font-medium">Finding active games...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <Card className="border-2 border-dashed border-stone-200 dark:border-stone-800 bg-transparent py-16">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <Gamepad2 className="w-8 h-8 text-stone-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">No public rooms found</h3>
              <p className="text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                {searchQuery ? "Try searching for another room code or name." : "There are currently no active public rooms. Why not create one?"}
              </p>
            </div>
            <button 
              onClick={() => navigate('/join')}
              className="px-6 py-2.5 rounded-xl border-2 border-stone-800 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold shadow-[3px_3px_0px_#1C1917] transition-all"
            >
              Create a Room
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const activePlayers = activeRoomPlayers(room);
            const isFull = activePlayers.length >= room.maxPlayers;

            return (
            <Card
              key={room.id}
              className="border-2 border-stone-800 dark:border-stone-500 shadow-[4px_4px_0px_#1C1917] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1C1917] transition-all overflow-hidden group"
            >
              <CardHeader className="pb-3 bg-stone-50 dark:bg-stone-900/50 border-b-2 border-stone-100 dark:border-stone-800">
                <div className="flex justify-between items-start">
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-bold">
                    WAITING
                  </Badge>
                  <div className="flex items-center gap-1.5 text-stone-400 font-mono text-sm font-bold">
                    <Hash className="w-3.5 h-3.5" />
                    {room.code}
                  </div>
                </div>
                <CardTitle className="text-xl mt-2 truncate">
                  {room.name || `Room ${room.code}`}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                  <Play className="w-3.5 h-3.5" />
                  Pack: <span className="font-bold text-stone-700 dark:text-stone-300">{room.selectedWordPack?.name || 'General'}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300 font-bold">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span>{activePlayers.length} / {room.maxPlayers} Players</span>
                  </div>
                  
                  <div className="flex -space-x-2">
                    {activePlayers.slice(0, 3).map((p, i) => (
                      <div 
                        key={i} 
                        className="w-7 h-7 rounded-full border-2 border-white dark:border-stone-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: p.avatar || '#94a3b8' }}
                      >
                        {p.nickname[0].toUpperCase()}
                      </div>
                    ))}
                    {activePlayers.length > 3 && (
                      <div className="w-7 h-7 rounded-full border-2 border-white dark:border-stone-900 bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-[10px] font-bold text-stone-500">
                        +{activePlayers.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleJoinRoom(room.code)}
                    disabled={isFull}
                    className={cn(
                      "flex-1 py-3 rounded-xl border-2 border-stone-800 dark:border-stone-400 font-bold transition-all flex items-center justify-center gap-2",
                      isFull
                        ? "bg-stone-100 text-stone-400 cursor-not-allowed border-stone-300 dark:bg-stone-800 dark:border-stone-700"
                        : "bg-amber-400 text-stone-900 hover:bg-amber-500 shadow-[3px_3px_0px_#1C1917] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917]"
                    )}
                  >
                    {isFull ? "Room Full" : "Join Room"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={() => handleJoinRoom(room.code, true)}
                    className="px-3 py-3 rounded-xl border-2 border-stone-800 dark:border-stone-400 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all shadow-[2px_2px_0px_#1C1917] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917]"
                    title="Spectate"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
