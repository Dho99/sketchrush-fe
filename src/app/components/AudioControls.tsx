import { Volume2, VolumeX } from "lucide-react";
import { useAudioStore } from "../../store/audio-store";
import { cn } from "../../lib/utils";

interface AudioControlsProps {
    className?: string;
}

export function AudioControls({ className }: AudioControlsProps) {
    const isMuted = useAudioStore((state) => state.isMuted);
    const musicVolume = useAudioStore((state) => state.musicVolume);
    const toggleMute = useAudioStore((state) => state.toggleMute);
    const setMusicVolume = useAudioStore((state) => state.setMusicVolume);

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                title={isMuted ? "Unmute audio" : "Mute audio"}
                className="p-2 rounded-xl border-2 border-stone-200 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-400"
            >
                {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                ) : (
                    <Volume2 className="w-4 h-4" />
                )}
            </button>
            <label className="hidden md:flex items-center">
                <span className="sr-only">Music volume</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : musicVolume}
                    onChange={(event) => setMusicVolume(Number(event.target.value))}
                    className="w-20 accent-amber-500"
                    aria-label="Music volume"
                />
            </label>
        </div>
    );
}
