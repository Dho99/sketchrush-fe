import { useEffect } from "react";
import { audioManager } from "../lib/audio";
import { useAudioStore } from "../store/audio-store";

function isInteractiveAudioTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    const interactive = target.closest<HTMLElement>(
        'button, a, [role="button"], input[type="button"], input[type="submit"]',
    );
    if (!interactive) return false;
    if (interactive.dataset.audio === "off") return false;
    if (interactive.hasAttribute("disabled")) return false;
    if (interactive.getAttribute("aria-disabled") === "true") return false;
    return true;
}

export function useGlobalAudio() {
    const unlockAudio = useAudioStore((state) => state.unlockAudio);
    const startMusic = useAudioStore((state) => state.startMusic);

    useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            if (!isInteractiveAudioTarget(event.target)) return;
            unlockAudio();
            audioManager.playClick();
            startMusic();
        };

        window.addEventListener("pointerdown", handlePointerDown, { capture: true });
        return () => {
            window.removeEventListener("pointerdown", handlePointerDown, { capture: true });
        };
    }, [startMusic, unlockAudio]);
}
