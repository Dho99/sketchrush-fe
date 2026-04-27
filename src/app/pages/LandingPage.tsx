import { Link } from 'react-router';
import { Pencil, MessageCircle, Users, Play, RefreshCw, Lightbulb, School, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Doodle Accent SVGs ───────────────────────────────────────────────────────

function DoodleStar({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-8 h-8 text-amber-400', className)}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M16 4 L18 13 L27 13 L20 19 L23 28 L16 22 L9 28 L12 19 L5 13 L14 13 Z" />
    </svg>
  );
}

function DoodleZigzag({ className }: { className?: string }) {
  return (
    <svg className={cn('w-16 h-6', className)} viewBox="0 0 64 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <polyline points="0,12 10,4 20,12 30,4 40,12 50,4 64,12" />
    </svg>
  );
}

function DoodleCircle({ className }: { className?: string }) {
  return (
    <svg className={cn('w-12 h-12', className)} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M24 6 C32 5 42 12 43 22 C44 32 37 44 26 44 C16 44 6 36 6 25 C6 14 12 7 24 6 Z" />
    </svg>
  );
}

function DoodleArrow({ className }: { className?: string }) {
  return (
    <svg className={cn('w-10 h-10', className)} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 20 Q20 8 36 20" />
      <polyline points="28,14 36,20 28,26" />
    </svg>
  );
}

// ─── Mock gameplay preview cards ─────────────────────────────────────────────

function PreviewPlayerList() {
  const players = [
    { name: 'Raka', color: '#F59E0B', score: 340, status: 'drawing' },
    { name: 'Budi', color: '#8B5CF6', score: 290, status: 'guessed' },
    { name: 'Sinta', color: '#EC4899', score: 250, status: 'waiting' },
    { name: 'Dani', color: '#10B981', score: 180, status: 'waiting' },
  ];
  return (
    <div className="bg-white dark:bg-stone-800 border-2 border-stone-800 dark:border-stone-500 rounded-xl p-3 shadow-[3px_3px_0px_#1C1917] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.1)] space-y-2 w-44">
      <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Players</p>
      {players.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg border-2 border-stone-800 dark:border-stone-500 flex items-center justify-center text-xs text-white font-bold shrink-0" style={{ backgroundColor: p.color }}>
            {p.name[0]}
          </div>
          <span className="flex-1 text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">{p.name}</span>
          <span className="text-xs font-bold text-stone-600 dark:text-stone-400">{p.score}</span>
        </div>
      ))}
    </div>
  );
}

