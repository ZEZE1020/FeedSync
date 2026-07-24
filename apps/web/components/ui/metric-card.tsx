import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone?: 'coral' | 'green' | 'lime' | 'water';
  value: string;
}

export function MetricCard({ detail, icon: Icon, label, tone = 'green', value }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className={`icon-tile icon-tile--${tone}`}>
        <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div>
        <p className="metric-card__label">{label}</p>
        <p className="metric-card__value">{value}</p>
        <p className="metric-card__detail">{detail}</p>
      </div>
    </article>
  );
}
