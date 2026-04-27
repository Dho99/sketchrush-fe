import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon = '🎮', title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-10 px-4 text-center',
        className,
      )}
    >
      <span className="text-5xl" aria-hidden="true">{icon}</span>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">{title}</h3>
        {description && (
          <p className="text-sm text-stone-500 dark:text-stone-400">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
