// ─── Player & Room ────────────────────────────────────────────────────────────

export type PlayerRole = 'host' | 'drawer' | 'guesser' | 'spectator';
export type PlayerStatus = 'drawing' | 'guessed' | 'waiting' | 'ready' | 'playing' | 'disconnected';
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
  selectedWordPackId?: string;
  wordPackName?: string;
  customWords?: string[];
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
  duration: number;
  timeLeft: number;
  phase: RoundPhase;
  clues: RoundClue[];
  nextDrawerId?: string | null;
  nextDrawerName?: string | null;
}

export interface WordOption {
  id: string;
  label: string;
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
  roomCode?: string;
  roundId: string;
  roundNumber?: number;
  maxRounds?: number;
  isLastRound?: boolean;
  correctWord: string;
  correctGuessers: { playerId: string; playerName: string; pointsGained: number; scoreGained?: number; guessTime: number; timeTaken?: number }[];
  guessedPlayers?: { playerId: string; playerName: string; scoreGained: number; timeTaken: number }[];
  drawerBonus: number;
  drawerId: string;
  drawerName?: string;
  nextDrawerId?: string | null;
  nextDrawerName?: string | null;
  canChooseNextWordPlayerId?: string | null;
  leaderboard?: Player[];
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
  wordOptions: WordOption[];
  wordOptionsRoundId: string | null;
  isWordSelectionOpen: boolean;
  isSelectingWord: boolean;
}
