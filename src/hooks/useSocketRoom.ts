import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { socketService } from '../lib/socket';
import { audioManager } from '../lib/audio';
import { useGameStore } from '../store/game-store';
import { useAudioStore } from '../store/audio-store';
import { toast } from 'sonner';
import type { Player } from '../lib/types';

export function useSocketRoom(roomCode: string | undefined) {
  const navigate = useNavigate();
  const previousPlayerCountRef = useRef(0);
  const { 
    setPlayers, 
    setRoom, 
    setSettings,
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
          hostId: data.hostPlayerId || 'unknown',
          visibility: data.visibility,
          isPrivate: data.isPrivate ?? data.visibility === 'PRIVATE',
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
          if (
            previousPlayerCountRef.current > 0 &&
            mappedPlayers.length > previousPlayerCountRef.current
          ) {
            audioManager.playPlayerJoin();
          }
          previousPlayerCountRef.current = mappedPlayers.length;
        }

        if (data.settings) {
          setSettings({
            ...useGameStore.getState().settings,
            ...data.settings,
            wordPack: data.settings.selectedWordPackId || data.settings.wordPack || 'general',
            selectedWordPackId: data.settings.selectedWordPackId || data.settings.wordPack || 'general',
            wordPackName: data.settings.wordPackName || data.selectedWordPack?.name || 'General',
            customWords: Array.isArray(data.settings.customWords) ? data.settings.customWords : [],
          });
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
      if (
        previousPlayerCountRef.current > 0 &&
        mappedPlayers.length > previousPlayerCountRef.current
      ) {
        audioManager.playPlayerJoin();
      }
      previousPlayerCountRef.current = mappedPlayers.length;
    });

    socketService.on('player:status', (data: { playerId: string, status: string }) => {
      updatePlayerStatus(data.playerId, data.status.toLowerCase() as any);
    });

    socketService.on('game:state', (data: any) => {
      if (data && data.runtime?.status) {
        setGameStatus(data.runtime.status.toLowerCase() as any);
        if (data.runtime.status === 'PLAYING') {
          useGameStore.getState().setIsStartingGame(false);
          navigate(`/game/${roomCode}`);
        } else if (data.runtime.status === 'STARTING') {
          useGameStore.getState().setIsStartingGame(true);
          useGameStore.getState().setStartGameMessage('Preparing your game...');
        }
      }
    });

    socketService.on('game:starting', (data: { message: string }) => {
      useGameStore.getState().setIsStartingGame(true);
      useGameStore.getState().setStartGameMessage(data.message || 'Preparing game...');
    });

    socketService.on('round:preparing', (data: { message: string }) => {
      useGameStore.getState().setIsStartingGame(true);
      useGameStore.getState().setStartGameMessage(data.message || 'Preparing round...');
    });

    socketService.on('round:start', (data: any) => {
      audioManager.playRoundStart();
      useGameStore.getState().setIsStartingGame(false);
      navigate(`/game/${roomCode}`);
    });

    socketService.on('room:deleted', (data: { reason: string }) => {
        toast.error(`Room closed: ${data.reason}`);
        useAudioStore.getState().stopMusic();
        useGameStore.getState().resetGame();
        navigate('/public-lobby');
    });

    socketService.on('room:left', (data: { redirectTo: string, message: string }) => {
        toast.info(data.message || 'You left the room.');
        useAudioStore.getState().stopMusic();
        useGameStore.getState().resetGame();
        navigate(data.redirectTo || '/public-lobby', { replace: true });
    });

    socketService.on('game:ended', (data: { message: string, leaderboard?: any[], redirectTo: string }) => {
        toast.info(data.message || 'Game ended.');
        audioManager.playGameEnd();
        if (data.leaderboard) {
            const mappedPlayers: Player[] = data.leaderboard.map((p: any) => ({
                id: p.playerId || p.id,
                name: p.name || p.nickname,
                avatarColor: p.avatar || '#F59E0B',
                score: p.score,
                status: p.status.toLowerCase(),
                isHost: p.isHost,
                isReady: p.status === 'READY',
                role: p.role?.toLowerCase() || 'guesser'
            }));
            setPlayers(mappedPlayers);
        }
        setGameStatus('lobby');
        useGameStore.getState().setShowGameEnd(false);
        socketService.emit('room:state', { roomCode });
    });

    socketService.on('room:error', (error: any) => {
      toast.error(error.message || 'Room error occurred');
      if (error.message === 'Room not found') {
        navigate('/join');
      }
    });

    socketService.on('game:error', (error: any) => {
      useGameStore.getState().setIsStartingGame(false);
      toast.error(error.message || 'Game error occurred');
    });

    return () => {
      socketService.off('room:state');
      socketService.off('player:list');
      socketService.off('player:status');
      socketService.off('game:state');
      socketService.off('game:starting');
      socketService.off('round:preparing');
      socketService.off('round:start');
      socketService.off('room:deleted');
      socketService.off('room:left');
      socketService.off('game:ended');
      socketService.off('room:error');
      socketService.off('game:error');
    };
  }, [roomCode, navigate, setPlayers, setRoom, setSettings, updatePlayerStatus, setGameStatus]);

  const toggleReady = (isReady: boolean) => {
    if (!roomCode) return;
    const currentUser = useGameStore.getState().currentUser;
    if (currentUser && currentUser.role !== 'spectator') {
        socketService.emit(isReady ? 'player:ready' : 'player:unready', { 
            roomCode,
            playerId: currentUser.id 
        });
    }
  };

  const leaveRoom = () => {
    if (!roomCode) return;
    socketService.emit('room:leave', { roomCode });
  };

  return { toggleReady, leaveRoom };
}
