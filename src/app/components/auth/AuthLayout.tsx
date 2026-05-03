import { Link } from "react-router";
import { Palette, Pencil, Sparkles } from "lucide-react";
import type React from "react";
import { cn } from "../../../lib/utils";

function DoodleSwoop({ className }: { className?: string }) {
    return (
        <svg
            className={cn("pointer-events-none absolute h-16 w-28", className)}
            viewBox="0 0 112 64"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="4"
            aria-hidden
        >
            <path d="M8 42 C28 10 52 54 74 24 C84 10 96 14 104 28" />
            <path d="M88 22 L104 28 L94 42" />
        </svg>
    );
}

export function AuthLayout({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <section className="relative min-h-[calc(100vh-66px)] overflow-hidden px-4 py-10 items-center sm:flex sm:px-6 lg:px-8">
            <DoodleSwoop className="left-[8%] top-14 hidden rotate-[-8deg] text-violet-400/70 sm:block" />
            <DoodleSwoop className="bottom-20 right-[8%] hidden rotate-[12deg] text-sky-400/70 sm:block" />

            <div className="mx-auto grid max-w-5xl w-full items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="hidden space-y-6 lg:block">
                    <Link to="/" className="inline-flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-stone-800 bg-amber-400 text-stone-900 shadow-[4px_4px_0px_#1C1917] dark:border-stone-500 dark:shadow-[4px_4px_0px_rgba(255,255,255,0.12)]">
                            <Pencil className="h-6 w-6" />
                        </span>
                        <span
                            className="text-3xl text-stone-900 dark:text-stone-100"
                            style={{ fontFamily: "'Fredoka One', sans-serif" }}
                        >
                            SketchRush
                        </span>
                    </Link>

                    <div className="relative rounded-3xl border-2 border-stone-800 bg-white p-6 shadow-[6px_6px_0px_#1C1917] dark:border-stone-500 dark:bg-stone-900 dark:shadow-[6px_6px_0px_rgba(255,255,255,0.12)]">
                        <div className="mb-5 flex items-center gap-3">
                            <span className="rounded-2xl border-2 border-stone-800 bg-pink-400 p-3 text-white dark:border-stone-500">
                                <Palette className="h-6 w-6" />
                            </span>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                                    Player profile
                                </p>
                                <h2
                                    className="text-3xl text-stone-900 dark:text-stone-100"
                                    style={{
                                        fontFamily: "'Fredoka One', sans-serif",
                                    }}
                                >
                                    Save your best rounds
                                </h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                "bg-amber-300",
                                "bg-sky-300",
                                "bg-emerald-300",
                                "bg-pink-300",
                                "bg-violet-300",
                                "bg-orange-300",
                            ].map((color) => (
                                <div
                                    key={color}
                                    className={cn(
                                        "aspect-square rounded-2xl border-2 border-stone-800 shadow-[2px_2px_0px_#1C1917] dark:border-stone-600",
                                        color,
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-md">
                    <Sparkles
                        className="absolute -right-3 -top-4 h-8 w-8 rotate-12 text-amber-400"
                        aria-hidden
                    />
                    <div className="rounded-3xl border-2 border-stone-800 bg-white p-5 shadow-[6px_6px_0px_#1C1917] dark:border-stone-500 dark:bg-stone-900 dark:shadow-[6px_6px_0px_rgba(255,255,255,0.12)] sm:p-7">
                        <div className="mb-6 space-y-2 text-center">
                            <h1
                                className="text-4xl text-stone-900 dark:text-stone-100"
                                style={{
                                    fontFamily: "'Fredoka One', sans-serif",
                                }}
                            >
                                {title}
                            </h1>
                            <p className="text-sm text-stone-500 dark:text-stone-400">
                                {subtitle}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}
