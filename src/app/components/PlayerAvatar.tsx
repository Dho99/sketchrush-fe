import { cn, getInitial } from '../../lib/utils';

interface PlayerAvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showBorder?: boolean;
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

export function PlayerAvatar({ name, color, size = 'md', className, showBorder = true }: PlayerAvatarProps) {
  return (
    <div
      className={cn(
        'rounded-xl flex items-center justify-center shrink-0 font-bold select-none',
        showBorder && 'border-2 border-stone-800 dark:border-stone-600',
        sizeMap[size],
        className,
      )}
      style={{ backgroundColor: color, color: '#fff' }}
      aria-label={`Avatar for ${name}`}
    >
      {getInitial(name)}
    </div>
  );
}
