'use client';

import { useApp } from '@/lib/store';
import { useMemo } from 'react';
import { addDays, format, isSameDay, startOfDay, subDays } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts';
import { PageHeader } from '@/components/shell/page-header';
import { BarChart3, CheckCircle2, Flame, ListTodo, Timer, TrendingUp } from 'lucide-react';
import { PRIORITY_META } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function AnalyticsView() {
  const tasks = useApp((s) => s.tasks);
  const sessions = useApp((s) => s.sessions);

  const totals = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const open = total - done;
    const overdue = tasks.filter(
      (t) => t.status !== 'done' && t.dueAt && new Date(t.dueAt) < new Date() && !isSameDay(new Date(t.dueAt), new Date()),
    ).length;
    return { total, done, open, overdue };
  }, [tasks]);

  const last14 = useMemo(() => {
    const arr: { day: string; created: number; done: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = startOfDay(subDays(new Date(), i));
      const next = addDays(d, 1);
      const created = tasks.filter(
        (t) => new Date(t.createdAt) >= d && new Date(t.createdAt) < next,
      ).length;
      const done = tasks.filter(
        (t) => t.completedAt && new Date(t.completedAt) >= d && new Date(t.completedAt) < next,
      ).length;
      arr.push({ day: format(d, 'MMM d'), created, done });
    }
    return arr;
  }, [tasks]);

  const byPriority = useMemo(() => {
    const map: Record<'low' | 'medium' | 'high' | 'urgent', number> = { low: 0, medium: 0, high: 0, urgent: 0 };
    for (const t of tasks) {
      if (t.status !== 'done') map[t.priority] = (map[t.priority] ?? 0) + 1;
    }
    return (Object.keys(map) as Array<keyof typeof map>).map((k) => ({
      name: PRIORITY_META[k].label,
      value: map[k],
      color: PRIORITY_META[k].dot.replace('bg-', ''),
    }));
  }, [tasks]);

  const byList = useMemo(() => {
    const lists = useApp.getState().lists;
    return lists.map((l) => ({
      name: l.name,
      value: tasks.filter((t) => t.listId === l.id && t.status !== 'done').length,
      color: l.color,
    }));
  }, [tasks]);

  const focusTrend = useMemo(() => {
    const arr: { day: string; minutes: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = startOfDay(subDays(new Date(), i));
      const next = addDays(d, 1);
      const minutes = sessions
        .filter(
          (s) => s.completed && new Date(s.endedAt) >= d && new Date(s.endedAt) < next,
        )
        .reduce((acc, s) => acc + s.durationSec / 60, 0);
      arr.push({ day: format(d, 'MMM d'), minutes: Math.round(minutes) });
    }
    return arr;
  }, [sessions]);

  const streak = useMemo(() => {
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
  }, [sessions]);

  const tooltipStyle = {
    background: 'var(--bg-elev)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--fg)',
    fontSize: 12,
  } as const;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={<BarChart3 className="h-5 w-5" />}
        title="Analytics"
        subtitle="Your productivity, in numbers."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={<ListTodo className="h-4 w-4" />} label="Open" value={totals.open} />
        <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Completed" value={totals.done} />
        <Stat icon={<TrendingUp className="h-4 w-4" />} label="Overdue" value={totals.overdue} tone={totals.overdue > 0 ? 'danger' : 'neutral'} />
        <Stat
          icon={<Flame className="h-4 w-4" />}
          label="Focus streak"
          value={`${streak}d`}
          tone={streak > 0 ? 'accent' : 'neutral'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-4 lg:col-span-2">
          <h3 className="mb-2 text-sm font-semibold text-[var(--fg)]">Activity (last 14 days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last14} barCategoryGap={6}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--fg-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--fg-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <ReTooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--accent-soft)' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--fg-muted)' }} />
                <Bar dataKey="created" name="Created" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="done" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-4">
          <h3 className="mb-2 text-sm font-semibold text-[var(--fg)]">Open by priority</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byPriority}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="var(--bg-elev)"
                >
                  {byPriority.map((d, i) => (
                    <Cell
                      key={i}
                      fill={
                        d.color === 'low'
                          ? '#0ea5e9'
                          : d.color === 'medium'
                            ? '#f59e0b'
                            : d.color === 'high'
                              ? '#f97316'
                              : '#f43f5e'
                      }
                    />
                  ))}
                </Pie>
                <ReTooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--fg-muted)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-4 lg:col-span-2">
          <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--fg)]">
            <Timer className="h-3.5 w-3.5" /> Focus minutes (last 14 days)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={focusTrend}>
                <defs>
                  <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--fg-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--fg-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <ReTooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#focusGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-4">
          <h3 className="mb-2 text-sm font-semibold text-[var(--fg)]">Open by list</h3>
          <div className="space-y-2">
            {byList.length === 0 && (
              <p className="text-sm text-[var(--fg-muted)]">No lists yet.</p>
            )}
            {byList.map((l) => {
              const max = Math.max(1, ...byList.map((x) => x.value));
              const pct = (l.value / max) * 100;
              return (
                <div key={l.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 text-[var(--fg-muted)]">
                      <span className="h-2 w-2 rounded-sm" style={{ background: l.color }} />
                      {l.name}
                    </span>
                    <span className="font-medium text-[var(--fg)]">{l.value}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-elev-2)]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: l.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone?: 'neutral' | 'danger' | 'accent';
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[var(--fg-muted)]">
        {icon} {label}
      </div>
      <div
        className={cn(
          'mt-1 text-2xl font-semibold',
          tone === 'danger' && 'text-[var(--danger)]',
          tone === 'accent' && 'text-[var(--accent)]',
        )}
      >
        {value}
      </div>
    </div>
  );
}
