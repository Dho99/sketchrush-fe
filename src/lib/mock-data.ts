import type { Player, ChatMessage, Stroke, WordPack, GameSettings, RoundState, Room, RoundResult } from './types';

// ─── Players ───────────────────────────────────────────────────────────────────

export const MOCK_PLAYERS: Player[] = [
  { id: 'p1', name: 'Raka', avatarColor: '#F59E0B', score: 340, status: 'drawing', isHost: true, isReady: true },
  { id: 'p2', name: 'Budi', avatarColor: '#8B5CF6', score: 290, status: 'guessed', isHost: false, isReady: true },
  { id: 'p3', name: 'Sinta', avatarColor: '#EC4899', score: 250, status: 'waiting', isHost: false, isReady: true },
  { id: 'p4', name: 'Dani', avatarColor: '#10B981', score: 180, status: 'waiting', isHost: false, isReady: false },
  { id: 'p5', name: 'Yuki', avatarColor: '#3B82F6', score: 120, status: 'disconnected', isHost: false, isReady: false },
];

export const MOCK_CURRENT_USER: Player = {
  id: 'p1',
  name: 'Raka',
  avatarColor: '#F59E0B',
  score: 340,
  status: 'drawing',
  isHost: true,
  isReady: true,
};

export const MOCK_ROOM: Room = {
  code: 'RUSH7',
  hostId: 'p1',
};

// ─── Chat Messages ─────────────────────────────────────────────────────────────

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    playerId: 'system',
    playerName: 'System',
    content: 'Game started! Raka is drawing.',
    type: 'system',
    timestamp: Date.now() - 60000,
  },
  {
    id: 'm2',
    playerId: 'p2',
    playerName: 'Budi',
    content: 'is it a cat?',
    type: 'normal',
    timestamp: Date.now() - 50000,
  },
  {
    id: 'm3',
    playerId: 'p3',
    playerName: 'Sinta',
    content: 'looks like a dog to me',
    type: 'normal',
    timestamp: Date.now() - 45000,
  },
  {
    id: 'm4',
    playerId: 'system',
    playerName: 'System',
    content: 'Budi guessed the word! 🎉',
    type: 'correct-guess',
    timestamp: Date.now() - 40000,
  },
  {
    id: 'm5',
    playerId: 'p4',
    playerName: 'Dani',
    content: 'gajah?',
    type: 'close-guess',
    timestamp: Date.now() - 35000,
  },
  {
    id: 'm6',
    playerId: 'system',
    playerName: 'System',
    content: "Dani's guess was close! 👀",
    type: 'close-guess',
    timestamp: Date.now() - 30000,
  },
  {
    id: 'm7',
    playerId: 'p3',
    playerName: 'Sinta',
    content: 'wah hampir!',
    type: 'normal',
    timestamp: Date.now() - 25000,
  },
];

// ─── Round State ───────────────────────────────────────────────────────────────

export const MOCK_ROUND: RoundState = {
  roundNumber: 2,
  totalRounds: 5,
  currentDrawerId: 'p1',
  wordHint: '_ _ _ _ _',
  secretWord: 'GAJAH',
  timeLeft: 67,
  phase: 'drawing',
  clues: [],
};

// ─── Settings ──────────────────────────────────────────────────────────────────

export const MOCK_SETTINGS: GameSettings = {
  maxRounds: 5,
  roundDuration: 90,
  wordPack: 'general',
  selectedWordPackId: 'general',
  wordPackName: 'General',
  customWords: [],
  enableReplay: true,
  enableSmartTolerance: true,
  enableHints: true,
  enableAiClue: true,
  clueTriggerSeconds: 10,
  maxCluesPerRound: 3,
};

// ─── Round Result ──────────────────────────────────────────────────────────────

export const MOCK_ROUND_RESULT: RoundResult = {
  roundId: 'r1',
  correctWord: 'GAJAH',
  correctGuessers: [
    { playerId: 'p2', playerName: 'Budi', pointsGained: 180, guessTime: 12 },
    { playerId: 'p3', playerName: 'Sinta', pointsGained: 140, guessTime: 27 },
  ],
  drawerBonus: 60,
  drawerId: 'p1',
};

// ─── Word Packs ────────────────────────────────────────────────────────────────

export const WORD_PACKS: WordPack[] = [
  {
    id: 'general',
    name: 'General',
    emoji: '🌍',
    description: 'Everyday objects and concepts',
    words: ['apple', 'house', 'car', 'tree', 'sun', 'moon', 'cat', 'dog', 'book', 'phone', 'bike', 'clock'],
  },
  {
    id: 'animals',
    name: 'Animals',
    emoji: '🐘',
    description: 'All kinds of animals',
    words: ['elephant', 'giraffe', 'penguin', 'dolphin', 'tiger', 'koala', 'panda', 'kangaroo', 'parrot', 'octopus'],
  },
  {
    id: 'food',
    name: 'Makanan',
    emoji: '🍜',
    description: 'Indonesian and popular foods',
    words: ['rendang', 'nasi goreng', 'sate', 'gado-gado', 'bakso', 'soto', 'rawon', 'pempek', 'es teh', 'martabak'],
  },
  {
    id: 'campus',
    name: 'Kampus',
    emoji: '🎓',
    description: 'Campus life in Indonesia',
    words: ['tugas akhir', 'dosen', 'krs', 'ipk', 'beasiswa', 'wisuda', 'kantin', 'perpustakaan', 'skripsi', 'sidang'],
  },
  {
    id: 'meme',
    name: 'Meme Indonesia',
    emoji: '😂',
    description: 'Viral Indonesian internet culture',
    words: ['anjay', 'gas pol', 'gercep', 'kuy', 'santuy', 'bucin', 'kepo', 'baper', 'gabut', 'julid'],
  },
  {
    id: 'classroom',
    name: 'Classroom',
    emoji: '📚',
    description: 'Perfect for class sessions',
    words: ['whiteboard', 'marker', 'absensi', 'presentasi', 'kelompok', 'deadline', 'revisi', 'proyektor', 'ujian'],
  },
];

