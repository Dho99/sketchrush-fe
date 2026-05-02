import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { WordOption } from "../../lib/types";
import { cn } from "../../lib/utils";

interface WordSelectionModalProps {
  options: WordOption[];
  isSelecting: boolean;
  onSelect: (optionId: string) => void;
}

export function WordSelectionModal({
  options,
  isSelecting,
  onSelect,
}: WordSelectionModalProps) {
  const [selectedOptionId, setSelectedOptionId] = useState(options[0]?.id || "");

  const handleSubmit = () => {
    if (!selectedOptionId || isSelecting) return;
    onSelect(selectedOptionId);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border-2 border-stone-800 dark:border-stone-400 bg-white dark:bg-stone-900 shadow-[8px_8px_0px_#1C1917] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.1)] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b-2 border-stone-100 dark:border-stone-800">
          <h2
            className="text-2xl font-black text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Fredoka One', sans-serif" }}
          >
            Choose your word
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            You will draw this word in the next round.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOptionId(option.id)}
                  disabled={isSelecting}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border-2 p-4 text-left transition-all",
                    isSelected
                      ? "border-stone-800 dark:border-stone-300 bg-amber-100 dark:bg-amber-900/30 shadow-[3px_3px_0px_#1C1917]"
                      : "border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800",
                    isSelecting && "opacity-70 cursor-not-allowed",
                  )}
                >
                  <span className="text-lg font-black text-stone-900 dark:text-stone-100">
                    {option.label}
                  </span>
                  {isSelected && <Check className="w-5 h-5 text-amber-600" />}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedOptionId || isSelecting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-stone-800 dark:border-stone-400 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold shadow-[3px_3px_0px_#1C1917] active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 transition-all"
          >
            {isSelecting && <Loader2 className="w-4 h-4 animate-spin" />}
            Select Word
          </button>
        </div>
      </div>
    </div>
  );
}
