'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/lib/store';
import { Play, Pause, RotateCcw, SkipForward, Coffee, X, Timer, Flame, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Modal, Tooltip } from '@/components/ui';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, isSameDay, startOfDay, subDays } from 'date-fns';
import type { PomodoroSession } from '@/lib/types';

type Phase = 'focus' | 'short' | 'long';

export function PomodoroBar() {
  const settings = useApp((s) => s.settings);
  const tasks = useApp((s) => s.tasks);
  const incrementPomodoro = useApp((s) => s.incrementPomodoro);
  const addSession = useApp((s) => s.addSession);
  const sessions = useApp((s) => s.sessions);

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('focus');
  const [seconds, setSeconds] = useState(settings.pomodoroFocusMin * 60);
  const [running, setRunning] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [muted, setMuted] = useState(!settings.enableSounds);
  const [completedFocus, setCompletedFocus] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  const phaseDur = useMemo(() => {
    if (phase === 'focus') return settings.pomodoroFocusMin * 60;
    if (phase === 'short') return settings.pomodoroBreakMin * 60;
    return settings.pomodoroLongBreakMin * 60;
  }, [phase, settings]);

  useEffect(() => {
    setSeconds(phaseDur);
  }, [phaseDur]);

  const handlePhaseEnd = () => {
    if (!muted) {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = phase === 'focus' ? 880 : 660;
        g.gain.value = 0.04;
        o.start();
        o.stop(ctx.currentTime + 0.2);
      } catch {
        /* no audio */
      }
    }
    if (phase === 'focus') {
      const session: PomodoroSession = {
        id: `ps_${Date.now()}`,
        taskId: taskId ?? undefined,
        startedAt: new Date((startedAtRef.current ?? Date.now()) - settings.pomodoroFocusMin * 60_000).toISOString(),
        endedAt: new Date().toISOString(),
        durationSec: settings.pomodoroFocusMin * 60,
        completed: true,
      };
      addSession(session);
      if (taskId) incrementPomodoro(taskId);
      const nextCount = completedFocus + 1;
      setCompletedFocus(nextCount);
      const next: Phase = nextCount % settings.pomodoroLongEvery === 0 ? 'long' : 'short';
      setPhase(next);
      setRunning(false);
      toast.success(`Focus complete! Time for a ${next === 'long' ? 'long' : 'short'} break.`);
    } else {
      setPhase('focus');
      setRunning(false);
      toast('Break over — back to focus.');
    }
    startedAtRef.current = null;
  };

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          handlePhaseEnd();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setRunning((r) => !r);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const start = () => {
    if (!startedAtRef.current) startedAtRef.current = Date.now();
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setSeconds(phaseDur);
    startedAtRef.current = null;
  };

  const skip = () => {
    setRunning(false);
    setSeconds(phaseDur);
    if (phase === 'focus') {
      const next: Phase = (completedFocus + 1) % settings.pomodoroLongEvery === 0 ? 'long' : 'short';
      setPhase(next);
    } else {
      setPhase('focus');
    }
    startedAtRef.current = null;
  };

  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  const pct = ((phaseDur - seconds) / phaseDur) * 100;

  const todayFocusCount = sessions.filter(
    (s) => s.completed && isSameDay(new Date(s.endedAt), new Date()),
  ).length;

  const streak = useMemo(() => computeStreak(sessions), [sessions]);

  const task = taskId ? tasks.find((t) => t.id === taskId) : null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        <AnimatePresence>
          {focusMode && task && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="max-w-xs rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-2 shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[var(--fg-subtle)]">
                <Timer className="h-3 w-3" /> Focusing on
              </div>
              <div className="truncate text-sm font-medium text-[var(--fg)]">{task.title}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-2 text-sm font-medium text-[var(--fg)] shadow-[var(--shadow-md)] transition hover:bg-[var(--bg-elev-2)]"
        >
          <Timer className="h-4 w-4 text-[var(--accent)]" />
          <span className="font-mono">
            {phase === 'focus' ? '' : <Coffee className="mr-0.5 inline h-3.5 w-3.5" />}
            {minutes}:{secs}
          </span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 text-[10px] font-semibold" style={{ background: 'color-mix(in oklab, var(--warning) 18%, transparent)', color: 'var(--warning)' }}>
              <Flame className="h-3 w-3" /> {streak}
            </span>
          )}
        </button>
      </div>

      <Modal
        open={open}
        onOpenChange={setOpen}
        size="md"
        title={
          <div className="flex w-full items-center gap-2">
            <span>Pomodoro</span>
            <span className="text-xs font-normal text-[var(--fg-muted)]">
              {todayFocusCount} focus session{todayFocusCount === 1 ? '' : 's'} today
            </span>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-5">
          <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-elev)] p-0.5 text-xs">
            {(['focus', 'short', 'long'] as Phase[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPhase(p);
                  setRunning(false);
                }}
                className={cn(
                  'rounded-full px-3 py-1 font-medium transition-colors',
                  phase === p ? 'bg-[var(--accent)] text-[var(--accent-fg)]' : 'text-[var(--fg-muted)]',
                )}
              >
                {p === 'focus' ? 'Focus' : p === 'short' ? 'Short' : 'Long'}
              </button>
            ))}
          </div>

          <div className="relative grid h-48 w-48 place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="var(--bg-elev-2)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={phase === 'focus' ? 'var(--accent)' : 'var(--success)'}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={(2 * Math.PI * 45) * (1 - pct / 100)}
                style={{ transition: 'stroke-dashoffset 0.4s linear' }}
              />
            </svg>
            <div className="text-center">
              <div className="font-mono text-5xl font-semibold tabular-nums">
                {minutes}:{secs}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-[var(--fg-muted)]">
                {phase === 'focus' ? 'Stay in flow' : 'Take a break'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={reset} variant="secondary" size="icon" aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => (running ? setRunning(false) : start())}
              className="min-w-32"
            >
              {running ? (
                <>
                  <Pause className="h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Start
                </>
              )}
            </Button>
            <Button onClick={skip} variant="secondary" size="icon" aria-label="Skip">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-[var(--fg-subtle)]">Link a task</span>
              <select
                value={taskId ?? ''}
                onChange={(e) => setTaskId(e.target.value || null)}
                className="h-9 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2 text-sm text-[var(--fg)]"
              >
                <option value="">No task</option>
                {tasks
                  .filter((t) => t.status !== 'done')
                  .slice(0, 50)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
              </select>
            </label>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-[var(--fg-subtle)]">Options</span>
              <div className="flex h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2">
                <Tooltip label={muted ? 'Unmute' : 'Mute'}>
                  <button onClick={() => setMuted((m) => !m)} className="text-[var(--fg-muted)] hover:text-[var(--fg)]">
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </Tooltip>
                <Tooltip label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}>
                  <button onClick={() => setFocusMode((v) => !v)} className="text-[var(--fg-muted)] hover:text-[var(--fg)]">
                    {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                </Tooltip>
                {streak > 0 && (
                  <span className="ml-auto inline-flex items-center gap-0.5 text-xs font-semibold" style={{ color: 'var(--warning)' }}>
                    <Flame className="h-3 w-3" /> {streak}d
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-[var(--fg-subtle)]">
            Tip: press <kbd className="rounded border border-[var(--border)] bg-[var(--bg-elev-2)] px-1">Space</kbd> to start/pause anywhere.
          </p>
        </div>
      </Modal>
    </>
  );
}

function computeStreak(sessions: PomodoroSession[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(
    sessions
      .filter((s) => s.completed)
      .map((s) => format(startOfDay(new Date(s.endedAt)), 'yyyy-MM-dd')),
  );
  let count = 0;
  let d = new Date();
  while (days.has(format(startOfDay(d), 'yyyy-MM-dd'))) {
    count++;
    d = subDays(d, 1);
  }
  return count;
}
