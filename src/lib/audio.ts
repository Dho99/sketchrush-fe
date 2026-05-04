type SoundName = "click" | "correct" | "wrong" | "roundStart" | "gameEnd" | "playerJoin";

type AudioSettings = {
    muted: boolean;
    effectVolume: number;
    musicVolume: number;
};

const SOUND_PATHS: Record<SoundName, string> = {
    click: "/sounds/click.mp3",
    correct: "/sounds/correct.mp3",
    wrong: "/sounds/wrong.mp3",
    roundStart: "/sounds/round-start.mp3",
    gameEnd: "/sounds/game-end.mp3",
    playerJoin: "/sounds/player-join.mp3",
};

const BACKGROUND_MUSIC_PATH = "/sounds/background.mp3";
const USE_LOCAL_AUDIO_FILES = true;
const BACKGROUND_MUSIC_ELEMENT_ID = "sketchrush-background-music";

const FALLBACK_FREQUENCIES: Record<SoundName, number[]> = {
    click: [520],
    correct: [660, 880],
    wrong: [220, 180],
    roundStart: [440, 660, 880],
    gameEnd: [523, 659, 784, 1047],
    playerJoin: [392, 523],
};

function clampVolume(value: number) {
    if (!Number.isFinite(value)) return 0;
    return Math.min(1, Math.max(0, value));
}

class AudioManager {
    private sounds = new Map<SoundName, HTMLAudioElement>();
    private backgroundMusic: HTMLAudioElement | null = null;
    private backgroundPlayPromise: Promise<void> | null = null;
    private audioContext: AudioContext | null = null;
    private fallbackMusicTimer: number | null = null;
    private fallbackMusicPlaying = false;
    private unlocked = false;
    private settings: AudioSettings = {
        muted: false,
        effectVolume: 0.45,
        musicVolume: 0.22,
    };

    configure(settings: Partial<AudioSettings>) {
        this.settings = {
            ...this.settings,
            ...settings,
            effectVolume: clampVolume(settings.effectVolume ?? this.settings.effectVolume),
            musicVolume: clampVolume(settings.musicVolume ?? this.settings.musicVolume),
        };
        this.sounds.forEach((sound) => {
            sound.volume = this.settings.muted ? 0 : this.settings.effectVolume;
        });
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.settings.muted ? 0 : this.settings.musicVolume;
        }
        if (this.settings.muted) {
            this.pauseBackgroundMusic();
        }
    }

    unlock() {
        if (this.unlocked) return;
        this.unlocked = true;
        this.ensureAudioContext()?.resume().catch(() => {});
    }

    isUnlocked() {
        return this.unlocked;
    }

    playClick() {
        this.playSound("click");
    }

    playCorrect() {
        this.playSound("correct");
    }

    playWrong() {
        this.playSound("wrong");
    }

    playRoundStart() {
        this.playSound("roundStart");
    }

    playGameEnd() {
        this.playSound("gameEnd");
    }

    playPlayerJoin() {
        this.playSound("playerJoin");
    }

    playBackgroundMusic() {
        if (this.settings.muted || !this.unlocked) return;
        if (!USE_LOCAL_AUDIO_FILES) {
            this.startFallbackMusic();
            return;
        }
        const music = this.ensureBackgroundMusic();
        if (!music.paused || this.backgroundPlayPromise) return;
        music.volume = this.settings.musicVolume;
        this.backgroundPlayPromise = music
            .play()
            .catch(() => {
                this.startFallbackMusic();
            })
            .finally(() => {
                this.backgroundPlayPromise = null;
            });
    }

    pauseBackgroundMusic() {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
        }
        this.stopFallbackMusic();
    }

    resumeBackgroundMusic() {
        this.playBackgroundMusic();
    }

    stopBackgroundMusic() {
        this.pauseBackgroundMusic();
        if (this.backgroundMusic) {
            this.backgroundMusic.currentTime = 0;
        }
    }

    private playSound(name: SoundName) {
        if (this.settings.muted || !this.unlocked) return;
        if (!USE_LOCAL_AUDIO_FILES) {
            this.playFallbackTone(name);
            return;
        }
        const sound = this.ensureSound(name);
        sound.volume = this.settings.effectVolume;
        sound.currentTime = 0;
        sound.play().catch(() => {
            this.playFallbackTone(name);
        });
    }

    private ensureSound(name: SoundName) {
        const existing = this.sounds.get(name);
        if (existing) return existing;
        const sound = new Audio(SOUND_PATHS[name]);
        sound.preload = "auto";
        sound.volume = this.settings.effectVolume;
        this.sounds.set(name, sound);
        return sound;
    }

    private ensureBackgroundMusic() {
        if (this.backgroundMusic) return this.backgroundMusic;
        if (typeof document === "undefined") {
            return new Audio(BACKGROUND_MUSIC_PATH);
        }
        const existing = document.getElementById(BACKGROUND_MUSIC_ELEMENT_ID);
        const music =
            existing instanceof HTMLAudioElement
                ? existing
                : document.createElement("audio");

        if (!existing) {
            music.id = BACKGROUND_MUSIC_ELEMENT_ID;
            music.src = BACKGROUND_MUSIC_PATH;
            music.style.display = "none";
            music.setAttribute("aria-hidden", "true");
            document.body.appendChild(music);
        }

        music.loop = true;
        music.preload = "auto";
        music.volume = this.settings.musicVolume;
        this.backgroundMusic = music;
        return music;
    }

    private ensureAudioContext() {
        if (typeof window === "undefined") return null;
        if (this.audioContext) return this.audioContext;
        const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextCtor) return null;
        this.audioContext = new AudioContextCtor();
        return this.audioContext;
    }

    private playFallbackTone(name: SoundName) {
        const context = this.ensureAudioContext();
        if (!context) return;
        const frequencies = FALLBACK_FREQUENCIES[name];
        frequencies.forEach((frequency, index) => {
            const startAt = context.currentTime + index * 0.08;
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = name === "wrong" ? "sawtooth" : "triangle";
            oscillator.frequency.setValueAtTime(frequency, startAt);
            gain.gain.setValueAtTime(0, startAt);
            gain.gain.linearRampToValueAtTime(this.settings.effectVolume * 0.18, startAt + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.13);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(startAt);
            oscillator.stop(startAt + 0.15);
        });
    }

    private startFallbackMusic() {
        const context = this.ensureAudioContext();
        if (!context || this.fallbackMusicPlaying || this.settings.muted || !this.unlocked) return;
        this.fallbackMusicPlaying = true;
        const notes = [196, 247, 294, 247];
        let step = 0;
        const playNote = () => {
            if (!this.fallbackMusicPlaying || this.settings.muted) return;
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            const startAt = context.currentTime;
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(notes[step % notes.length], startAt);
            gain.gain.setValueAtTime(0, startAt);
            gain.gain.linearRampToValueAtTime(this.settings.musicVolume * 0.08, startAt + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.7);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(startAt);
            oscillator.stop(startAt + 0.8);
            step += 1;
        };
        playNote();
        this.fallbackMusicTimer = window.setInterval(playNote, 900);
    }

    private stopFallbackMusic() {
        this.fallbackMusicPlaying = false;
        if (this.fallbackMusicTimer !== null) {
            window.clearInterval(this.fallbackMusicTimer);
            this.fallbackMusicTimer = null;
        }
    }
}

export const audioManager = new AudioManager();

export const audioAssets = {
    sounds: SOUND_PATHS,
    backgroundMusic: BACKGROUND_MUSIC_PATH,
    usingLocalFiles: USE_LOCAL_AUDIO_FILES,
};
