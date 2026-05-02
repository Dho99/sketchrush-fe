import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { socketService } from '../lib/socket';
import { useGameStore } from '../store/game-store';
import { toast } from 'sonner';
import type { Player } from '../lib/types';

export function useSocketRoom(roomCode: string | undefined) {
  const navigate = useNavigate();
  const { 
    setPlayers, 
    setRoom, 
    updatePlayerStatus,
    setGameStatus,
  } = useGameStore();

  useEffect(() => {
    if (!roomCode) return;

    socketService.connect();

    // Request initial state if not present
    socketService.emit('room:state', { roomCode });

    socketService.on('room:state', (data: any) => {
      if (data) {
        setRoom({ 
          code: data.code || data.roomCode, 
          hostId: data.hostPlayerId || 'unknown' 
        });
        
        if (data.players) {
          const mappedPlayers: Player[] = data.players.map((p: any) => ({
            id: p.id,
            name: p.nickname,
            avatarColor: p.avatar || '#F59E0B',
            score: p.score,
            status: p.status.toLowerCase(),
            isHost: p.isHost,
            isReady: p.status === 'READY',
            role: p.role?.toLowerCase() || 'guesser'
          }));
          setPlayers(mappedPlayers);
        }
      }
    });

    socketService.on('player:list', (players: any[]) => {
      const mappedPlayers: Player[] = players.map((p: any) => ({
        id: p.id,
        name: p.nickname,
        avatarColor: p.avatar || '#F59E0B',
        score: p.score,
        status: p.status.toLowerCase(),
        isHost: p.isHost,
        isReady: p.status === 'READY',
        role: p.role?.toLowerCase() || 'guesser'
      }));
      setPlayers(mappedPlayers);
    });

    socketService.on('player:status', (data: { playerId: string, status: string }) => {
      updatePlayerStatus(data.playerId, data.status.toLowerCase() as any);
    });

    socketService.on('game:state', (data: any) => {
      if (data && data.status) {
        setGameStatus(data.status.toLowerCase() as any);
        if (data.status === 'PLAYING') {
          navigate(`/game/${roomCode}`);
        }
      }
    });

    socketService.on('room:deleted', (data: { reason: string }) => {
        toast.error(`Room closed: ${data.reason}`);
        useGameStore.getState().resetGame();
        navigate('/');
    });

    socketService.on('room:error', (error: any) => {
      toast.error(error.message || 'Room error occurred');
      if (error.message === 'Room not found') {
        navigate('/join');
      }
    });

    return () => {
      socketService.off('room:state');
      socketService.off('player:list');
      socketService.off('player:status');
      socketService.off('game:state');
      socketService.off('room:deleted');
      socketService.off('room:error');
    };
  }, [roomCode, navigate, setPlayers, setRoom, updatePlayerStatus, setGameStatus]);

  const toggleReady = (isReady: boolean) => {
    if (!roomCode) return;
    const currentUser = useGameStore.getState().currentUser;
    if (currentUser) {
        socketService.emit(isReady ? 'player:ready' : 'player:unready', { 
            roomCode,
            playerId: currentUser.id 
        });
    }
  };

  const leaveRoom = () => {
    if (!roomCode) return;
    socketService.emit('room:leave', { roomCode });
    navigate('/join');
  };

  return { toggleReady, leaveRoom };
}
