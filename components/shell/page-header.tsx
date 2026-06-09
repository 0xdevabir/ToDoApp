'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function PageHeader({
  icon,
  title,
  subtitle,
  actions,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex items-end justify-between gap-3', className)}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              {icon}
            </span>
          )}
          <h1 className="truncate text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--fg-muted)]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
