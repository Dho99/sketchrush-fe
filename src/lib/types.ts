// ─── Player & Room ────────────────────────────────────────────────────────────

export type PlayerStatus = 'drawing' | 'guessed' | 'waiting' | 'disconnected';
export type GameStatus = 'lobby' | 'playing' | 'round-end' | 'game-end';
export type DrawingTool = 'pencil' | 'eraser';
export type MessageType = 'normal' | 'system' | 'correct-guess' | 'close-guess';
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
}

// ─── Round State ───────────────────────────────────────────────────────────────

export interface RoundState {
  roundNumber: number;
  totalRounds: number;
  currentDrawerId: string;
  wordHint: string;
  secretWord: string;
  timeLeft: number;
  phase: RoundPhase;
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
