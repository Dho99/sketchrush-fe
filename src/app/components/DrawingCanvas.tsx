import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Pencil, Eraser, Undo2, Trash2 } from "lucide-react";
import type { DrawingTool, Stroke, Point } from "../../lib/types";
import { cn } from "../../lib/utils";
import throttle from "lodash/throttle";

// Canvas resolution (internal drawing space)
const CANVAS_W = 800;
const CANVAS_H = 550;

const COLORS = [
    "#1C1917",
    "#EF4444",
    "#F97316",
    "#F59E0B",
    "#22C55E",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#FFFFFF",
    "#78716C",
    "#7C3AED",
    "#0EA5E9",
];

const BRUSH_SIZES = [
    { label: "XS", value: 3 },
    { label: "S", value: 6 },
    { label: "M", value: 12 },
    { label: "L", value: 22 },
];

interface DrawingCanvasProps {
    isDrawer: boolean;
    initialStrokes?: Stroke[];
    onStrokeComplete?: (stroke: Stroke) => void;
    onClear?: () => void;
    onUndo?: () => void;
}

function drawStrokeOnCtx(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length < 2) {
        if (stroke.tool === 'clear') {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        }
        return;
    }
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
        const prev = stroke.points[i - 1];
        const curr = stroke.points[i];
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    ctx.strokeStyle = stroke.tool === "eraser" ? "#FFFFFF" : stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
}

