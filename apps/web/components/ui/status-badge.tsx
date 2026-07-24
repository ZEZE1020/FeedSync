import type { ReactNode } from 'react';

type BadgeTone = 'attention' | 'info' | 'neutral' | 'positive';

interface StatusBadgeProps {
  children: ReactNode;
  dot?: boolean;
  tone?: BadgeTone;
}

export function StatusBadge({ children, dot = false, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${tone}`}>
      {dot && <span className="status-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
