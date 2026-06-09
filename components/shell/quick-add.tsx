'use client';

import { useApp } from '@/lib/store';
import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Select } from '@/components/ui';
import { PRIORITY_META } from '@/lib/constants';
import type { Priority } from '@/lib/types';
import { cn } from '@/lib/utils';

export function QuickAdd({ defaultListId = 'inbox' }: { defaultListId?: string }) {
  const [value, setValue] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [priority, setPriority] = useState<Priority>('medium');
  const [listId, setListId] = useState(defaultListId);
  const [dueAt, setDueAt] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useApp((s) => s.addTask);
  const lists = useApp((s) => s.lists);

  useEffect(() => setListId(defaultListId), [defaultListId]);

  const submit = () => {
    const title = value.trim();
    if (!title) return;
    addTask({
      title,
      priority,
      listId,
      dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
    });
    setValue('');
    setDueAt('');
    setPriority('medium');
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] shadow-[var(--shadow-sm)] transition-all',
        expanded && 'shadow-[var(--shadow-md)]',
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <Plus className="h-4 w-4 text-[var(--fg-subtle)]" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setExpanded(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            } else if (e.key === 'Escape') {
              setValue('');
              setExpanded(false);
              inputRef.current?.blur();
            }
          }}
          placeholder="Add a task… (press Enter)"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-transparent"
        />
        {value && (
          <Button size="sm" onClick={submit}>
            Add
          </Button>
        )}
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="overflow-hidden border-t border-[var(--border)]"
          >
            <div className="flex flex-wrap items-center gap-2 px-3 py-2 text-xs">
              <span className="text-[var(--fg-muted)]">Priority</span>
              <Select
                size="sm"
                value={priority}
                onChange={(v) => setPriority(v as Priority)}
                options={(Object.keys(PRIORITY_META) as Priority[]).map((p) => ({
                  value: p,
                  label: PRIORITY_META[p].label,
                  icon: <span className={cn('h-2 w-2 rounded-full', PRIORITY_META[p].dot)} />,
                }))}
              />
              <span className="text-[var(--fg-muted)]">List</span>
              <Select
                size="sm"
                value={listId}
                onChange={setListId}
                options={lists.map((l) => ({
                  value: l.id,
                  label: `${l.emoji} ${l.name}`,
                  color: l.color,
                }))}
              />
              <span className="text-[var(--fg-muted)]">Due</span>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="h-7 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 text-xs text-[var(--fg)]"
              />
              {(dueAt || priority !== 'medium') && (
                <button
                  onClick={() => {
                    setDueAt('');
                    setPriority('medium');
                  }}
                  className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[var(--fg-muted)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--fg)]"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
