import {
  ArrowUpRight,
  CloudSun,
  Cpu,
  Droplets,
  FishSymbol,
  Gauge,
  Leaf,
  MoreHorizontal,
  Utensils,
  Wind,
} from 'lucide-react';
import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';
import { MetricCard } from '@/components/ui/metric-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { StatusBadge } from '@/components/ui/status-badge';
import { FeederTestPanel } from '@/components/ui/feeder-test-panel';
import { getDashboardSummary, type ForecastDay } from '@/lib/api';
import { getCopilotBriefing } from '@/lib/api';
import { CopilotCard } from '@/components/ui/copilot-card';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatForecastDay(dateStr: string, index: number): string {
  if (index === 0) return 'Today';
  return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short' });
}

function ForecastStrip({ days }: { days: ForecastDay[] }) {
  return (
    <div className="forecast-strip">
      {days.map((day, index) => (
        <article
          className={index === 0 ? 'forecast-day forecast-day--active' : 'forecast-day'}
          key={day.date}
        >
          <span>{formatForecastDay(day.date, index)}</span>
          <CloudSun size={20} strokeWidth={1.6} aria-hidden="true" />
          <strong>{day.temperature_mean_c.toFixed(1)}°</strong>
          <small>{day.windspeed_mean_m_s.toFixed(1)} m/s</small>
          <small>{day.precipitation_mm.toFixed(1)} mm</small>
        </article>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  let summary;
  try {
    summary = await getDashboardSummary();
  } catch {
    summary = {
      generated_at: new Date().toISOString(),
      data_mode: 'operational' as const,
      metrics: {
        feed_planned_kg: 0,
        scheduled_feed_events: 0,
        active_culture_units: 0,
        pond_count: 0,
        cage_count: 0,
        online_devices: 0,
        total_devices: 0,
      },
      water_context: null,
      context_error: 'Dashboard data is temporarily unavailable.',
      alerts: [],
      upcoming_feedings: [],
    };
  }

  const briefing = await getCopilotBriefing();
  const { metrics, water_context, context_error, alerts, upcoming_feedings } = summary;

  const tempDisplay = water_context?.static.monthly_climatology_temperature_c != null
    ? `${water_context.static.monthly_climatology_temperature_c.toFixed(1)}°C`
    : '—';

  const depthDisplay = water_context?.static.bathymetry_depth_m != null
    ? `${water_context.static.bathymetry_depth_m} m`
    : '—';

  const windDisplay = water_context?.forecast[0] != null
    ? `${water_context.forecast[0].windspeed_mean_m_s.toFixed(1)} m/s`
    : '—';

  const chlorophyllDisplay = water_context?.static.chlorophyll_a_concentration_mg_m3 != null
    ? `${water_context.static.chlorophyll_a_concentration_mg_m3.toFixed(2)} mg/m³`
    : 'No satellite data';

  const retrievedAt = water_context?.retrieved_at
    ? new Date(water_context.retrieved_at).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <>
    <AppShell
      active="dashboard"
      title="Good morning, Amina"
      description="Here is what needs attention across your farm today."
    >
      <section className="metrics-grid" aria-label="Farm summary">
        <MetricCard
          icon={Utensils}
          label="Feed planned today"
          value={`${metrics.feed_planned_kg} kg`}
          detail={`${metrics.scheduled_feed_events} events across ${metrics.active_culture_units} units`}
          tone="coral"
        />
        <MetricCard
          icon={Droplets}
          label="Lake temperature"
          value={tempDisplay}
          detail="Monthly climatology · KijaniSpace"
          tone="water"
        />
        <MetricCard
          icon={FishSymbol}
          label="Active culture units"
          value={String(metrics.active_culture_units)}
          detail={`${metrics.pond_count} ponds · ${metrics.cage_count} cages`}
          tone="lime"
        />
        <MetricCard
          icon={Cpu}
          label="Devices online"
          value={`${metrics.online_devices} / ${metrics.total_devices}`}
          detail={
            metrics.online_devices < metrics.total_devices
              ? `${metrics.total_devices - metrics.online_devices} sensor needs attention`
              : 'All devices online'
          }
        />
      </section>
      <CopilotCard briefing={briefing} />

      <div className="dashboard-grid">
        <section className="panel panel--context">
          <SectionHeading
            eyebrow="KijaniSpace context"
            title="Lake Victoria outlook"
            action={
              retrievedAt ? (
                <StatusBadge dot tone="positive">
                  Live · {retrievedAt}
                </StatusBadge>
              ) : (
                <StatusBadge dot tone="attention">
                  Unavailable
                </StatusBadge>
              )
            }
          />

          {context_error ? (
            <p className="data-note">{context_error}</p>
          ) : water_context ? (
            <>
              <div className="context-summary">
                <div className="context-summary__icon">
                  <CloudSun size={30} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <span>Open-water reference</span>
                  <strong>
                    {water_context.forecast[0]?.temperature_mean_c != null
                      ? `${water_context.forecast[0].temperature_mean_c.toFixed(1)}°C today`
                      : 'Stable conditions'}
                  </strong>
                  <small>
                    {water_context.coordinates.latitude}, {water_context.coordinates.longitude} ·{' '}
                    {water_context.source}
                  </small>
                </div>
                <dl>
                  <div>
                    <dt>
                      <Wind size={14} /> Wind
                    </dt>
                    <dd>{windDisplay}</dd>
                  </div>
                  <div>
                    <dt>
                      <Gauge size={14} /> Depth
                    </dt>
                    <dd>{depthDisplay}</dd>
                  </div>
                  <div>
                    <dt>
                      <Leaf size={14} /> Chl-a
                    </dt>
                    <dd>{chlorophyllDisplay}</dd>
                  </div>
                </dl>
              </div>
              <ForecastStrip days={water_context.forecast} />
            </>
          ) : null}

          <p className="data-note">
            Regional forecast context—not a substitute for local water sensors.
          </p>
        </section>

        <section className="panel attention-panel">
          <SectionHeading title="Needs attention" eyebrow={`${alerts.length} items`} />
          {alerts.map((alert) => (
            <article className="attention-item" key={alert.id}>
              <span
                className={
                  alert.severity === 'critical'
                    ? 'attention-item__icon'
                    : 'attention-item__icon attention-item__icon--soft'
                }
              >
                {alert.title.toLowerCase().includes('sensor') ||
                alert.title.toLowerCase().includes('device') ? (
                  <Cpu size={18} />
                ) : (
                  <FishSymbol size={18} />
                )}
              </span>
              <div>
                <strong>{alert.title}</strong>
                <p>
                  {alert.culture_unit_name} · {alert.detail}
                </p>
              </div>
              <ArrowUpRight size={17} aria-hidden="true" />
            </article>
          ))}
          <Link className="text-link" href="/devices">
            Review all alerts <ArrowUpRight size={15} />
          </Link>
        </section>

        <section className="panel schedule-panel">
          <SectionHeading
            title="Today's feeding schedule"
            eyebrow={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
            action={
              <Link className="text-link" href="/feeding">
                View feed plans <ArrowUpRight size={15} />
              </Link>
            }
          />
          <div className="schedule-list">
            {upcoming_feedings.map((feeding, index) => {
              const time = new Date(feeding.scheduled_for).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const isDue = feeding.status === 'scheduled' && index === 0;
              return (
                <article className="schedule-row" key={feeding.id}>
                  <time>{time}</time>
                  <span
                    className={isDue ? 'timeline-dot timeline-dot--active' : 'timeline-dot'}
                  />
                  <div>
                    <strong>{feeding.culture_unit_name}</strong>
                    <small>{feeding.feed_name}</small>
                  </div>
                  <span className="schedule-amount">{feeding.amount_kg} kg</span>
                  <StatusBadge tone={isDue ? 'attention' : 'neutral'}>
                    {isDue ? 'Due next' : 'Scheduled'}
                  </StatusBadge>
                  <button
                    className="row-action"
                    type="button"
                    aria-label={`More actions for ${feeding.culture_unit_name}`}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>

    <FeederTestPanel
      initialTemp={water_context?.static.monthly_climatology_temperature_c ?? null}
      initialChlorophyll={water_context?.static.chlorophyll_a_concentration_mg_m3 ?? null}
    />
    </>
  );
}
