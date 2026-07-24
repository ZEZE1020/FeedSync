import {
  ArrowUpRight,
  CloudSun,
  Cpu,
  Droplets,
  FishSymbol,
  Gauge,
  MoreHorizontal,
  Utensils,
  Wind,
} from 'lucide-react';
import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';
import { MetricCard } from '@/components/ui/metric-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { StatusBadge } from '@/components/ui/status-badge';

const forecast = [
  { day: 'Today', rain: '0 mm', temperature: '24.7°', wind: '2.1 m/s' },
  { day: 'Sat', rain: '0 mm', temperature: '24.8°', wind: '3.5 m/s' },
  { day: 'Sun', rain: '0 mm', temperature: '24.6°', wind: '4.7 m/s' },
  { day: 'Mon', rain: '0 mm', temperature: '24.6°', wind: '3.3 m/s' },
  { day: 'Tue', rain: '2.6 mm', temperature: '24.5°', wind: '1.3 m/s' },
] as const;

const feedings = [
  { amount: '12.5 kg', name: 'Lake cage A', status: 'Due next', time: '08:30' },
  { amount: '8.2 kg', name: 'North pond', status: 'Scheduled', time: '11:00' },
  { amount: '4.8 kg', name: 'Nursery pond', status: 'Scheduled', time: '14:30' },
] as const;

export default function DashboardPage() {
  return (
    <AppShell
      active="dashboard"
      title="Good morning, Amina"
      description="Here is what needs attention across your farm today."
    >
      <section className="metrics-grid" aria-label="Farm summary">
        <MetricCard
          icon={Utensils}
          label="Feed planned today"
          value="48.2 kg"
          detail="6 events across 4 units"
          tone="coral"
        />
        <MetricCard
          icon={Droplets}
          label="Lake temperature"
          value="24.7°C"
          detail="Within preferred range"
          tone="water"
        />
        <MetricCard
          icon={FishSymbol}
          label="Active culture units"
          value="8"
          detail="3 ponds · 5 cages"
          tone="lime"
        />
        <MetricCard
          icon={Cpu}
          label="Devices online"
          value="6 / 7"
          detail="1 sensor needs attention"
        />
      </section>

      <div className="dashboard-grid">
        <section className="panel panel--context">
          <SectionHeading
            eyebrow="KijaniSpace context"
            title="Lake Victoria outlook"
            action={
              <StatusBadge dot tone="positive">
                Live · 12 min ago
              </StatusBadge>
            }
          />
          <div className="context-summary">
            <div className="context-summary__icon">
              <CloudSun size={30} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div>
              <span>Open-water reference</span>
              <strong>Stable conditions</strong>
              <small>-1.0, 33.0 · Meteoblue</small>
            </div>
            <dl>
              <div>
                <dt>
                  <Wind size={14} /> Wind
                </dt>
                <dd>2.1 m/s</dd>
              </div>
              <div>
                <dt>
                  <Gauge size={14} /> Depth
                </dt>
                <dd>68.4 m</dd>
              </div>
            </dl>
          </div>
          <div className="forecast-strip">
            {forecast.map((day, index) => (
              <article
                className={index === 0 ? 'forecast-day forecast-day--active' : 'forecast-day'}
                key={day.day}
              >
                <span>{day.day}</span>
                <CloudSun size={20} strokeWidth={1.6} aria-hidden="true" />
                <strong>{day.temperature}</strong>
                <small>{day.wind}</small>
                <small>{day.rain}</small>
              </article>
            ))}
          </div>
          <p className="data-note">
            Regional forecast context—not a substitute for local water sensors.
          </p>
        </section>

        <section className="panel attention-panel">
          <SectionHeading title="Needs attention" eyebrow="2 items" />
          <article className="attention-item">
            <span className="attention-item__icon">
              <Cpu size={18} />
            </span>
            <div>
              <strong>DO sensor offline</strong>
              <p>Lake cage C · Last seen 2h ago</p>
            </div>
            <ArrowUpRight size={17} aria-hidden="true" />
          </article>
          <article className="attention-item">
            <span className="attention-item__icon attention-item__icon--soft">
              <FishSymbol size={18} />
            </span>
            <div>
              <strong>Biomass sample due</strong>
              <p>North pond · Due today</p>
            </div>
            <ArrowUpRight size={17} aria-hidden="true" />
          </article>
          <Link className="text-link" href="/devices">
            Review all alerts <ArrowUpRight size={15} />
          </Link>
        </section>

        <section className="panel schedule-panel">
          <SectionHeading
            title="Today's feeding schedule"
            eyebrow="24 July"
            action={
              <Link className="text-link" href="/feeding">
                View feed plans <ArrowUpRight size={15} />
              </Link>
            }
          />
          <div className="schedule-list">
            {feedings.map((feeding, index) => (
              <article className="schedule-row" key={feeding.name}>
                <time>{feeding.time}</time>
                <span
                  className={index === 0 ? 'timeline-dot timeline-dot--active' : 'timeline-dot'}
                />
                <div>
                  <strong>{feeding.name}</strong>
                  <small>Tilapia grower pellets</small>
                </div>
                <span className="schedule-amount">{feeding.amount}</span>
                <StatusBadge tone={index === 0 ? 'attention' : 'neutral'}>
                  {feeding.status}
                </StatusBadge>
                <button
                  className="row-action"
                  type="button"
                  aria-label={`More actions for ${feeding.name}`}
                >
                  <MoreHorizontal size={18} />
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
