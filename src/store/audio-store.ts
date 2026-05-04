import { create } from "zustand";
import { audioManager } from "../lib/audio";

const STORAGE_KEY = "sketchrush-audio-preferences";

type AudioPreferences = {
    isMuted: boolean;
    effectVolume: number;
    musicVolume: number;
};

interface AudioStore extends AudioPreferences {
    audioUnlocked: boolean;
    isMusicPlaying: boolean;
    unlockAudio: () => void;
    toggleMute: () => void;
    setMuted: (isMuted: boolean) => void;
    setEffectVolume: (volume: number) => void;
    setMusicVolume: (volume: number) => void;
    startMusic: () => void;
    pauseMusic: () => void;
    stopMusic: () => void;
}

function clampVolume(value: number) {
    if (!Number.isFinite(value)) return 0;
    return Math.min(1, Math.max(0, value));
}

function loadPreferences(): AudioPreferences {
    if (typeof window === "undefined") {
        return { isMuted: false, effectVolume: 0.45, musicVolume: 0.22 };
    }
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return { isMuted: false, effectVolume: 0.45, musicVolume: 0.22 };
        const parsed = JSON.parse(raw) as Partial<AudioPreferences>;
        return {
            isMuted: Boolean(parsed.isMuted),
            effectVolume: clampVolume(parsed.effectVolume ?? 0.45),
            musicVolume: clampVolume(parsed.musicVolume ?? 0.22),
        };
    } catch {
        return { isMuted: false, effectVolume: 0.45, musicVolume: 0.22 };
    }
}

function savePreferences(preferences: AudioPreferences) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

const initialPreferences = loadPreferences();
audioManager.configure({
    muted: initialPreferences.isMuted,
    effectVolume: initialPreferences.effectVolume,
    musicVolume: initialPreferences.musicVolume,
});

export const useAudioStore = create<AudioStore>((set, get) => ({
    ...initialPreferences,
    audioUnlocked: false,
    isMusicPlaying: false,

    unlockAudio: () => {
        audioManager.unlock();
        set({ audioUnlocked: true });
    },

    toggleMute: () => {
        const nextMuted = !get().isMuted;
        get().setMuted(nextMuted);
    },

    setMuted: (isMuted) => {
        const next = { ...get(), isMuted };
        audioManager.configure({
            muted: isMuted,
            effectVolume: next.effectVolume,
            musicVolume: next.musicVolume,
        });
        savePreferences({
            isMuted,
            effectVolume: next.effectVolume,
            musicVolume: next.musicVolume,
        });
        set({ isMuted, isMusicPlaying: isMuted ? false : get().isMusicPlaying });
        if (!isMuted && get().audioUnlocked) {
            get().startMusic();
        }
    },

    setEffectVolume: (effectVolume) => {
        const nextVolume = clampVolume(effectVolume);
        audioManager.configure({
            muted: get().isMuted,
            effectVolume: nextVolume,
            musicVolume: get().musicVolume,
        });
        savePreferences({
            isMuted: get().isMuted,
            effectVolume: nextVolume,
            musicVolume: get().musicVolume,
        });
        set({ effectVolume: nextVolume });
    },

    setMusicVolume: (musicVolume) => {
        const nextVolume = clampVolume(musicVolume);
        audioManager.configure({
            muted: get().isMuted,
            effectVolume: get().effectVolume,
            musicVolume: nextVolume,
        });
        savePreferences({
            isMuted: get().isMuted,
            effectVolume: get().effectVolume,
            musicVolume: nextVolume,
        });
        set({ musicVolume: nextVolume });
    },

    startMusic: () => {
        if (get().isMuted || !get().audioUnlocked) return;
        audioManager.playBackgroundMusic();
        set({ isMusicPlaying: true });
    },

    pauseMusic: () => {
        audioManager.pauseBackgroundMusic();
        set({ isMusicPlaying: false });
    },

    stopMusic: () => {
        audioManager.stopBackgroundMusic();
        set({ isMusicPlaying: false });
    },
}));
