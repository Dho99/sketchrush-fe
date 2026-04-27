import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ConnectionStatus as ConnectionStatusType } from '../../lib/types';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  className?: string;
}

export function ConnectionStatus({ status, className }: ConnectionStatusProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs',
        status === 'connected' && 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
        status === 'reconnecting' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
        status === 'disconnected' && 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
        className,
      )}
    >
      {status === 'connected' && <Wifi className="w-3 h-3" />}
      {status === 'reconnecting' && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === 'disconnected' && <WifiOff className="w-3 h-3" />}
      <span>
        {status === 'connected' && 'Connected'}
        {status === 'reconnecting' && 'Reconnecting...'}
        {status === 'disconnected' && 'Offline'}
      </span>
    </div>
  );
}
