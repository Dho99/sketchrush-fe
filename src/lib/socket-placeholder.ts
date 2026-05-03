/**
 * Socket.IO Integration Placeholder
 *
 * This file contains mock functions that simulate socket events.
 * When the Express + Socket.IO backend is ready, replace each
 * function body with: socket.emit('<event-name>', payload)
 *
 * Incoming socket events to handle on the client side:
 *   - room:created    → update store with room code
 *   - room:joined     → update store with room info + players
 *   - room:player_list → update player list
 *   - player:ready    → update player ready state
 *   - game:start      → update game status to 'playing', receive round state
 *   - round:clue      → add clue to store
 *   - draw:stroke     → add stroke to store
 *   - draw:clear      → clear strokes
 *   - chat:message    → add message to store
 *   - guess:correct   → show correct-guess system message
 *   - guess:close     → show close-guess system message
 *   - score:update    → update player scores
 *   - round:end       → show round result modal, update scores
 *   - game:end        → show game end modal, final leaderboard
 */

export interface CreateRoomPayload {
  nickname: string;
  avatarColor: string;
  settings: {
    maxRounds: number;
    roundDuration: number;
    wordPack: string;
    enableReplay: boolean;
    enableSmartTolerance: boolean;
    enableHints: boolean;
  };
}

export interface JoinRoomPayload {
  roomCode: string;
  nickname: string;
  avatarColor: string;
}

export interface StrokePayload {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
  tool: 'pencil' | 'eraser';
  timestamp: number;
}

// ─── Room Events ───────────────────────────────────────────────────────────────

/**
 * TODO: Replace with → socket.emit('room:create', payload)
 * Server responds with 'room:created' event containing { roomCode, room }
 */
export const createRoom = async (payload: CreateRoomPayload): Promise<{ roomCode: string }> => {
  console.log('[Socket Placeholder] room:create', payload);
  await new Promise(resolve => setTimeout(resolve, 800));
  const code = 'RUSH' + Math.floor(Math.random() * 90 + 10);
  return { roomCode: code };
};

/**
 * TODO: Replace with → socket.emit('room:join', payload)
 * Server responds with 'room:joined' event or 'room:error' on failure
 */
export const joinRoom = async (payload: JoinRoomPayload): Promise<{ success: boolean; error?: string }> => {
  console.log('[Socket Placeholder] room:join', payload);
  await new Promise(resolve => setTimeout(resolve, 600));
  if (!payload.roomCode || payload.roomCode.length < 4) {
    return { success: false, error: 'Invalid room code. Please check and try again.' };
  }
  if (!payload.nickname || payload.nickname.trim().length < 2) {
    return { success: false, error: 'Nickname must be at least 2 characters.' };
  }
  return { success: true };
};

/**
 * TODO: Replace with → socket.emit('room:leave')
 */
export const leaveRoom = (): void => {
  console.log('[Socket Placeholder] room:leave');
};

// ─── Player Events ─────────────────────────────────────────────────────────────

/**
 * TODO: Replace with → socket.emit('player:ready', { isReady })
 */
export const setReady = (isReady: boolean): void => {
  console.log('[Socket Placeholder] player:ready', { isReady });
};

// ─── Game Events ───────────────────────────────────────────────────────────────

/**
 * TODO: Replace with → socket.emit('game:start')
 * Only valid if current user is host and all players are ready
 */
export const startGame = (): void => {
  console.log('[Socket Placeholder] game:start');
};

/**
 * TODO: Replace with → socket.emit('round:next')
 */
export const requestNextRound = (): void => {
  console.log('[Socket Placeholder] round:next');
};

// ─── Drawing Events ────────────────────────────────────────────────────────────

/**
 * TODO: Replace with → socket.emit('draw:stroke', stroke)
 * Note: strokes are sent as coordinate arrays, NOT as images.
 * The server broadcasts this to all clients in the room except the sender.
 */
export const sendStroke = (stroke: StrokePayload): void => {
  console.log('[Socket Placeholder] draw:stroke', stroke.id, `(${stroke.points.length} points)`);
};

/**
 * TODO: Replace with → socket.emit('draw:clear')
 */
export const clearCanvas = (): void => {
  console.log('[Socket Placeholder] draw:clear');
};

/**
 * TODO: Replace with → socket.emit('draw:undo')
 */
export const undoStroke = (): void => {
  console.log('[Socket Placeholder] draw:undo');
};

// ─── Chat & Guess Events ───────────────────────────────────────────────────────

/**
 * TODO: Replace with → socket.emit('chat:send', { message })
 */
export const sendChatMessage = (message: string): void => {
  console.log('[Socket Placeholder] chat:send', message);
};

/**
 * TODO: Replace with → socket.emit('guess:submit', { guess })
 * Server responds with 'guess:correct' or 'guess:close' based on answer comparison.
 * If correct, server emits 'score:update' to all players.
 * NOTE: The correct answer is NEVER sent to non-drawer clients for security.
 */
export const submitGuess = (guess: string): void => {
  console.log('[Socket Placeholder] guess:submit', guess);
};

// ─── Replay Events ─────────────────────────────────────────────────────────────

/**
 * TODO: Replace with → socket.emit('replay:request', { roomCode, roundNumber })
 * Server responds with 'replay:data' containing the stroke history
 */
export const requestReplay = (roomCode: string, roundNumber?: number): void => {
  console.log('[Socket Placeholder] replay:request', { roomCode, roundNumber });
};