// ─── Mock Strokes (Elephant Drawing) ──────────────────────────────────────────

export const MOCK_STROKES: Stroke[] = [
  // Body (large ellipse)
  {
    id: 's_body',
    points: Array.from({ length: 40 }, (_, i) => ({
      x: 400 + 140 * Math.cos((i / 40) * Math.PI * 2),
      y: 280 + 100 * Math.sin((i / 40) * Math.PI * 2),
    })),
    color: '#374151',
    size: 4,
    tool: 'pencil',
    timestamp: Date.now() - 50000,
  },
  // Head
  {
    id: 's_head',
    points: Array.from({ length: 30 }, (_, i) => ({
      x: 248 + 65 * Math.cos((i / 30) * Math.PI * 2),
      y: 220 + 60 * Math.sin((i / 30) * Math.PI * 2),
    })),
    color: '#374151',
    size: 4,
    tool: 'pencil',
    timestamp: Date.now() - 45000,
  },
  // Trunk
  {
    id: 's_trunk',
    points: [
      { x: 198, y: 255 },
      { x: 182, y: 278 },
      { x: 170, y: 310 },
      { x: 165, y: 340 },
      { x: 172, y: 365 },
      { x: 188, y: 370 },
      { x: 195, y: 358 },
    ],
    color: '#374151',
    size: 5,
    tool: 'pencil',
    timestamp: Date.now() - 40000,
  },
  // Ear (left large flap)
  {
    id: 's_ear',
    points: Array.from({ length: 25 }, (_, i) => ({
      x: 200 + 72 * Math.cos((i / 25) * Math.PI * 1.6 + Math.PI * 0.2),
      y: 195 + 65 * Math.sin((i / 25) * Math.PI * 1.6 + Math.PI * 0.2),
    })),
    color: '#374151',
    size: 3,
    tool: 'pencil',
    timestamp: Date.now() - 35000,
  },
  // Eye
  {
    id: 's_eye',
    points: Array.from({ length: 12 }, (_, i) => ({
      x: 232 + 9 * Math.cos((i / 12) * Math.PI * 2),
      y: 205 + 9 * Math.sin((i / 12) * Math.PI * 2),
    })),
    color: '#374151',
    size: 3,
    tool: 'pencil',
    timestamp: Date.now() - 30000,
  },
  // Front left leg
  {
    id: 's_leg1',
    points: [{ x: 310, y: 370 }, { x: 306, y: 420 }, { x: 303, y: 450 }],
    color: '#374151',
    size: 10,
    tool: 'pencil',
    timestamp: Date.now() - 25000,
  },
  // Front right leg
  {
    id: 's_leg2',
    points: [{ x: 360, y: 370 }, { x: 358, y: 420 }, { x: 358, y: 450 }],
    color: '#374151',
    size: 10,
    tool: 'pencil',
    timestamp: Date.now() - 22000,
  },
  // Back left leg
  {
    id: 's_leg3',
    points: [{ x: 450, y: 365 }, { x: 448, y: 415 }, { x: 445, y: 450 }],
    color: '#374151',
    size: 10,
    tool: 'pencil',
    timestamp: Date.now() - 19000,
  },
  // Back right leg
  {
    id: 's_leg4',
    points: [{ x: 500, y: 365 }, { x: 500, y: 415 }, { x: 502, y: 450 }],
    color: '#374151',
    size: 10,
    tool: 'pencil',
    timestamp: Date.now() - 16000,
  },
  // Tail
  {
    id: 's_tail',
    points: [
      { x: 535, y: 255 },
      { x: 555, y: 238 },
      { x: 568, y: 248 },
      { x: 560, y: 232 },
      { x: 573, y: 228 },
    ],
    color: '#374151',
    size: 3,
    tool: 'pencil',
    timestamp: Date.now() - 12000,
  },
  // Tusk
  {
    id: 's_tusk',
    points: [
      { x: 205, y: 248 },
      { x: 185, y: 252 },
      { x: 170, y: 258 },
      { x: 162, y: 265 },
    ],
    color: '#374151',
    size: 3,
    tool: 'pencil',
    timestamp: Date.now() - 8000,
  },
];

// ─── Avatar Colors ─────────────────────────────────────────────────────────────

export const AVATAR_COLORS = [
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#10B981',
  '#3B82F6',
  '#F97316',
  '#06B6D4',
  '#EF4444',
];
