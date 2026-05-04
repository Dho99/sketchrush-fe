import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { socketService } from '../lib/socket';
import { useGameStore } from '../store/game-store';
import { toast } from 'sonner';
import { generateId } from '../lib/utils';
import type { ChatMessage, Stroke, RoundClue, RoundResult, Player, PlayerRole, PlayerStatus } from '../lib/types';

function uniquePlayersById(players: Player[]) {
  return Array.from(new Map(players.map((player) => [player.id, player])).values());
}

function mapSocketPlayer(p: any, existing?: Player): Player {
  const status = (p.status || existing?.status || 'waiting').toLowerCase() as PlayerStatus;
  return {
    id: p.playerId || p.id,
    name: p.name || p.nickname,
    avatarColor: p.avatar || existing?.avatarColor || '#F59E0B',
    score: typeof p.score === 'number' ? p.score : existing?.score || 0,
    status,
    isHost: p.isHost ?? existing?.isHost ?? false,
    isReady: status === 'ready',
    role: (p.role || existing?.role || 'guesser').toLowerCase() as PlayerRole,
  };
}

export function useSocketGame(roomCode: string | undefined) {
  const navigate = useNavigate();
  const hydrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
    setShowReplay,
    setIsLeavingGame,
    addEmote,
    setConnectionStatus,
    setIsStartingGame,
    setStartGameMessage,
    setWordOptions,
    setIsWordSelectionOpen,
    setIsSelectingWord,
    resetGame,
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

    // Initial hydration if already connected
    if (socket.connected) {
        handleConnect();
    }

    // Hydration timeout: if no game state in 5s, redirect to lobby
    hydrationTimeoutRef.current = setTimeout(() => {
        const state = useGameStore.getState();
        if (state.isLeavingGame) return;
        if (!state.round && state.gameStatus !== 'playing') {
            toast.error('Game session is no longer active. Returning to room lobby...');
            navigate(`/lobby/${roomCode}`, { replace: true });
        }
    }, 5000);

    // Lifecycle
    socket.on('game:starting', (data: { message: string }) => {
        setIsStartingGame(true);
        setStartGameMessage(data.message || 'Preparing game...');
    });

    socket.on('round:preparing', (data: { message: string }) => {
        setIsStartingGame(true);
        setStartGameMessage(data.message || 'Preparing round...');
    });

    socket.on('game:state', (data: any) => {
      if (hydrationTimeoutRef.current) {
          clearTimeout(hydrationTimeoutRef.current);
          hydrationTimeoutRef.current = null;
      }

      if (useGameStore.getState().isLeavingGame) {
          return;
      }

      if (!data) {
          toast.error('Room no longer exists.');
          navigate('/public-lobby', { replace: true });
          return;
      }

      if (data.status) setGameStatus(data.status.toLowerCase());
      if (data.room) {
        setRoom({ code: data.room.code, hostId: data.room.hostPlayerId });
        if (data.room.players) {
            const existingById = new Map(useGameStore.getState().players.map((player) => [player.id, player]));
            const mapped = data.room.players.map((p: any) => mapSocketPlayer(p, existingById.get(p.id)));
            setPlayers(uniquePlayersById(mapped));
        }
      }
      
      // Hydrate round if active
      if (data.runtime?.currentRound) {
          const r = data.runtime.currentRound;
          const safeDuration = typeof r.duration === 'number' ? r.duration : 60;
          const safeRemaining = typeof r.remainingTime === 'number' ? r.remainingTime : safeDuration;

          setRound({
            roundId: r.roundId,
            roundNumber: r.roundNumber,
            totalRounds: data.runtime.maxRounds || useGameStore.getState().settings.maxRounds,
            currentDrawerId: r.drawerId,
            wordHint: r.hint || '',
            secretWord: r.secretWord || '',
            duration: safeDuration,
            timeLeft: safeRemaining,
            phase: 'drawing',
            clues: [],
            nextDrawerId: data.runtime.currentRound.nextDrawerId,
            nextDrawerName: data.runtime.currentRound.nextDrawerName,
          });
      } else if (data.runtime?.status === 'WAITING' || data.status === 'WAITING') {
          navigate(`/lobby/${roomCode}`, { replace: true });
      }
    });

    socket.on('game:ended', (data: { roomCode: string, message: string, leaderboard?: any[], redirectTo: string }) => {
        if (useGameStore.getState().isLeavingGame) return;
        toast.info(data.message || 'Game ended.');
        if (data.leaderboard) {
            const mapped = data.leaderboard.map((p: any) => mapSocketPlayer(p));
            setPlayers(uniquePlayersById(mapped));
        }
        setGameStatus('lobby');
        setIsSelectingWord(false);
        setIsWordSelectionOpen(false);
        setWordOptions(null, []);
        setTimer(0);
        setShowReplay(false);
        setRoundResult(null);
        setRound(null);
        setShowRoundResult(false);
        setShowGameEnd(false);
        navigate(data.redirectTo || `/lobby/${roomCode}`, { replace: true });
    });

    socket.on('room:deleted', (data: { reason: string }) => {
        toast.error(`Room closed: ${data.reason}`);
        resetGame();
        navigate('/public-lobby', { replace: true });
    });

    socket.on('player:status', (data: { playerId: string, status: string }) => {
        updatePlayerStatus(data.playerId, data.status.toLowerCase() as any);
        if (data.status === 'DISCONNECTED') {
            const player = useGameStore.getState().players.find(p => p.id === data.playerId);
            if (player) toast.info(`${player.name} disconnected.`);
        }
    });

    socket.on('round:start', (data: any) => {
      if (useGameStore.getState().isLeavingGame) return;
      if (import.meta.env.DEV) {
          console.log("TRACE: frontend:round:start", {
              role: data.role,
              drawerId: data.drawerId,
              secretWord: data.secretWord ? "PRESENT" : "MISSING",
              currentPlayerId: useGameStore.getState().currentUser?.id
          });
      }
      if (hydrationTimeoutRef.current) {
          clearTimeout(hydrationTimeoutRef.current);
          hydrationTimeoutRef.current = null;
      }

      setIsStartingGame(false);
      setIsSelectingWord(false);
      setIsWordSelectionOpen(false);
      setWordOptions(null, []);
      
      const safeDuration = typeof data.duration === 'number' ? data.duration : 60;
      const safeTime = typeof data.remainingTime === 'number' ? data.remainingTime : safeDuration;

      setRound({
        roundId: data.roundId,
        roundNumber: data.roundNumber,
        totalRounds: data.maxRounds || useGameStore.getState().settings.maxRounds,
        currentDrawerId: data.drawerId,
        wordHint: data.hint || '',
        secretWord: data.secretWord || '',
        duration: safeDuration,
        timeLeft: safeTime,
        phase: 'drawing',
        clues: [],
        nextDrawerId: null,
        nextDrawerName: null,
      });
      setRoundResult(null);
      setShowReplay(false);
      const currentUser = useGameStore.getState().currentUser;
      if (currentUser && data.role) {
          setCurrentUser({ ...currentUser, role: data.role.toLowerCase() });
      }
      clearStrokes();
      setShowRoundResult(false);
      toast.info(`Round ${data.roundNumber} started!`);
    });

    socket.on('round:nextDrawerAssigned', (data: { roundId?: string, nextDrawerId: string, nextDrawerName: string, canChooseNextWordPlayerId?: string, message?: string }) => {
      const currentRound = useGameStore.getState().round;
      if (currentRound) {
        setRound({
          ...currentRound,
          nextDrawerId: data.nextDrawerId,
          nextDrawerName: data.nextDrawerName,
        });
      }
      const currentResult = useGameStore.getState().roundResult;
      if (currentResult && (!data.roundId || currentResult.roundId === data.roundId)) {
        setRoundResult({
          ...currentResult,
          nextDrawerId: data.nextDrawerId,
          nextDrawerName: data.nextDrawerName,
          canChooseNextWordPlayerId: data.canChooseNextWordPlayerId || data.nextDrawerId,
        });
      }
      if (data.message) toast.info(data.message);
    });

    socket.on('round:wordOptions', (data: { roundId: string, options: any[] }) => {
      const state = useGameStore.getState();
      if (state.gameStatus === 'game-end' || state.roundResult?.isLastRound) {
        setIsSelectingWord(false);
        setIsWordSelectionOpen(false);
        setWordOptions(null, []);
        return;
      }
      setIsSelectingWord(false);
      setWordOptions(data.roundId, data.options || []);
      setIsWordSelectionOpen(true);
    });

    socket.on('round:tick', (data: { remainingTime: number }) => {
      if (typeof data.remainingTime === 'number' && Number.isFinite(data.remainingTime)) {
          setTimer(data.remainingTime);
      }
    });

    socket.on('round:clue', (clue: RoundClue) => {
      addClue(clue);
    });

    socket.on('round:result', (data: RoundResult) => {
      if (data.isLastRound) {
        setIsSelectingWord(false);
        setIsWordSelectionOpen(false);
        setWordOptions(null, []);
      }
      setRoundResult(data);
      setShowRoundResult(true);
    });

    socket.on('game:end', () => {
      setShowGameEnd(false);
    });

    socket.on('room:left', (data: { roomCode: string, redirectTo: string, message: string }) => {
        if (data.roomCode && data.roomCode !== roomCode) return;
        toast.info(data.message || 'You left the room.');
        resetGame();
        setIsLeavingGame(false);
        navigate(data.redirectTo || '/public-lobby', { replace: true });
    });

    // Drawing
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

    // Chat / Guess
    socket.on('chat:message', (msg: any) => {
      addMessage({
        id: msg.id || generateId(),
        playerId: msg.playerId || 'system',
        playerName: msg.playerName || msg.player?.nickname || 'System',
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

    socket.on('guess:wrong', () => {
        toast.error('Not quite. Keep guessing!');
    });

    socket.on('guess:already_correct', (data: { message: string }) => {
        toast.info(data.message || 'You already guessed correctly.');
    });

    socket.on('chat:warning', (data: { content: string }) => {
        toast.warning(data.content);
    });

    // Emotes
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

    // Score
    socket.on('leaderboard:update', (data: { players?: any[], leaderboard?: any[] }) => {
        const incoming = data.players || data.leaderboard || [];
        const existingById = new Map(useGameStore.getState().players.map((player) => [player.id, player]));
        const mapped = incoming.map((p: any) => mapSocketPlayer(p, existingById.get(p.playerId || p.id)));
        setPlayers(uniquePlayersById(mapped));
    });

    socket.on('score:update', (data: any) => {
        if (data.leaderboard) {
            const existingById = new Map(useGameStore.getState().players.map((player) => [player.id, player]));
            const mapped = data.leaderboard.map((p: any) => mapSocketPlayer(p, existingById.get(p.playerId || p.id)));
            setPlayers(uniquePlayersById(mapped));
        } else if (data.playerId && typeof data.score === 'number') {
            updatePlayerScore(data.playerId, data.score);
        }
    });

    // Errors
    socket.on('game:error', (err: { message: string, code?: string }) => {
      setIsStartingGame(false);
      setIsSelectingWord(false);
      toast.error(err.message);
      
      if (err.code === 'PLAYER_SESSION_EXPIRED') {
          resetGame();
          setIsLeavingGame(false);
          navigate('/public-lobby', { replace: true });
      }
    });

    return () => {
      if (hydrationTimeoutRef.current) clearTimeout(hydrationTimeoutRef.current);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('game:starting');
      socket.off('round:preparing');
      socket.off('game:state');
      socket.off('game:ended');
      socket.off('room:deleted');
      socket.off('player:status');
      socket.off('round:start');
      socket.off('round:nextDrawerAssigned');
      socket.off('round:wordOptions');
      socket.off('round:tick');
      socket.off('round:clue');
      socket.off('round:result');
      socket.off('game:end');
      socket.off('room:left');
      socket.off('draw:stroke');
      socket.off('draw:clear');
      socket.off('draw:undo');
      socket.off('draw:state');
      socket.off('chat:message');
      socket.off('guess:correct');
      socket.off('guess:close');
      socket.off('guess:wrong');
      socket.off('guess:already_correct');
      socket.off('chat:warning');
      socket.off('emote:broadcast');
      socket.off('leaderboard:update');
      socket.off('score:update');
      socket.off('game:error');
    };
  }, [roomCode, navigate, setConnectionStatus, setGameStatus, setRoom, setPlayers, setCurrentUser, updatePlayerStatus, setRound, clearStrokes, setShowRoundResult, setTimer, addClue, setRoundResult, setShowGameEnd, setShowReplay, addStroke, setStrokes, addMessage, addEmote, updatePlayerScore, setIsStartingGame, setStartGameMessage, setWordOptions, setIsWordSelectionOpen, setIsSelectingWord, resetGame, setIsLeavingGame]);
}
