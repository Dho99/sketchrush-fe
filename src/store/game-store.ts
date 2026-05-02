import { create } from 'zustand';
import type {
  GameState,
  Player,
  Room,
  GameStatus,
  RoundState,
  ChatMessage,
  Stroke,
  GameSettings,
  ConnectionStatus,
  RoundResult,
  RoundClue,
} from '../lib/types';

export interface FloatingEmote {
  id: string;
  playerId: string;
  playerName: string;
  emote: string;
  sentAt: number;
}

interface GameStore extends GameState {
  // Setters
  setCurrentUser: (player: Player | null) => void;
  setRoom: (room: Room | null) => void;
  setPlayers: (players: Player[]) => void;
  setGameStatus: (status: GameStatus) => void;
  setRound: (round: RoundState | null) => void;
  addClue: (clue: RoundClue) => void;
  clearClues: () => void;
  setSettings: (settings: GameSettings) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setRoundResult: (result: RoundResult | null) => void;

  // Player actions
  updatePlayerScore: (playerId: string, score: number) => void;
  updatePlayerStatus: (playerId: string, status: Player['status']) => void;
  updatePlayerReady: (playerId: string, isReady: boolean) => void;

  // Messages
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;

  // Strokes
  setStrokes: (strokes: Stroke[]) => void;
  addStroke: (stroke: Stroke) => void;
  removeLastStroke: () => void;
  clearStrokes: () => void;

  // Timer
  decrementTimer: () => void;
  setTimer: (seconds: number) => void;

  // Emotes
  addEmote: (emote: FloatingEmote) => void;
  removeEmote: (id: string) => void;

  // Modals
  setShowRoundResult: (show: boolean) => void;
  setShowGameEnd: (show: boolean) => void;
  setShowRules: (show: boolean) => void;
  setShowReplay: (show: boolean) => void;

  // Lifecycle
  resetGame: () => void;
}

const defaultSettings: GameSettings = {
  maxRounds: 5,
  roundDuration: 90,
  wordPack: 'general',
  enableReplay: true,
  enableSmartTolerance: true,
  enableHints: true,
  enableAiClue: true,
  clueTriggerSeconds: 10,
  maxCluesPerRound: 3,
};

export const useGameStore = create<GameStore>((set) => ({
  // ─── Initial State ───────────────────────────────────────────────────────────
  currentUser: null,
  room: null,
  players: [],
  gameStatus: 'lobby',
  round: null,
  messages: [],
  strokes: [],
  settings: defaultSettings,
  showRoundResult: false,
  showGameEnd: false,
  showRules: false,
  showReplay: false,
  roundResult: null,
  connectionStatus: 'connected',
  emotes: [],

  // ─── Setters ─────────────────────────────────────────────────────────────────
  setCurrentUser: (currentUser) => set({ currentUser }),
  setRoom: (room) => set({ room }),
  setPlayers: (players) => set({ players }),
  setGameStatus: (gameStatus) => set({ gameStatus }),
  setRound: (round) => set({ round }),
  addClue: (clue) =>
    set((state) => {
      if (!state.round) return {};
      if (state.round.clues.some((c) => c.index === clue.index)) return {};
      return {
        round: { ...state.round, clues: [...state.round.clues, clue] },
      };
    }),
  clearClues: () =>
    set((state) => {
      if (!state.round) return {};
      return {
        round: { ...state.round, clues: [] },
      };
    }),
  setSettings: (settings) => set({ settings }),
  updateSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setRoundResult: (roundResult) => set({ roundResult }),

  // ─── Player Actions ──────────────────────────────────────────────────────────
  updatePlayerScore: (playerId, score) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === playerId ? { ...p, score } : p)),
    })),
  updatePlayerStatus: (playerId, status) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === playerId ? { ...p, status } : p)),
    })),
  updatePlayerReady: (playerId, isReady) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === playerId ? { ...p, isReady } : p)),
    })),

  // ─── Messages ────────────────────────────────────────────────────────────────
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),

  // ─── Strokes ─────────────────────────────────────────────────────────────────
  setStrokes: (strokes) => set({ strokes }),
  addStroke: (stroke) =>
    set((state) => ({ strokes: [...state.strokes, stroke] })),
  removeLastStroke: () =>
    set((state) => ({ strokes: state.strokes.slice(0, -1) })),
  clearStrokes: () => set({ strokes: [] }),

  // ─── Timer ───────────────────────────────────────────────────────────────────
  decrementTimer: () =>
    set((state) => {
      if (!state.round) return {};
      return {
        round: { ...state.round, timeLeft: Math.max(0, state.round.timeLeft - 1) },
      };
    }),
  setTimer: (seconds) =>
    set((state) => {
      if (!state.round) return {};
      return {
        round: { ...state.round, timeLeft: seconds },
      };
    }),

  // ─── Emotes ──────────────────────────────────────────────────────────────────
  addEmote: (emote) =>
    set((state) => ({ emotes: [...state.emotes, emote] })),
  removeEmote: (id) =>
    set((state) => ({ emotes: state.emotes.filter((e) => e.id !== id) })),

  // ─── Modals ──────────────────────────────────────────────────────────────────
  setShowRoundResult: (showRoundResult) => set({ showRoundResult }),
  setShowGameEnd: (showGameEnd) => set({ showGameEnd }),
  setShowRules: (showRules) => set({ showRules }),
  setShowReplay: (showReplay) => set({ showReplay }),

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  resetGame: () =>
    set({
      room: null,
      players: [],
      gameStatus: 'lobby',
      round: null,
      messages: [],
      strokes: [],
      showRoundResult: false,
      showGameEnd: false,
      roundResult: null,
      emotes: [],
    }),
}));
