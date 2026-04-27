import { Settings2 } from 'lucide-react';
import { WordPackSelector } from './WordPackSelector';
import type { GameSettings } from '../../lib/types';
import { cn } from '../../lib/utils';

interface SettingsPanelProps {
  settings: GameSettings;
  isHost: boolean;
  onChange: (settings: Partial<GameSettings>) => void;
}

interface SwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
  description?: string;
}

function Toggle({ id, checked, onChange, disabled, label, description }: SwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-semibold text-stone-800 dark:text-stone-200 cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-stone-500 dark:text-stone-400">{description}</p>
        )}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-stone-800 dark:border-stone-500 transition-colors',
          checked ? 'bg-amber-400' : 'bg-stone-200 dark:bg-stone-700',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200',
            checked ? 'translate-x-5' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  );
}

export function SettingsPanel({ settings, isHost, onChange }: SettingsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b-2 border-stone-200 dark:border-stone-700">
        <Settings2 className="w-4 h-4 text-stone-500 dark:text-stone-400" />
        <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">Game Settings</h3>
        {!isHost && (
          <span className="ml-auto text-xs text-stone-400 dark:text-stone-500">Only host can edit</span>
        )}
      </div>

      {/* Rounds */}
      <div className="space-y-1">
        <label htmlFor="maxRounds" className="text-sm font-semibold text-stone-800 dark:text-stone-200">
          Rounds
        </label>
        <div className="flex gap-2">
          {[3, 5, 7, 10].map((r) => (
            <button
              key={r}
              disabled={!isHost}
              onClick={() => onChange({ maxRounds: r })}
              className={cn(
                'flex-1 py-1.5 rounded-lg border-2 text-sm transition-colors',
                settings.maxRounds === r
                  ? 'border-stone-800 dark:border-stone-400 bg-amber-400 text-stone-900'
                  : 'border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300',
                !isHost && 'opacity-50 cursor-not-allowed',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Round duration */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label htmlFor="roundDuration" className="text-sm font-semibold text-stone-800 dark:text-stone-200">
            Round Duration
          </label>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{settings.roundDuration}s</span>
        </div>
        <input
          id="roundDuration"
          type="range"
          min={30}
          max={180}
          step={15}
          value={settings.roundDuration}
          disabled={!isHost}
          onChange={(e) => onChange({ roundDuration: Number(e.target.value) })}
          className="w-full h-2 accent-amber-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500">
          <span>30s</span>
          <span>180s</span>
        </div>
      </div>

      {/* Word Pack */}
      <WordPackSelector
        currentPack={settings.wordPack}
        isHost={isHost}
        onChange={(pack) => onChange({ wordPack: pack })}
      />

      {/* Toggles */}
      <div className="space-y-1 pt-1 border-t border-stone-200 dark:border-stone-700">
        <Toggle
          id="enableReplay"
          checked={settings.enableReplay}
          onChange={(v) => onChange({ enableReplay: v })}
          disabled={!isHost}
          label="Replay Drawing"
          description="Watch how the drawing was created"
        />
        <Toggle
          id="enableSmartTolerance"
          checked={settings.enableSmartTolerance}
          onChange={(v) => onChange({ enableSmartTolerance: v })}
          disabled={!isHost}
          label="Smart Answer Tolerance"
          description="Close guesses get a hint notification"
        />
        <Toggle
          id="enableHints"
          checked={settings.enableHints}
          onChange={(v) => onChange({ enableHints: v })}
          disabled={!isHost}
          label="Word Hints"
          description="Gradually reveal letters over time"
        />
      </div>
    </div>
  );
}
