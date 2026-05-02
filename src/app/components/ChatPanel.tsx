import { useRef, useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ChatMessage } from '../../lib/types';
import { useGameStore } from '../../store/game-store';

interface ChatMessageItemProps {
  message: ChatMessage;
}

const messageStyles: Record<string, string> = {
  normal: 'bg-transparent',
  system: 'bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg px-2 py-1',
  'correct-guess': 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2 py-1',
  'close-guess': 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-2 py-1',
  warning: 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg px-2 py-1',
};

const messageTextStyles: Record<string, string> = {
  normal: 'text-stone-700 dark:text-stone-300',
  system: 'text-sky-700 dark:text-sky-300',
  'correct-guess': 'text-emerald-700 dark:text-emerald-300',
  'close-guess': 'text-amber-700 dark:text-amber-300',
  warning: 'text-rose-700 dark:text-rose-300',
};

function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isSystem = message.type === 'system' || message.type === 'correct-guess' || message.type === 'close-guess' || message.type === 'warning';
  const typeKey = message.type as string;
  const currentUserId = useGameStore((state) => state.currentUser?.id);
  const isOwn = message.playerId === currentUserId;

  return (
    <div className={cn(
        'text-sm max-w-[90%]', 
        isSystem ? 'mx-auto w-full' : (isOwn ? 'ml-auto' : 'mr-auto'),
        messageStyles[typeKey] || messageStyles.normal
    )}>
      {isSystem ? (
        <p className={cn('text-[10px] font-bold text-center uppercase tracking-widest', messageTextStyles[typeKey] || messageTextStyles.normal)}>
          {message.content}
        </p>
      ) : (
        <div className={cn(
            'flex flex-col',
            isOwn ? 'items-end' : 'items-start'
        )}>
          <span className="text-[10px] font-black text-stone-400 uppercase mb-0.5 px-1">
            {message.playerName || 'Unknown Player'}
          </span>
          <div className={cn(
              'px-3 py-1.5 rounded-2xl border-2 shadow-sm',
              isOwn 
                ? 'bg-amber-400 border-stone-800 text-stone-900 rounded-tr-none' 
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-tl-none'
          )}>
            <p className="leading-tight font-bold">{message.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface ChatPanelProps {
  messages: ChatMessage[];
  isDrawer: boolean;
  onSendMessage: (text: string) => void;
  placeholder?: string;
}

export function ChatPanel({ messages, isDrawer, onSendMessage, placeholder }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentUser = useGameStore((state) => state.currentUser);
  const isSpectator = currentUser?.role === 'spectator';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const role = useGameStore.getState().currentUser?.role || 'guesser';
    const playerId = useGameStore.getState().currentUser?.id;
    const roomCode = useGameStore.getState().room?.code;
    const roundId = useGameStore.getState().round?.roundId;
    if (isSpectator) {
      setInput('');
      return;
    }

    if (import.meta.env.DEV) {
        if (role === 'drawer') {
            console.log("TRACE: frontend:chat:send", { roomCode, roundId, message: trimmed, currentPlayerId: playerId, role });
        } else if (role === 'guesser') {
            console.log("TRACE: frontend:guess:submit", { roomCode, roundId, guess: trimmed, currentPlayerId: playerId, role });
        }
    }

    onSendMessage(trimmed);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-stone-50/50 dark:bg-black/20">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <span className="text-xs font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">
          {isDrawer ? '💬 Chat' : '🎯 Guess & Chat'}
        </span>
        <span className="ml-auto text-[10px] font-bold text-stone-300 dark:text-stone-600">{messages.length}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 min-h-0 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-20 grayscale py-10">
              <span className="text-4xl mb-2">💬</span>
              <p className="text-xs font-bold uppercase tracking-widest">No messages</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 flex gap-2"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder ?? (isDrawer ? 'Chat with players...' : 'Type your guess here!')}
          aria-label={isDrawer ? 'Chat message' : 'Guess the word'}
          disabled={isSpectator}
          className={cn(
            'flex-1 px-4 py-2.5 rounded-xl border-2 border-stone-200 dark:border-stone-800',
            'bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100',
            'placeholder:text-stone-400 dark:placeholder:text-stone-600',
            'focus:outline-none focus:border-amber-400 dark:focus:border-amber-500',
            'text-sm font-bold transition-all',
          )}
          maxLength={120}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSpectator}
          aria-label="Send message"
          className={cn(
            'p-2.5 rounded-xl border-2 border-stone-800 dark:border-stone-500',
            'bg-amber-400 hover:bg-amber-500 disabled:bg-stone-100 dark:disabled:bg-stone-900',
            'text-stone-900 disabled:text-stone-300 dark:disabled:text-stone-700',
            'shadow-[2px_2px_0px_#1C1917] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.05)]',
            'active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917]',
            'disabled:shadow-none disabled:translate-y-0',
            'transition-all',
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
