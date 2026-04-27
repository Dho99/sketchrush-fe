import { useRef, useEffect, useState, useCallback } from 'react';
import { X, Play, Pause, SkipBack } from 'lucide-react';
import type { Stroke } from '../../lib/types';
import { cn } from '../../lib/utils';

const CANVAS_W = 800;
const CANVAS_H = 550;

const SPEED_OPTIONS = [
  { label: '0.5×', value: 0.5 },
  { label: '1×', value: 1 },
  { label: '2×', value: 2 },
];

interface ReplayModalProps {
  strokes: Stroke[];
  word: string;
  onClose: () => void;
}

export function ReplayModal({ strokes, word, onClose }: ReplayModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const strokeIndexRef = useRef(0);
  const pointIndexRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);

  const totalPoints = strokes.reduce((sum, s) => sum + s.points.length, 0);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  const drawUpTo = useCallback((targetStrokeIdx: number, targetPointIdx: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    strokes.forEach((stroke, si) => {
      if (si > targetStrokeIdx) return;
      const pts = si === targetStrokeIdx ? stroke.points.slice(0, targetPointIdx + 1) : stroke.points;
      if (pts.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = stroke.tool === 'eraser' ? '#FFFFFF' : stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
  }, [strokes]);

  useEffect(() => {
    clearCanvas();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [clearCanvas]);

  const animate = useCallback(() => {
    const si = strokeIndexRef.current;
    const pi = pointIndexRef.current;

    if (si >= strokes.length) {
      setIsPlaying(false);
      setProgress(100);
      return;
    }

    drawUpTo(si, pi);

    // Count done points
    let done = strokes.slice(0, si).reduce((sum, s) => sum + s.points.length, 0) + pi;
    setProgress(totalPoints > 0 ? Math.round((done / totalPoints) * 100) : 0);

    // Advance
    const stroke = strokes[si];
    const stepsPerFrame = Math.max(1, Math.round(speed * 3));

    for (let step = 0; step < stepsPerFrame; step++) {
      pointIndexRef.current++;
      if (pointIndexRef.current >= stroke.points.length) {
        strokeIndexRef.current++;
        pointIndexRef.current = 0;
        if (strokeIndexRef.current >= strokes.length) break;
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, [strokes, drawUpTo, totalPoints, speed]);

  const handlePlay = () => {
    setIsPlaying(true);
    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  const handleReset = () => {
    handlePause();
    strokeIndexRef.current = 0;
    pointIndexRef.current = 0;
    setProgress(0);
    clearCanvas();
  };

  const handleSeek = (val: number) => {
    handlePause();
    const targetDone = Math.round((val / 100) * totalPoints);
    let counted = 0;
    for (let si = 0; si < strokes.length; si++) {
      const pts = strokes[si].points.length;
      if (counted + pts >= targetDone) {
        strokeIndexRef.current = si;
        pointIndexRef.current = targetDone - counted;
        drawUpTo(si, targetDone - counted);
        setProgress(val);
        return;
      }
      counted += pts;
    }
  };

  // Placeholder functions
  const handleReplayPlay = () => handlePlay(); // TODO: socket.emit('replay:play')
  const handleReplayPause = () => handlePause(); // TODO: socket.emit('replay:pause')
  const handleReplaySeek = (val: number) => handleSeek(val); // TODO: socket.emit('replay:seek', { position: val })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Drawing replay"
    >
      <div className="bg-white dark:bg-stone-900 border-2 border-stone-800 dark:border-stone-500 rounded-2xl shadow-[6px_6px_0px_#1C1917] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.1)] w-full max-w-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-xl text-stone-900 dark:text-stone-100"
              style={{ fontFamily: "'Fredoka One', sans-serif" }}
            >
              🎬 Replay
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              The word was <strong className="text-amber-600 dark:text-amber-400">{word}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close replay"
            className="p-2 rounded-xl border-2 border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4 text-stone-700 dark:text-stone-300" />
          </button>
        </div>

        {/* Canvas */}
        <div className="w-full" style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full h-full border-2 border-stone-800 dark:border-stone-600 rounded-xl bg-white"
          />
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Scrubber */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 dark:text-stone-400 w-8 text-right">{progress}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => handleReplaySeek(Number(e.target.value))}
              aria-label="Replay progress"
              className="flex-1 h-2 accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              aria-label="Reset replay"
              className="p-2 rounded-xl border-2 border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <SkipBack className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            </button>

            <button
              onClick={isPlaying ? handleReplayPause : handleReplayPlay}
              aria-label={isPlaying ? 'Pause replay' : 'Play replay'}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-xl border-2 border-stone-800 dark:border-stone-400',
                'bg-amber-400 hover:bg-amber-500 text-stone-900',
                'shadow-[3px_3px_0px_#1C1917] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.1)]',
                'active:translate-y-[1px] active:shadow-[1px_1px_0px_#1C1917]',
                'transition-all text-sm font-bold',
              )}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>

            {/* Speed */}
            <div className="flex gap-1 ml-auto">
              {SPEED_OPTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSpeed(s.value)}
                  aria-label={`Speed ${s.label}`}
                  className={cn(
                    'px-2.5 py-1 rounded-lg border-2 text-xs transition-colors',
                    speed === s.value
                      ? 'border-stone-800 dark:border-stone-300 bg-amber-400 text-stone-900'
                      : 'border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400',
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
