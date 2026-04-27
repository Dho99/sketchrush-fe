import { useRef, useEffect, useState, useCallback } from 'react';
import { Pencil, Eraser, Undo2, Trash2 } from 'lucide-react';
import type { DrawingTool, Stroke, Point } from '../../lib/types';
import { sendStroke, clearCanvas as clearCanvasSocket, undoStroke as undoStrokeSocket } from '../../lib/socket-placeholder';
import { cn, generateId } from '../../lib/utils';

// Canvas resolution (internal drawing space)
const CANVAS_W = 800;
const CANVAS_H = 550;

const COLORS = [
  '#1C1917', '#EF4444', '#F97316', '#F59E0B',
  '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899',
  '#FFFFFF', '#78716C', '#7C3AED', '#0EA5E9',
];

const BRUSH_SIZES = [
  { label: 'XS', value: 3 },
  { label: 'S', value: 6 },
  { label: 'M', value: 12 },
  { label: 'L', value: 22 },
];

interface DrawingCanvasProps {
  isDrawer: boolean;
  initialStrokes?: Stroke[];
  onStrokeComplete?: (stroke: Stroke) => void;
  onClear?: () => void;
  onUndo?: () => void;
}

function drawStrokeOnCtx(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  if (stroke.points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i++) {
    const prev = stroke.points[i - 1];
    const curr = stroke.points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
  }
  ctx.strokeStyle = stroke.tool === 'eraser' ? '#FFFFFF' : stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

export function DrawingCanvas({ isDrawer, initialStrokes = [], onStrokeComplete, onClear, onUndo }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<Point[]>([]);
  const strokesRef = useRef<Stroke[]>(initialStrokes);

  const [tool, setTool] = useState<DrawingTool>('pencil');
  const [color, setColor] = useState('#1C1917');
  const [brushSize, setBrushSize] = useState(6);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    strokesRef.current.forEach((s) => drawStrokeOnCtx(ctx, s));
  }, []);

  // Sync external strokes
  useEffect(() => {
    strokesRef.current = initialStrokes;
    redrawAll();
  }, [initialStrokes, redrawAll]);

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

  const startDrawing = useCallback((x: number, y: number) => {
    if (!isDrawer) return;
    isDrawingRef.current = true;
    currentPointsRef.current = [{ x, y }];
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  }, [isDrawer]);

  const continueDrawing = useCallback((x: number, y: number) => {
    if (!isDrawingRef.current || !isDrawer) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pts = currentPointsRef.current;
    pts.push({ x, y });

    // Live draw on canvas
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const prev = pts[pts.length - 2];
    const curr = pts[pts.length - 1];
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.stroke();
  }, [isDrawer, tool, color, brushSize]);

  const endDrawing = useCallback(() => {
    if (!isDrawingRef.current || !isDrawer) return;
    isDrawingRef.current = false;

    const pts = [...currentPointsRef.current];
    if (pts.length < 2) return;

    const stroke: Stroke = {
      id: generateId(),
      points: pts,
      color,
      size: brushSize,
      tool,
      timestamp: Date.now(),
    };

    strokesRef.current = [...strokesRef.current, stroke];
    onStrokeComplete?.(stroke);

    // Placeholder: send via socket
    sendStroke({ id: stroke.id, points: stroke.points, color: stroke.color, size: stroke.size, tool: stroke.tool, timestamp: stroke.timestamp });

    currentPointsRef.current = [];
  }, [isDrawer, color, brushSize, tool, onStrokeComplete]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getPoint(e.clientX, e.clientY);
    startDrawing(x, y);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getPoint(e.clientX, e.clientY);
    continueDrawing(x, y);
  };
  const handleMouseUp = () => endDrawing();
  const handleMouseLeave = () => endDrawing();

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    const { x, y } = getPoint(t.clientX, t.clientY);
    startDrawing(x, y);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    const { x, y } = getPoint(t.clientX, t.clientY);
    continueDrawing(x, y);
  };
  const handleTouchEnd = () => endDrawing();

  const handleUndo = () => {
    strokesRef.current = strokesRef.current.slice(0, -1);
    redrawAll();
    onUndo?.();
    undoStrokeSocket();
  };

  const handleClear = () => {
    strokesRef.current = [];
    redrawAll();
    onClear?.();
    clearCanvasSocket();
  };

  // Placeholder functions (exposed for socket integration)
  const handleDrawStroke = (stroke: Stroke) => {
    // TODO: Called when receiving 'draw:stroke' socket event from server
    strokesRef.current = [...strokesRef.current, stroke];
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawStrokeOnCtx(ctx, stroke);
  };

  const handleClearCanvas = () => {
    // TODO: Called when receiving 'draw:clear' socket event from server
    handleClear();
  };

  const handleUndoStroke = () => {
    // TODO: Called when receiving 'draw:undo' socket event from server
    handleUndo();
  };

  // Expose for external use (debugging)
  void handleDrawStroke;
  void handleClearCanvas;
  void handleUndoStroke;

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Toolbar for drawer */}
      {isDrawer && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-white dark:bg-stone-900 border-b-2 border-stone-200 dark:border-stone-700">
          {/* Tool selection */}
          <div className="flex gap-1">
            <button
              onClick={() => setTool('pencil')}
              aria-label="Pencil tool"
              className={cn(
                'p-2 rounded-lg border-2 transition-colors',
                tool === 'pencil'
                  ? 'border-stone-800 dark:border-stone-300 bg-amber-400 text-stone-900'
                  : 'border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300',
              )}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              aria-label="Eraser tool"
              className={cn(
                'p-2 rounded-lg border-2 transition-colors',
                tool === 'eraser'
                  ? 'border-stone-800 dark:border-stone-300 bg-amber-400 text-stone-900'
                  : 'border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300',
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
                  'w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors text-xs',
                  brushSize === s.value
                    ? 'border-stone-800 dark:border-stone-300 bg-amber-400 text-stone-900'
                    : 'border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400',
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
                onClick={() => { setColor(c); setTool('pencil'); }}
                aria-label={`Color ${c}`}
                className={cn(
                  'w-6 h-6 rounded-lg border-2 transition-transform',
                  color === c && tool !== 'eraser'
                    ? 'border-stone-800 dark:border-stone-200 scale-125'
                    : 'border-stone-300 dark:border-stone-600 hover:scale-110',
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
              'w-full h-full border-2 border-stone-800 dark:border-stone-600 rounded-xl',
              'shadow-[4px_4px_0px_#1C1917] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.1)]',
              'bg-white',
              isDrawer ? 'cursor-crosshair' : 'cursor-default',
            )}
            onMouseDown={isDrawer ? handleMouseDown : undefined}
            onMouseMove={isDrawer ? handleMouseMove : undefined}
            onMouseUp={isDrawer ? handleMouseUp : undefined}
            onMouseLeave={isDrawer ? handleMouseLeave : undefined}
            onTouchStart={isDrawer ? handleTouchStart : undefined}
            onTouchMove={isDrawer ? handleTouchMove : undefined}
            onTouchEnd={isDrawer ? handleTouchEnd : undefined}
            aria-label={isDrawer ? 'Drawing canvas – draw the secret word' : 'Drawing canvas – read only, guess the word in chat'}
          />

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
