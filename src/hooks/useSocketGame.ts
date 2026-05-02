import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { socketService } from '../lib/socket';
import { useGameStore } from '../store/game-store';
import { toast } from 'sonner';
import { generateId } from '../lib/utils';
import type { ChatMessage, Stroke, RoundClue, RoundResult, Player } from '../lib/types';

export function useSocketGame(roomCode: string | undefined) {
  const navigate = useNavigate();
  const {
    setCurrentUser,
    setRoom,
    setPlayers,
    setGameStatus,
    setRound,
    addClue,
    addMessage,
    addStroke,
    setStrokes,
    clearStrokes,
    setTimer,
    updatePlayerScore,
    updatePlayerStatus,
    setRoundResult,
    setShowRoundResult,
    setShowGameEnd,
    addEmote,
    setConnectionStatus,
  } = useGameStore();

  useEffect(() => {
    if (!roomCode) return;

    const socket = socketService.connect();

    const handleConnect = () => {
      setConnectionStatus('connected');
      socketService.emit('game:state', { roomCode });
      const currentRoundId = useGameStore.getState().round?.roundId;
      if (currentRoundId) {
         socketService.emit('draw:state', { roundId: currentRoundId });
      }
    };
    
    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    socket.on('game:state', (data: any) => {
      if (data.status) setGameStatus(data.status.toLowerCase());
      if (data.room) {
        setRoom({ code: data.room.code, hostId: data.room.hostPlayerId });
        if (data.room.players) {
            const mapped: Player[] = data.room.players.map((p: any) => ({
                id: p.id,
                name: p.nickname,
                avatarColor: p.avatar || '#F59E0B',
                score: p.score,
                status: p.status.toLowerCase(),
                isHost: p.isHost,
                isReady: p.status === 'READY',
                role: p.role?.toLowerCase() || 'guesser'
            }));
            setPlayers(mapped);
        }
      }
    });

    socket.on('room:deleted', (data: { reason: string }) => {
        toast.error(`Room closed: ${data.reason}`);
        useGameStore.getState().resetGame();
        navigate('/');
    });

    socket.on('player:status', (data: { playerId: string, status: string }) => {
        updatePlayerStatus(data.playerId, data.status.toLowerCase() as any);
        if (data.status === 'DISCONNECTED') {
            const player = useGameStore.getState().players.find(p => p.id === data.playerId);
            if (player) toast.info(`${player.name} disconnected.`);
        }
    });

    socket.on('round:start', (data: any) => {
      setRound({
        roundId: data.roundId,
        roundNumber: data.roundNumber,
        totalRounds: useGameStore.getState().settings.maxRounds,
        currentDrawerId: data.drawerId,
        wordHint: data.hint || '',
        secretWord: data.secretWord || '',
        timeLeft: data.duration,
        phase: 'drawing',
        clues: [],
      });
      clearStrokes();
      setShowRoundResult(false);
      toast.info(`Round ${data.roundNumber} started!`);
    });

    socket.on('round:tick', (data: { remaining: number }) => {
      setTimer(data.remaining);
    });

    socket.on('round:clue', (clue: RoundClue) => {
      addClue(clue);
    });

    socket.on('round:result', (data: RoundResult) => {
      setRoundResult(data);
      setShowRoundResult(true);
    });

    socket.on('game:end', () => {
      setShowGameEnd(true);
    });

    socket.on('draw:stroke', (stroke: any) => {
      addStroke({
        id: stroke.id,
        points: stroke.points,
        color: stroke.color,
        size: stroke.brushSize,
        tool: stroke.tool.toLowerCase(),
        timestamp: new Date(stroke.createdAt).getTime(),
      });
    });

    socket.on('draw:clear', () => {
      clearStrokes();
    });

    socket.on('draw:undo', () => {
      useGameStore.getState().removeLastStroke();
    });

    socket.on('draw:state', (strokes: any[]) => {
      const mapped: Stroke[] = strokes.map(s => ({
        id: s.id,
        points: s.points,
        color: s.color,
        size: s.brushSize,
        tool: s.tool.toLowerCase(),
        timestamp: new Date(s.createdAt).getTime(),
      }));
      setStrokes(mapped);
    });

    socket.on('chat:message', (msg: any) => {
      addMessage({
        id: msg.id || generateId(),
        playerId: msg.playerId || 'system',
        playerName: msg.player?.nickname || 'System',
        content: msg.content,
        type: msg.type.toLowerCase().replace('_', '-'),
        timestamp: new Date(msg.createdAt).getTime(),
      });
    });

    socket.on('guess:correct', (data: { playerId: string }) => {
        updatePlayerStatus(data.playerId, 'guessed');
        if (data.playerId === useGameStore.getState().currentUser?.id) {
            toast.success('You guessed it! 🎉');
        }
    });

    socket.on('guess:close', () => {
        toast('Your guess was close! 👀', { icon: '🔥' });
    });

    socket.on('chat:warning', (data: { content: string }) => {
        toast.warning(data.content);
    });

    socket.on('emote:broadcast', (data: { playerId: string, playerName: string, emote: string, sentAt: string }) => {
        const id = generateId();
        addEmote({
            id,
            playerId: data.playerId,
            playerName: data.playerName,
            emote: data.emote,
            sentAt: new Date(data.sentAt).getTime(),
        });
        setTimeout(() => useGameStore.getState().removeEmote(id), 3000);
    });

    socket.on('leaderboard:update', (data: { leaderboard: any[] }) => {
        const mapped: Player[] = data.leaderboard.map((p: any) => ({
            id: p.id,
            name: p.nickname,
            avatarColor: p.avatar || '#F59E0B',
            score: p.score,
            status: p.status.toLowerCase(),
            isHost: p.isHost,
            isReady: p.status === 'READY',
            role: p.role?.toLowerCase() || 'guesser'
        }));
        setPlayers(mapped);
    });

    socket.on('score:update', (data: any) => {
        if (data.leaderboard) {
            const mapped: Player[] = data.leaderboard.map((p: any) => ({
                id: p.id,
                name: p.nickname,
                avatarColor: p.avatar || '#F59E0B',
                score: p.score,
                status: p.status.toLowerCase(),
                isHost: p.isHost,
                isReady: p.status === 'READY',
                role: p.role?.toLowerCase() || 'guesser'
            }));
            setPlayers(mapped);
        } else if (data.playerId && typeof data.score === 'number') {
            updatePlayerScore(data.playerId, data.score);
        }
    });

    socket.on('game:error', (err: { message: string, code?: string }) => {
      toast.error(err.message);
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('game:state');
      socket.off('room:deleted');
      socket.off('player:status');
      socket.off('round:start');
      socket.off('round:tick');
      socket.off('round:clue');
      socket.off('round:result');
      socket.off('game:end');
      socket.off('draw:stroke');
      socket.off('draw:clear');
      socket.off('draw:undo');
      socket.off('draw:state');
      socket.off('chat:message');
      socket.off('guess:correct');
      socket.off('guess:close');
      socket.off('chat:warning');
      socket.off('emote:broadcast');
      socket.off('leaderboard:update');
      socket.off('score:update');
      socket.off('game:error');
    };
  }, [roomCode, navigate, setConnectionStatus, setGameStatus, setRoom, setPlayers, updatePlayerStatus, setRound, clearStrokes, setShowRoundResult, setTimer, addClue, setRoundResult, setShowGameEnd, addStroke, setStrokes, addMessage, addEmote, updatePlayerScore]);
}
