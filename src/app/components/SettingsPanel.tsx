import { Settings2, Trash2, AlertTriangle } from "lucide-react";
import { WordPackSelector } from "./WordPackSelector";
import type { GameSettings } from "../../lib/types";
import { cn } from "../../lib/utils";
import { socketService } from "../../lib/socket";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog";

interface SettingsPanelProps {
    settings: GameSettings;
    isHost: boolean;
    onChange: (settings: Partial<GameSettings>) => void;
    roomCode: string;
    isPrivate?: boolean;
}

function Toggle({
    id,
    checked,
    onChange,
    disabled,
    label,
    description,
}: {
    id: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
    label: string;
    description?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 group">
            <div className="flex-1 min-w-0">
                <label
                    htmlFor={id}
                    className="text-sm font-bold text-stone-800 dark:text-stone-200 block mb-0.5"
                >
                    {label}
                </label>
                {description && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-snug">
                        {description}
                    </p>
                )}
            </div>
            <button
                type="button"
                id={id}
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-stone-800 dark:border-stone-400 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                    checked ? "bg-amber-400" : "bg-stone-200 dark:bg-stone-800",
                )}
            >
                <span
                    className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white border-2 border-stone-800 dark:border-stone-400 transition-transform shadow-sm",
                        checked ? "translate-x-5" : "translate-x-1",
                    )}
                />
            </button>
        </div>
    );
}

export function SettingsPanel({
    settings,
    isHost,
    onChange,
    roomCode,
    isPrivate = false,
}: SettingsPanelProps) {
    const handleDeleteRoom = () => {
        // console.log("Emitting room:delete with", { roomCode, isHost });
        socketService.emit("room:delete", { roomCode, isHost });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 border-b-2 border-stone-100 dark:border-stone-800 pb-3">
                <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg">
                    <Settings2 className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                </div>
                <h3 className="font-bold text-stone-800 dark:text-stone-200">
                    Game Settings
                </h3>
            </div>

            <div className="space-y-5">
                {/* Word Pack */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-800 dark:text-stone-200">
                        Word Pack
                    </label>
                    <WordPackSelector
                        currentPack={settings.selectedWordPackId || settings.wordPack}
                        customWords={settings.customWords || []}
                        onChange={(selectedWordPackId, wordPackName, customWords) =>
                            onChange({
                                wordPack: selectedWordPackId,
                                selectedWordPackId,
                                wordPackName,
                                customWords,
                            })
                        }
                        isHost={isHost}
                    />
                </div>

                {/* Number of Rounds */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-stone-500">
                        <span>Rounds</span>
                        <span className="text-amber-600 dark:text-amber-400">
                            {settings.maxRounds} Rounds
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {[3, 5, 8, 10].map((num) => (
                            <button
                                key={num}
                                disabled={!isHost}
                                onClick={() => onChange({ maxRounds: num })}
                                className={cn(
                                    "flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all",
                                    settings.maxRounds === num
                                        ? "border-stone-800 dark:border-stone-300 bg-amber-400 text-stone-900 shadow-[2px_2px_0px_#1C1917]"
                                        : "border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-500",
                                )}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Round Duration */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-stone-500">
                        <span>Duration</span>
                        <span className="text-amber-600 dark:text-amber-400">
                            {settings.roundDuration}s
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {[30, 60, 90, 120].map((num) => (
                            <button
                                key={num}
                                disabled={!isHost}
                                onClick={() => onChange({ roundDuration: num })}
                                className={cn(
                                    "flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all",
                                    settings.roundDuration === num
                                        ? "border-stone-800 dark:border-stone-300 bg-amber-400 text-stone-900 shadow-[2px_2px_0px_#1C1917]"
                                        : "border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-500",
                                )}
                            >
                                {num === 120 ? "2m" : `${num}s`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-2 border-t-2 border-stone-100 dark:border-stone-800">
                    <Toggle
                        id="privateRoom"
                        checked={isPrivate}
                        onChange={(v) => onChange({ isPrivate: v })}
                        disabled={!isHost}
                        label="Private Room"
                        description={
                            isPrivate
                                ? "Hidden from Public Lobby; join by code or invite link."
                                : "Visible in Public Lobby."
                        }
                    />
                    <Toggle
                        id="enableHints"
                        checked={settings.enableHints}
                        onChange={(v) => onChange({ enableHints: v })}
                        disabled={!isHost}
                        label="Word Hints"
                        description="Gradually reveal letters over time"
                    />
                    <Toggle
                        id="enableAiClue"
                        checked={settings.enableAiClue}
                        onChange={(v) => onChange({ enableAiClue: v })}
                        disabled={!isHost}
                        label="Gemini AI Clue"
                        description="Get smart riddles from AI during the round"
                    />

                    {settings.enableAiClue && (
                        <div className="pl-4 space-y-4 pt-2 border-l-2 border-amber-200 dark:border-amber-900/50 ml-2 animate-in slide-in-from-left-2">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-stone-500">
                                    <span>Trigger at</span>
                                    <span className="text-amber-600 dark:text-amber-400">
                                        {settings.clueTriggerSeconds}s left
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={5}
                                    max={30}
                                    step={5}
                                    value={settings.clueTriggerSeconds}
                                    disabled={!isHost}
                                    onChange={(e) =>
                                        onChange({
                                            clueTriggerSeconds: Number(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                    className="w-full h-1.5 accent-amber-400 cursor-pointer disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                                    Max clues
                                </span>
                                <div className="flex gap-2">
                                    {[1, 2, 3].map((num) => (
                                        <button
                                            key={num}
                                            disabled={!isHost}
                                            onClick={() =>
                                                onChange({
                                                    maxCluesPerRound: num,
                                                })
                                            }
                                            className={cn(
                                                "flex-1 py-1 rounded-lg border-2 text-xs font-bold transition-all",
                                                settings.maxCluesPerRound ===
                                                    num
                                                    ? "border-stone-800 dark:border-stone-400 bg-amber-400 text-stone-900"
                                                    : "border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-500",
                                            )}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {isHost && (
                    <div className="pt-4 border-t-2 border-stone-100 dark:border-stone-800">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                    Delete Room
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border-2 border-stone-800 dark:border-stone-400 rounded-2xl shadow-[6px_6px_0px_#1C1917] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.1)]">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
                                        <AlertTriangle className="w-5 h-5" />
                                        Delete Room?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-stone-600 dark:text-stone-400">
                                        This will permanently close the room and
                                        remove all players. This action cannot
                                        be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl border-2 border-stone-200">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteRoom}
                                        className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-700 shadow-[2px_2px_0px_#1C1917]"
                                    >
                                        Delete Room
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>
        </div>
    );
}
