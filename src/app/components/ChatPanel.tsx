import { useRef, useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ChatMessage, MessageType } from '../../lib/types';

interface ChatMessageItemProps {
  message: ChatMessage;
}

const messageStyles: Record<MessageType, string> = {
  normal: 'bg-transparent',
  system: 'bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg px-2 py-1',
  'correct-guess': 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2 py-1',
  'close-guess': 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-2 py-1',
};

const messageTextStyles: Record<MessageType, string> = {
  normal: 'text-stone-700 dark:text-stone-300',
  system: 'text-sky-700 dark:text-sky-300',
  'correct-guess': 'text-emerald-700 dark:text-emerald-300',
  'close-guess': 'text-amber-700 dark:text-amber-300',
};

function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isSystem = message.type !== 'normal';

  return (
    <div className={cn('text-sm', messageStyles[message.type])}>
      {isSystem ? (
        <p className={cn('text-xs', messageTextStyles[message.type])}>
          {message.content}
        </p>
      ) : (
        <p className="text-stone-800 dark:text-stone-200">
          <span
            className="font-bold mr-1"
            style={{ color: undefined }}
          >
            {message.playerName}:
          </span>
          <span className={messageTextStyles[message.type]}>{message.content}</span>
        </p>
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
  };

  // Placeholder functions for socket integration
  const handleSendMessage = (text: string) => {
    // TODO: Replace with socket.emit('chat:send', { message: text })
    onSendMessage(text);
  };

  const handleGuessSubmit = (guess: string) => {
    // TODO: Replace with socket.emit('guess:submit', { guess })
    // The server will validate and respond with 'guess:correct' or 'guess:close'
    onSendMessage(guess);
  };

  void handleGuessSubmit;
  void handleSendMessage;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-stone-200 dark:border-stone-700">
        <span className="text-sm font-bold text-stone-800 dark:text-stone-200">
          {isDrawer ? '💬 Chat' : '🎯 Guess & Chat'}
        </span>
        <span className="ml-auto text-xs text-stone-400 dark:text-stone-500">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 min-h-0">
        {messages.length === 0 && (
          <p className="text-xs text-stone-400 dark:text-stone-500 text-center py-4">
            No messages yet. Start chatting!
          </p>
        )}
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-2 border-t-2 border-stone-200 dark:border-stone-700 flex gap-2"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder ?? (isDrawer ? 'Chat with players...' : 'Type your guess here!')}
          aria-label={isDrawer ? 'Chat message' : 'Guess the word'}
          className={cn(
            'flex-1 px-3 py-2 rounded-xl border-2 border-stone-300 dark:border-stone-600',
            'bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100',
            'placeholder:text-stone-400 dark:placeholder:text-stone-500',
            'focus:outline-none focus:border-amber-400 dark:focus:border-amber-500',
            'text-sm transition-colors',
          )}
          maxLength={120}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="Send message"
          className={cn(
            'p-2.5 rounded-xl border-2 border-stone-800 dark:border-stone-400',
            'bg-amber-400 hover:bg-amber-500 disabled:bg-stone-200 dark:disabled:bg-stone-700',
            'text-stone-900 disabled:text-stone-400 dark:disabled:text-stone-500',
            'shadow-[2px_2px_0px_#1C1917] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.1)]',
            'active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917]',
            'disabled:shadow-none disabled:translate-y-0',
            'transition-all',
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
