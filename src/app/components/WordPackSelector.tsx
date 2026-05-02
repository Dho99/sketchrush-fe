import { useState } from "react";
import { Plus, X, Package } from "lucide-react";
import { WORD_PACKS } from "../../lib/mock-data";
import { cn } from "../../lib/utils";

interface WordPackSelectorProps {
    currentPack: string;
    customWords: string[];
    isHost: boolean;
    onChange: (packId: string, wordPackName: string, customWords?: string[]) => void;
}

export function WordPackSelector({
    currentPack,
    customWords,
    isHost,
    onChange,
}: WordPackSelectorProps) {
    const [newWord, setNewWord] = useState("");
    const showCustom = currentPack === "custom";

    const handleAddWord = (e: React.FormEvent) => {
        e.preventDefault();
        const word = newWord.trim().toLowerCase();
        if (!word || customWords.includes(word)) return;
        onChange("custom", "Custom", [...customWords, word]);
        setNewWord("");
    };

    const handleRemoveWord = (word: string) => {
        onChange(
            "custom",
            "Custom",
            customWords.filter((w) => w !== word),
        );
    };

    const handleImportSample = () => {
        const sample = [
            "rumah",
            "mobil",
            "kucing",
            "buku",
            "pohon",
            "matahari",
        ];
        onChange("custom", "Custom", [...new Set([...customWords, ...sample])]);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                <label className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                    Word Pack
                </label>
            </div>

            {/* Pack grid */}
            <div className="grid grid-cols-2 gap-1.5">
                {WORD_PACKS.map((pack) => (
                    <button
                        key={pack.id}
                        disabled={!isHost}
                        onClick={() => {
                            onChange(pack.id, pack.name, customWords);
                        }}
                        className={cn(
                            "flex items-center gap-2 p-2 rounded-xl border-2 text-left transition-colors",
                            currentPack === pack.id && !showCustom
                                ? "border-stone-800 dark:border-stone-400 bg-amber-100 dark:bg-amber-900/30"
                                : "border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800",
                            !isHost && "opacity-50 cursor-not-allowed",
                        )}
                    >
                        <span className="text-lg" aria-hidden>
                            {pack.emoji}
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                                {pack.name}
                            </p>
                            <p className="text-xs text-stone-400 dark:text-stone-500">
                                {pack.words.length} words
                            </p>
                        </div>
                    </button>
                ))}

                {/* Custom pack button */}
                <button
                    disabled={!isHost}
                    onClick={() => onChange("custom", "Custom", customWords)}
                    className={cn(
                        "flex items-center gap-2 p-2 rounded-xl border-2 text-left transition-colors",
                        showCustom
                            ? "border-stone-800 dark:border-stone-400 bg-violet-100 dark:bg-violet-900/30"
                            : "border-dashed border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800",
                        !isHost && "opacity-50 cursor-not-allowed",
                    )}
                >
                    <span className="text-lg" aria-hidden>
                        ✏️
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                            Custom
                        </p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">
                            {customWords.length} words
                        </p>
                    </div>
                </button>
            </div>

            {/* Custom word input */}
            {showCustom && isHost && (
                <div className="space-y-2 p-3 rounded-xl border-2 border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/10">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-violet-700 dark:text-violet-300">
                            Custom Words ({customWords.length})
                        </p>
                        <button
                            onClick={handleImportSample}
                            className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                        >
                            Import samples
                        </button>
                    </div>

                    {/* Word list */}
                    {customWords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                            {customWords.map((word) => (
                                <span
                                    key={word}
                                    className="flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-stone-800 border border-violet-300 dark:border-violet-700 rounded-lg text-xs text-stone-800 dark:text-stone-200"
                                >
                                    {word}
                                    <button
                                        onClick={() => handleRemoveWord(word)}
                                        aria-label={`Remove word ${word}`}
                                        className="text-rose-400 hover:text-rose-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Add word form */}
                    <form onSubmit={handleAddWord} className="flex gap-2">
                        <input
                            value={newWord}
                            onChange={(e) => setNewWord(e.target.value)}
                            placeholder="Add a word..."
                            aria-label="Add custom word"
                            className="flex-1 px-2.5 py-1.5 rounded-lg border-2 border-violet-300 dark:border-violet-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs placeholder:text-stone-400 focus:outline-none focus:border-violet-500 transition-colors"
                            maxLength={40}
                        />
                        <button
                            type="submit"
                            disabled={!newWord.trim()}
                            aria-label="Add word"
                            className="p-1.5 rounded-lg border-2 border-violet-500 dark:border-violet-600 bg-violet-500 hover:bg-violet-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