export function DrawingCanvas({
    isDrawer,
    initialStrokes = [],
    onStrokeComplete,
    onClear,
    onUndo,
}: DrawingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const currentPointsRef = useRef<Point[]>([]);

    const [tool, setTool] = useState<DrawingTool>("pencil");
    const [color, setColor] = useState("#1C1917");
    const [brushSize, setBrushSize] = useState(6);
    const [cursorDot, setCursorDot] = useState<{
        x: number;
        y: number;
        size: number;
    } | null>(null);

    const redrawAll = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        initialStrokes.forEach((s) => drawStrokeOnCtx(ctx, s));
    }, [initialStrokes]);

    useEffect(() => {
        redrawAll();
    }, [redrawAll]);

    const getPoint = useCallback((clientX: number, clientY: number): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left) * (CANVAS_W / rect.width),
            y: (clientY - rect.top) * (CANVAS_H / rect.height),
        };
    }, []);

    const updateCursorDot = useCallback(
        (clientX: number, clientY: number) => {
            if (!isDrawer) return;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const scaledBrushSize = brushSize * (rect.width / CANVAS_W);
            setCursorDot({
                x: clientX - rect.left,
                y: clientY - rect.top,
                size: Math.max(8, Math.min(42, scaledBrushSize)),
            });
        },
        [brushSize, isDrawer],
    );

    const startDrawing = useCallback(
        (x: number, y: number) => {
            if (!isDrawer) return;
            isDrawingRef.current = true;
            currentPointsRef.current = [{ x, y }];
            const ctx = canvasRef.current?.getContext("2d");
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(x, y);
            }
        },
        [isDrawer],
    );

    const throttledPointAdd = useMemo(() => throttle((x: number, y: number, ctx: CanvasRenderingContext2D) => {
        currentPointsRef.current.push({ x, y });
        const pts = currentPointsRef.current;
        if (pts.length < 2) return;
        
        ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const prev = pts[pts.length - 2];
        const curr = pts[pts.length - 1];
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.stroke();
    }, 16), [tool, color, brushSize]);

    const continueDrawing = useCallback(
        (x: number, y: number) => {
            if (!isDrawingRef.current || !isDrawer) return;
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) return;
            throttledPointAdd(x, y, ctx);
        },
        [isDrawer, throttledPointAdd],
    );

    const endDrawing = useCallback(() => {
        if (!isDrawingRef.current || !isDrawer) return;
        isDrawingRef.current = false;
        throttledPointAdd.flush();

        const pts = [...currentPointsRef.current];
        if (pts.length < 2) return;

        const stroke: Stroke = {
            id: Math.random().toString(36).substr(2, 9),
            points: pts,
            color,
            size: brushSize,
            tool,
            timestamp: Date.now(),
        };

        onStrokeComplete?.(stroke);
        currentPointsRef.current = [];
    }, [isDrawer, color, brushSize, tool, onStrokeComplete, throttledPointAdd]);

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
        updateCursorDot(e.clientX, e.clientY);
        const { x, y } = getPoint(e.clientX, e.clientY);
        startDrawing(x, y);
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        updateCursorDot(e.clientX, e.clientY);
        const { x, y } = getPoint(e.clientX, e.clientY);
        continueDrawing(x, y);
    };
    const handleMouseUp = () => endDrawing();
    const handleMouseLeave = () => {
        setCursorDot(null);
        endDrawing();
    };

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        const t = e.touches[0];
        updateCursorDot(t.clientX, t.clientY);
        const { x, y } = getPoint(t.clientX, t.clientY);
        startDrawing(x, y);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        const t = e.touches[0];
        updateCursorDot(t.clientX, t.clientY);
        const { x, y } = getPoint(t.clientX, t.clientY);
        continueDrawing(x, y);
    };
    const handleTouchEnd = () => {
        setCursorDot(null);
        endDrawing();
    };

    const handleUndo = () => {
        onUndo?.();
    };

    const handleClear = () => {
        onClear?.();
    };

    return (
        <div className="flex flex-col h-full gap-2">
            {/* Toolbar for drawer */}
            {isDrawer && (
                <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-white dark:bg-stone-900 border-b-2 border-stone-200 dark:border-stone-700">
                    {/* Tool selection */}
                    <div className="flex gap-1">
                        <button
                            onClick={() => setTool("pencil")}
                            aria-label="Pencil tool"
                            className={cn(
                                "p-2 rounded-lg border-2 transition-colors",
                                tool === "pencil"
                                    ? "border-stone-800 dark:border-stone-300 bg-amber-400 text-stone-900"
                                    : "border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300",
                            )}
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setTool("eraser")}
                            aria-label="Eraser tool"
                            className={cn(
                                "p-2 rounded-lg border-2 transition-colors",
                                tool === "eraser"
                                    ? "border-stone-800 dark:border-stone-300 bg-amber-400 text-stone-900"
                                    : "border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300",
                            )}
                        >
                            <Eraser className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-stone-200 dark:bg-stone-700" />

                    {/* Brush sizes */}
                    <div className="flex gap-1 items-center">
                        {BRUSH_SIZES.map((s) => (
                            <button
                                key={s.label}
                                onClick={() => setBrushSize(s.value)}
                                aria-label={`Brush size ${s.label}`}
                                className={cn(
                                    "w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors text-xs",
                                    brushSize === s.value
                                        ? "border-stone-800 dark:border-stone-300 bg-amber-400 text-stone-900"
                                        : "border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400",
                                )}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-stone-200 dark:bg-stone-700" />

                    {/* Color picker */}
                    <div className="flex flex-wrap gap-1">
                        {COLORS.map((c) => (
                            <button
                                key={c}
                                onClick={() => {
                                    setColor(c);
                                    setTool("pencil");
                                }}
                                aria-label={`Color ${c}`}
                                className={cn(
                                    "w-6 h-6 rounded-lg border-2 transition-transform",
                                    color === c && tool !== "eraser"
                                        ? "border-stone-800 dark:border-stone-200 scale-125"
                                        : "border-stone-300 dark:border-stone-600 hover:scale-110",
                                )}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-stone-200 dark:bg-stone-700" />

                    {/* Actions */}
                    <div className="flex gap-1 ml-auto">
                        <button
                            onClick={handleUndo}
                            aria-label="Undo last stroke"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-2 border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs text-stone-700 dark:text-stone-300"
                        >
                            <Undo2 className="w-3.5 h-3.5" />
                            Undo
                        </button>
                        <button
                            onClick={handleClear}
                            aria-label="Clear canvas"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-2 border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-xs text-rose-600 dark:text-rose-400"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Canvas area */}
            <div className="flex-1 flex items-center justify-center min-h-0 p-2">
                <div
                    className="relative w-full h-full max-h-full"
                    style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
                >
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_W}
                        height={CANVAS_H}
                        className={cn(
                            "w-full h-full border-2 border-stone-800 dark:border-stone-600 rounded-xl",
                            "shadow-[4px_4px_0_#1C1917] dark:shadow-[4px_4px_0_rgba(255,255,255,0.1)]",
                            "bg-white",
                            isDrawer ? "cursor-none" : "cursor-default",
                        )}
                        onMouseDown={isDrawer ? handleMouseDown : undefined}
                        onMouseMove={isDrawer ? handleMouseMove : undefined}
                        onMouseUp={isDrawer ? handleMouseUp : undefined}
                        onMouseLeave={isDrawer ? handleMouseLeave : undefined}
                        onTouchStart={isDrawer ? handleTouchStart : undefined}
                        onTouchMove={isDrawer ? handleTouchMove : undefined}
                        onTouchEnd={isDrawer ? handleTouchEnd : undefined}
                        aria-label={
                            isDrawer
                                ? "Drawing canvas – draw the secret word"
                                : "Drawing canvas – read only, guess the word in chat"
                        }
                    />

                    {isDrawer && cursorDot && (
                        <div
                            className={cn(
                                "absolute rounded-full border-2 pointer-events-none -translate-x-1/2 -translate-y-1/2 z-10",
                                tool === "eraser"
                                    ? "border-rose-500 bg-white/35 shadow-[0_0_0_1px_rgba(28,25,23,0.35)]"
                                    : "border-white shadow-[0_0_0_1px_rgba(28,25,23,0.55)]",
                            )}
                            style={{
                                left: cursorDot.x,
                                top: cursorDot.y,
                                width: cursorDot.size,
                                height: cursorDot.size,
                                backgroundColor:
                                    tool === "eraser"
                                        ? "rgba(255,255,255,0.45)"
                                        : color,
                            }}
                        />
                    )}

                    {/* Overlay hint for viewers */}
                    {!isDrawer && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 text-white text-xs rounded-full pointer-events-none backdrop-blur-sm">
                            👀 Watching – type your guess in chat!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
