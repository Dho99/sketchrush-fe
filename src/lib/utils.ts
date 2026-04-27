import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function getPlayerStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    drawing: 'Drawing ✏️',
    guessed: 'Guessed ✅',
    waiting: 'Waiting...',
    disconnected: 'Offline',
  };
  return labels[status] || status;
}

export function getPlayerStatusColor(status: string): string {
  const colors: Record<string, string> = {
    drawing: 'text-amber-600 dark:text-amber-400',
    guessed: 'text-emerald-600 dark:text-emerald-400',
    waiting: 'text-stone-500 dark:text-stone-400',
    disconnected: 'text-rose-500 dark:text-rose-400',
  };
  return colors[status] || 'text-stone-500';
}
