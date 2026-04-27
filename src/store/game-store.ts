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
} from '../lib/types';
import {
  MOCK_CURRENT_USER,
  MOCK_PLAYERS,
  MOCK_ROOM,
  MOCK_MESSAGES,
  MOCK_ROUND,
  MOCK_SETTINGS,
  MOCK_STROKES,
  MOCK_ROUND_RESULT,
} from '../lib/mock-data';

interface GameStore extends GameState {
  // Setters
  setCurrentUser: (player: Player | null) => void;
  setRoom: (room: Room | null) => void;
  setPlayers: (players: Player[]) => void;
  setGameStatus: (status: GameStatus) => void;
  setRound: (round: RoundState | null) => void;
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

  // Modals
  setShowRoundResult: (show: boolean) => void;
  setShowGameEnd: (show: boolean) => void;
  setShowRules: (show: boolean) => void;
  setShowReplay: (show: boolean) => void;

  // Lifecycle
  initializeMockGame: () => void;
  initializeMockLobby: () => void;
  resetGame: () => void;
}

const defaultSettings: GameSettings = {
  maxRounds: 5,
  roundDuration: 90,
  wordPack: 'general',
  enableReplay: true,
  enableSmartTolerance: true,
  enableHints: true,
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

  // ─── Setters ─────────────────────────────────────────────────────────────────
  setCurrentUser: (currentUser) => set({ currentUser }),
  setRoom: (room) => set({ room }),
  setPlayers: (players) => set({ players }),
  setGameStatus: (gameStatus) => set({ gameStatus }),
  setRound: (round) => set({ round }),
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

  // ─── Modals ──────────────────────────────────────────────────────────────────
  setShowRoundResult: (showRoundResult) => set({ showRoundResult }),
  setShowGameEnd: (showGameEnd) => set({ showGameEnd }),
  setShowRules: (showRules) => set({ showRules }),
  setShowReplay: (showReplay) => set({ showReplay }),

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  initializeMockGame: () =>
    set({
      currentUser: MOCK_CURRENT_USER,
      room: MOCK_ROOM,
      players: MOCK_PLAYERS,
      gameStatus: 'playing',
      round: MOCK_ROUND,
      messages: MOCK_MESSAGES,
      strokes: MOCK_STROKES,
      settings: MOCK_SETTINGS,
      connectionStatus: 'connected',
      showRoundResult: false,
      showGameEnd: false,
      roundResult: MOCK_ROUND_RESULT,
    }),

  initializeMockLobby: () =>
    set({
      currentUser: MOCK_CURRENT_USER,
      room: MOCK_ROOM,
      players: MOCK_PLAYERS,
      gameStatus: 'lobby',
      round: null,
      messages: [],
      strokes: [],
      settings: MOCK_SETTINGS,
      connectionStatus: 'connected',
    }),

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
    }),
}));