function PreviewCanvas() {
  return (
    <div className="bg-white border-2 border-stone-800 dark:border-stone-500 rounded-xl shadow-[3px_3px_0px_#1C1917] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.1)] overflow-hidden w-52 h-36 flex items-center justify-center">
      <svg viewBox="0 0 200 140" className="w-full h-full">
        {/* Simple cat drawing */}
        <circle cx="100" cy="60" r="35" fill="none" stroke="#374151" strokeWidth="3" />
        <polygon points="72,32 62,10 85,30" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="128,32 138,10 115,30" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="88" cy="57" r="5" fill="#374151" />
        <circle cx="112" cy="57" r="5" fill="#374151" />
        <path d="M92,75 Q100,80 108,75" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
        <line x1="65" y1="68" x2="85" y2="72" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="65" y1="72" x2="85" y2="74" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="115" y1="72" x2="135" y2="68" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="115" y1="74" x2="135" y2="72" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function PreviewChat() {
  const messages = [
    { name: 'Budi', text: 'is it a cat?', type: 'normal' },
    { text: 'Budi guessed it! 🎉', type: 'correct' },
    { name: 'Sinta', text: 'woah fast!', type: 'normal' },
  ];
  return (
    <div className="bg-white dark:bg-stone-800 border-2 border-stone-800 dark:border-stone-500 rounded-xl p-3 shadow-[3px_3px_0px_#1C1917] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.1)] space-y-1.5 w-44">
      <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Chat</p>
      {messages.map((m, i) => (
        <div key={i} className={cn('text-xs px-2 py-1 rounded-lg', m.type === 'correct' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'text-stone-700 dark:text-stone-300')}>
          {m.name && <span className="font-bold">{m.name}: </span>}
          {m.text}
        </div>
      ))}
    </div>
  );
}

// ─── Feature cards ─────────────────────────────────────────────────────────────

const features = [
  { icon: <Pencil className="w-5 h-5" />, title: 'Real-time Drawing', desc: 'Strokes sync instantly across all players as coordinate data.', color: 'amber' },
  { icon: <MessageCircle className="w-5 h-5" />, title: 'Guessing Chat', desc: 'Type your guess — correct answers stay private to keep it fair.', color: 'violet' },
  { icon: <Users className="w-5 h-5" />, title: 'Room-based Multiplayer', desc: 'Create or join a room with a short code. No accounts needed.', color: 'pink' },
  { icon: <Play className="w-5 h-5" />, title: 'Replay Drawing', desc: 'Watch any drawing from start to finish with timeline controls.', color: 'emerald' },
  { icon: <Lightbulb className="w-5 h-5" />, title: 'Smart Answer Tolerance', desc: "Close guesses get a hint — 'gajah' vs 'gajah besar' counts!", color: 'orange' },
  { icon: <RefreshCw className="w-5 h-5" />, title: 'Custom Word Pack', desc: 'Use built-in packs or create your own word list for the session.', color: 'sky' },
  { icon: <School className="w-5 h-5" />, title: 'Classroom Mode', desc: 'Educational gameplay with subject-specific vocabulary packs.', color: 'teal' },
];

const featureColors: Record<string, string> = {
  amber: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  violet: 'border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  pink: 'border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
  emerald: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  orange: 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  sky: 'border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400',
  teal: 'border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
};

// ─── Steps ─────────────────────────────────────────────────────────────────────

const steps = [
  { num: 1, title: 'Create or join a room', desc: 'Get a 6-character room code to share with friends.', emoji: '🚪' },
  { num: 2, title: 'Wait for players', desc: 'Lobby shows all players. Host adjusts settings and starts.', emoji: '👥' },
  { num: 3, title: 'Draw the secret word', desc: 'The chosen drawer sees the word and draws it on the canvas.', emoji: '✏️' },
  { num: 4, title: 'Guess through chat', desc: 'Everyone else types their guess. Speed matters!', emoji: '💬' },
  { num: 5, title: 'Earn score and climb', desc: 'Rack up points across rounds and top the leaderboard.', emoji: '🏆' },
];

// ─── Landing Page Component ────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4">
        {/* Background doodles */}
        <DoodleStar className="absolute top-8 left-[8%] opacity-60 rotate-12" />
        <DoodleStar className="absolute top-20 right-[10%] opacity-40 -rotate-6 text-violet-400 w-5 h-5" />
        <DoodleCircle className="absolute bottom-10 left-[5%] opacity-30 text-pink-400" />
        <DoodleCircle className="absolute top-16 right-[20%] opacity-20 text-sky-400 w-8 h-8" />
        <DoodleZigzag className="absolute bottom-24 right-[8%] opacity-40 text-amber-400 rotate-12" />
        <DoodleZigzag className="absolute top-32 left-[15%] opacity-30 text-violet-400 -rotate-6" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-stone-800 dark:border-stone-500 bg-white dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 shadow-[2px_2px_0px_#1C1917] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.1)]">
            ✨ Multiplayer Drawing Game
          </span>

          {/* Title */}
          <div className="relative inline-block">
            <h1
              className="text-6xl md:text-8xl text-stone-900 dark:text-stone-100 leading-none"
              style={{ fontFamily: "'Fredoka One', sans-serif" }}
            >
              Hanep.io
            </h1>
            <DoodleArrow className="absolute -right-10 -bottom-4 text-amber-400 hidden md:block" />
          </div>

          {/* Tagline */}
          <p
            className="text-2xl md:text-3xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            Draw fast. Guess faster. Laugh together. 🎨
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              to="/join"
              className={cn(
                'flex items-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-stone-800 dark:border-stone-400',
                'bg-amber-400 hover:bg-amber-500 text-stone-900',
                'shadow-[4px_4px_0px_#1C1917] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.15)]',
                'hover:shadow-[5px_5px_0px_#1C1917] dark:hover:shadow-[5px_5px_0px_rgba(255,255,255,0.2)]',
                'active:translate-y-[2px] active:shadow-[2px_2px_0px_#1C1917]',
                'transition-all font-bold text-lg',
              )}
            >
              ✏️ Create Room
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/join"
              className={cn(
                'flex items-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-stone-800 dark:border-stone-500',
                'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200',
                'shadow-[4px_4px_0px_#1C1917] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.1)]',
                'hover:shadow-[5px_5px_0px_#1C1917] dark:hover:shadow-[5px_5px_0px_rgba(255,255,255,0.15)]',
                'active:translate-y-[2px] active:shadow-[2px_2px_0px_#1C1917]',
                'transition-all font-bold text-lg',
              )}
            >
              🚪 Join Room
            </Link>
          </div>

          {/* Social proof micro-copy */}
          <p className="text-sm text-stone-500 dark:text-stone-400">
            No account needed · Free to play · Works on any device
          </p>
        </div>
      </section>

      {/* ── Gameplay Preview ──────────────────────────────── */}
      <section className="py-12 px-4 bg-white dark:bg-stone-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2
              className="text-3xl text-stone-900 dark:text-stone-100"
              style={{ fontFamily: "'Fredoka One', sans-serif" }}
            >
              See it in action
            </h2>
          </div>
          <div className="flex flex-wrap items-start justify-center gap-6">
            <PreviewPlayerList />
            <div className="flex flex-col items-center gap-2">
              <PreviewCanvas />
              <p className="text-xs text-stone-400 dark:text-stone-500" style={{ fontFamily: "'Caveat', cursive" }}>
                Someone is drawing... 🤔
              </p>
            </div>
            <PreviewChat />
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <h2
              className="text-3xl text-stone-900 dark:text-stone-100"
              style={{ fontFamily: "'Fredoka One', sans-serif" }}
            >
              Everything you need to play
            </h2>
            <p className="text-stone-500 dark:text-stone-400">
              Built for fun, designed for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className={cn(
                  'p-4 rounded-2xl border-2',
                  'shadow-[3px_3px_0px_#1C1917] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.08)]',
                  'hover:shadow-[5px_5px_0px_#1C1917] dark:hover:shadow-[5px_5px_0px_rgba(255,255,255,0.12)]',
                  'hover:-translate-y-0.5 transition-all',
                  'bg-white dark:bg-stone-800',
                  'border-stone-200 dark:border-stone-700',
                )}
              >
                <div className={cn('inline-flex p-2 rounded-xl border mb-3', featureColors[f.color])}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">{f.title}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ──────────────────────────────────── */}
      <section className="py-16 px-4 bg-white dark:bg-stone-900/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-3xl text-stone-900 dark:text-stone-100"
              style={{ fontFamily: "'Fredoka One', sans-serif" }}
            >
              How it works
            </h2>
          </div>

          <div className="space-y-4">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="flex items-start gap-4 p-4 rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-[2px_2px_0px_#1C1917] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.08)]"
              >
                <div className="w-9 h-9 rounded-xl border-2 border-stone-800 dark:border-stone-500 bg-amber-400 flex items-center justify-center shrink-0 font-bold text-stone-900 shadow-[2px_2px_0px_#1C1917] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.1)]">
                  {step.num}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden>{step.emoji}</span>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{step.title}</h3>
                  </div>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <DoodleStar className="mx-auto text-amber-400" />
          <h2
            className="text-4xl text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fredoka One', sans-serif" }}
          >
            Ready to play?
          </h2>
          <p className="text-stone-500 dark:text-stone-400">
            Gather your friends, pick a word pack, and let the chaos begin!
          </p>
          <Link
            to="/join"
            className={cn(
              'inline-flex items-center gap-2 px-10 py-4 rounded-2xl border-2 border-stone-800 dark:border-stone-400',
              'bg-violet-500 hover:bg-violet-600 text-white',
              'shadow-[4px_4px_0px_#1C1917] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.15)]',
              'hover:shadow-[6px_6px_0px_#1C1917] dark:hover:shadow-[6px_6px_0px_rgba(255,255,255,0.2)]',
              'active:translate-y-[2px] active:shadow-[2px_2px_0px_#1C1917]',
              'transition-all font-bold text-lg',
            )}
          >
            🎮 Start Playing Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="py-8 px-4 border-t-2 border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>✏️</span>
            <span className="font-bold text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Fredoka One', sans-serif" }}>
              Hanep.io
            </span>
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            A multiplayer drawing & guessing game · Frontend only (backend coming soon)
          </p>
          <p
            className="text-sm text-stone-500 dark:text-stone-400"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            Made with ❤️ and too many eraser strokes
          </p>
        </div>
      </footer>
    </div>
  );
}
