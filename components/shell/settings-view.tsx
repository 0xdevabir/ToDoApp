'use client';

import { useApp } from '@/lib/store';
import { ACCENT_HEX, ACCENT_LABELS } from '@/lib/constants';
import type { AccentColor, Density, ThemeMode } from '@/lib/types';
import { PageHeader } from '@/components/shell/page-header';
import { Button, Select, Switch, Tooltip } from '@/components/ui';
import { Download, Upload, RotateCcw, Settings as SettingsIcon, Trash2, Timer, Volume2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SettingsView() {
  const settings = useApp((s) => s.settings);
  const tasks = useApp((s) => s.tasks);
  const lists = useApp((s) => s.lists);
  const tags = useApp((s) => s.tags);
  const sessions = useApp((s) => s.sessions);
  const setSettings = useApp((s) => s.setSettings);
  const importData = useApp((s) => s.importData);
  const resetAll = useApp((s) => s.resetAll);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJSON = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks,
      lists,
      tags,
      sessions,
      settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowdo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (typeof data !== 'object' || data === null) throw new Error('Invalid');
      importData({
        tasks: Array.isArray(data.tasks) ? data.tasks : undefined,
        lists: Array.isArray(data.lists) ? data.lists : undefined,
        tags: Array.isArray(data.tags) ? data.tags : undefined,
        sessions: Array.isArray(data.sessions) ? data.sessions : undefined,
        settings: typeof data.settings === 'object' ? data.settings : undefined,
      });
      toast.success('Imported successfully');
    } catch (e) {
      toast.error('Could not import that file.');
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={<SettingsIcon className="h-5 w-5" />}
        title="Settings"
        subtitle="Personalize FlowDo."
      />

      <Section title="Appearance" icon={<SettingsIcon className="h-4 w-4" />}>
        <Row label="Theme" hint="Light, dark, or follow your system.">
          <Select
            value={settings.theme}
            onChange={(v) => setSettings({ theme: v as ThemeMode })}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
          />
        </Row>
        <Row label="Accent" hint="Pick the color that powers buttons and highlights.">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ACCENT_HEX) as AccentColor[]).map((c) => (
              <Tooltip key={c} label={ACCENT_LABELS[c]}>
                <button
                  onClick={() => setSettings({ accent: c })}
                  className={cn(
                    'h-7 w-7 rounded-full border-2 transition',
                    settings.accent === c ? 'border-[var(--fg)]' : 'border-transparent',
                  )}
                  style={{ background: ACCENT_HEX[c] }}
                  aria-label={ACCENT_LABELS[c]}
                />
              </Tooltip>
            ))}
          </div>
        </Row>
        <Row label="Density" hint="Comfortable spacing or compact rows.">
          <Select
            value={settings.density}
            onChange={(v) => setSettings({ density: v as Density })}
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' },
            ]}
          />
        </Row>
        <Row label="Week starts on" hint="Used in calendar and date filters.">
          <Select
            value={String(settings.weekStartsOn)}
            onChange={(v) => setSettings({ weekStartsOn: Number(v) as 0 | 1 })}
            options={[
              { value: '1', label: 'Monday' },
              { value: '0', label: 'Sunday' },
            ]}
          />
        </Row>
      </Section>

      <Section title="Pomodoro" icon={<Timer className="h-4 w-4" />}>
        <Row label="Focus length" hint="Minutes per focus session.">
          <NumberInput
            value={settings.pomodoroFocusMin}
            min={1}
            max={120}
            onChange={(v) => setSettings({ pomodoroFocusMin: v })}
          />
        </Row>
        <Row label="Short break" hint="Minutes between focus sessions.">
          <NumberInput
            value={settings.pomodoroBreakMin}
            min={1}
            max={60}
            onChange={(v) => setSettings({ pomodoroBreakMin: v })}
          />
        </Row>
        <Row label="Long break" hint="Minutes for the longer recovery break.">
          <NumberInput
            value={settings.pomodoroLongBreakMin}
            min={1}
            max={120}
            onChange={(v) => setSettings({ pomodoroLongBreakMin: v })}
          />
        </Row>
        <Row label="Long break every" hint="After this many focus sessions.">
          <NumberInput
            value={settings.pomodoroLongEvery}
            min={2}
            max={12}
            onChange={(v) => setSettings({ pomodoroLongEvery: v })}
          />
        </Row>
        <Row label="Sound" hint="Play a chime when phases end.">
          <Switch
            checked={settings.enableSounds}
            onCheckedChange={(v) => setSettings({ enableSounds: v })}
          />
        </Row>
      </Section>

      <Section title="Calendar" icon={<Calendar className="h-4 w-4" />}>
        <Row label="Show completed" hint="Show finished tasks in lists.">
          <Switch
            checked={settings.showCompletedTasks}
            onCheckedChange={(v) => setSettings({ showCompletedTasks: v })}
          />
        </Row>
      </Section>

      <Section title="Data" icon={<Download className="h-4 w-4" />}>
        <Row label="Export" hint="Download a JSON backup of your tasks, lists, tags and settings.">
          <Button onClick={exportJSON}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </Row>
        <Row label="Import" hint="Restore from a previous JSON export.">
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJSON(f);
              if (fileRef.current) fileRef.current.value = '';
            }}
          />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Choose file
          </Button>
        </Row>
        <Row label="Reset" hint="Erase all data and start fresh.">
          <Button
            variant="danger"
            onClick={() => {
              if (
                confirm(
                  'This will delete all tasks, lists, tags, and settings. This cannot be undone.',
                )
              ) {
                resetAll();
                toast.success('All data cleared.');
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Reset everything
          </Button>
        </Row>
      </Section>

      <div className="text-center text-xs text-[var(--fg-subtle)]">
        FlowDo · Built with Next.js, Tailwind v4, Zustand and love.
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-4"
    >
      <h3 className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--fg)]">
        {icon} {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </motion.section>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="text-sm font-medium text-[var(--fg)]">{label}</div>
        {hint && <div className="text-xs text-[var(--fg-muted)]">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
      }}
      className="h-8 w-20 rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-2 text-sm text-[var(--fg)]"
    />
  );
}
