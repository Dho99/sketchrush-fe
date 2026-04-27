import { X, Pencil, MessageCircle, Trophy, Lightbulb, Play, School } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

const sections = [
  {
    icon: <Pencil className="w-4 h-4" />,
    title: 'How to Play',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    items: [
      'One player is chosen as the Drawer each round.',
      'The Drawer sees a secret word and must draw it on the canvas.',
      'Other players guess by typing in the chat.',
      'Score points for guessing quickly — the faster, the more points!',
    ],
  },
  {
    icon: <Trophy className="w-4 h-4" />,
    title: 'Scoring',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800',
    items: [
      'Guessers earn points based on how quickly they guess (max 200).',
      'The Drawer earns bonus points for each correct guesser.',
      'If no one guesses, the Drawer gets 0 bonus points.',
      'Scores are tallied at the end of all rounds.',
    ],
  },
  {
    icon: <Pencil className="w-4 h-4" />,
    title: 'Drawer Rules',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    items: [
      'Draw ONLY the secret word — no letters or numbers!',
      'Use the pencil, eraser, colors, and brush sizes.',
      'Use Undo to fix mistakes or Clear to start fresh.',
      'Strokes are sent in real-time as coordinates (not images).',
    ],
  },
  {
    icon: <MessageCircle className="w-4 h-4" />,
    title: 'Guessing Rules',
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800',
    items: [
      'Type your guess in the chat and press Enter.',
      'If correct, you earn points but the word is NOT shown publicly.',
      'A system message will say "X guessed the word!" instead.',
      'Keep guessing — only your final score matters!',
    ],
  },
  {
    icon: <Lightbulb className="w-4 h-4" />,
    title: 'Smart Answer Tolerance',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    items: [
      'If your guess is very close (e.g., typo or near-synonym), you get notified.',
      'A message appears: "Your guess was close! 👀"',
      'This doesn\'t count as a correct answer — keep trying!',
      'Enable or disable this in Lobby settings.',
    ],
  },
  {
    icon: <Play className="w-4 h-4" />,
    title: 'Replay Drawing',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    items: [
      'After each round, you can watch how the drawing was made.',
      'Use the timeline scrubber to jump to any moment.',
      'Control playback speed: 0.5×, 1×, or 2×.',
      'Enable or disable in Lobby settings.',
    ],
  },
  {
    icon: <School className="w-4 h-4" />,
    title: 'Classroom Mode',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
    items: [
      'Use the "Classroom" word pack for educational gameplay.',
      'The host can set custom word lists relevant to lessons.',
      'Great for vocabulary building or subject review!',
      'All features work the same — just with school-friendly words.',
    ],
  },
];

export function RulesModal({ onClose }: RulesModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Game rules"
    >
      <div className="bg-white dark:bg-stone-900 border-2 border-stone-800 dark:border-stone-500 rounded-2xl shadow-[6px_6px_0px_#1C1917] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.1)] w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-2 border-stone-200 dark:border-stone-700">
          <h2
            className="text-2xl text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fredoka One', sans-serif" }}
          >
            📖 How to Play
          </h2>
          <button
            onClick={onClose}
            aria-label="Close rules"
            className="p-2 rounded-xl border-2 border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4 text-stone-700 dark:text-stone-300" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-4">
          {sections.map((section) => (
            <div
              key={section.title}
              className={`p-4 rounded-xl border ${section.bg}`}
            >
              <div className={`flex items-center gap-2 mb-2 ${section.color}`}>
                {section.icon}
                <h3 className="text-sm font-bold">{section.title}</h3>
              </div>
              <ul className="space-y-1">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300">
                    <span className="text-stone-400 dark:text-stone-500 shrink-0 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t-2 border-stone-200 dark:border-stone-700">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border-2 border-stone-800 dark:border-stone-400 bg-amber-400 hover:bg-amber-500 text-stone-900 shadow-[3px_3px_0px_#1C1917] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917] transition-all text-sm font-bold"
          >
            Got it! Let's Play 🎮
          </button>
        </div>
      </div>
    </div>
  );
}
