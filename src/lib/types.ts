// ─── Player & Room ────────────────────────────────────────────────────────────

export type PlayerRole = 'host' | 'drawer' | 'guesser' | 'spectator';
export type PlayerStatus = 'drawing' | 'guessed' | 'waiting' | 'disconnected';
export type GameStatus = 'lobby' | 'playing' | 'round-end' | 'game-end';
export type DrawingTool = 'pencil' | 'eraser' | 'clear' | 'undo';
export type MessageType = 'normal' | 'system' | 'correct-guess' | 'close-guess' | 'warning';
export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';
export type RoundPhase = 'choosing-word' | 'drawing' | 'round-end';

export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  score: number;
  status: PlayerStatus;
  isHost: boolean;
  isReady: boolean;
  role: PlayerRole;
}

export interface Room {
  code: string;
  hostId: string;
}

// ─── Game Settings ─────────────────────────────────────────────────────────────

export interface GameSettings {
  maxRounds: number;
  roundDuration: number;
  wordPack: string;
  enableReplay: boolean;
  enableSmartTolerance: boolean;
  enableHints: boolean;
  enableAiClue: boolean;
  clueTriggerSeconds: number;
  maxCluesPerRound: number;
}

// ─── Round State ───────────────────────────────────────────────────────────────

export interface RoundClue {
  clue: string;
  index: number;
  total: number;
}

export interface RoundState {
  roundId: string;
  roundNumber: number;
  totalRounds: number;
  currentDrawerId: string;
  wordHint: string;
  secretWord: string;
  timeLeft: number;
  phase: RoundPhase;
  clues: RoundClue[];
}

// ─── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  type: MessageType;
  timestamp: number;
}

// ─── Drawing ───────────────────────────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  size: number;
  tool: DrawingTool;
  timestamp: number;
}

// ─── Word Packs ────────────────────────────────────────────────────────────────

export interface WordPack {
  id: string;
  name: string;
  words: string[];
  isCustom?: boolean;
  emoji: string;
  description?: string;
}

// ─── Round Result ──────────────────────────────────────────────────────────────

export interface RoundResult {
  correctWord: string;
  correctGuessers: { playerId: string; playerName: string; pointsGained: number; guessTime: number }[];
  drawerBonus: number;
  drawerId: string;
}

// ─── Global Game State ─────────────────────────────────────────────────────────

export interface GameState {
  currentUser: Player | null;
  room: Room | null;
  players: Player[];
  gameStatus: GameStatus;
  round: RoundState | null;
  messages: ChatMessage[];
  strokes: Stroke[];
  settings: GameSettings;
  showRoundResult: boolean;
  showGameEnd: boolean;
  showRules: boolean;
  showReplay: boolean;
  roundResult: RoundResult | null;
  connectionStatus: ConnectionStatus;
}
