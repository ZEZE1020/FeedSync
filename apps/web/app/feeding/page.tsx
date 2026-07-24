import { ArrowRight, CalendarClock, Check, CircleAlert, Plus, Scale, Utensils } from 'lucide-react';

import { AppShell } from '@/components/layout/app-shell';
import { MetricCard } from '@/components/ui/metric-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { StatusBadge } from '@/components/ui/status-badge';

const plans = [
  {
    amount: '12.5 kg',
    date: 'Today · 08:30',
    name: 'Lake cage A',
    owner: 'Amina O.',
    status: 'Awaiting approval',
  },
  {
    amount: '8.2 kg',
    date: 'Today · 11:00',
    name: 'North pond',
    owner: 'David K.',
    status: 'Approved',
  },
  {
    amount: '4.8 kg',
    date: 'Today · 14:30',
    name: 'Nursery pond',
    owner: 'David K.',
    status: 'Draft',
  },
  {
    amount: '11.8 kg',
    date: 'Tomorrow · 08:30',
    name: 'Lake cage B',
    owner: 'Amina O.',
    status: 'Scheduled',
  },
] as const;

function planTone(status: string) {
  if (status === 'Approved' || status === 'Scheduled') return 'positive' as const;
  if (status === 'Awaiting approval') return 'attention' as const;
  return 'neutral' as const;
}

export default function FeedingPage() {
  return (
    <AppShell
      active="feeding"
      title="Feed plans"
      description="Review recommendations, approve schedules and record what was actually fed."
    >
      <div className="page-actions page-actions--end">
        <button className="primary-button" type="button">
          <Plus size={17} /> Create feed plan
        </button>
      </div>
      <section className="metrics-grid metrics-grid--three" aria-label="Feed plan summary">
        <MetricCard
          icon={Utensils}
          label="Planned this week"
          value="286 kg"
          detail="32 scheduled events"
          tone="coral"
        />
        <MetricCard
          icon={Scale}
          label="Recorded actual"
          value="91%"
          detail="Up 4% from last week"
          tone="lime"
        />
        <MetricCard
          icon={CircleAlert}
          label="Needs approval"
          value="3"
          detail="Next event at 08:30"
          tone="water"
        />
      </section>
      <div className="feeding-layout">
        <section className="panel plan-table-panel">
          <SectionHeading eyebrow="This week" title="Plans and approvals" />
          <div className="data-table" role="table" aria-label="Feed plans">
            <div className="data-table__header" role="row">
              <span>Culture unit</span>
              <span>Schedule</span>
              <span>Amount</span>
              <span>Owner</span>
              <span>Status</span>
              <span />
            </div>
            {plans.map((plan) => (
              <div className="data-table__row" role="row" key={`${plan.name}-${plan.date}`}>
                <strong>{plan.name}</strong>
                <span>{plan.date}</span>
                <strong>{plan.amount}</strong>
                <span>{plan.owner}</span>
                <StatusBadge tone={planTone(plan.status)}>{plan.status}</StatusBadge>
                <button className="row-action" type="button" aria-label={`Open ${plan.name} plan`}>
                  <ArrowRight size={17} />
                </button>
              </div>
            ))}
          </div>
        </section>
        <aside className="panel recommendation-card">
          <span className="recommendation-card__icon">
            <CalendarClock size={22} />
          </span>
          <p className="panel-eyebrow">Next recommendation</p>
          <h2>Lake cage A</h2>
          <strong className="recommendation-card__amount">12.5 kg</strong>
          <p>Tilapia grower pellet · 08:30</p>
          <ul className="rationale-list">
            <li>
              <Check size={15} /> Biomass sample is current
            </li>
            <li>
              <Check size={15} /> Forecast conditions are stable
            </li>
            <li>
              <Check size={15} /> No recent appetite warning
            </li>
          </ul>
          <button className="primary-button primary-button--full" type="button">
            Review recommendation <ArrowRight size={16} />
          </button>
          <small className="data-note">
            Farmer approval is required before any feeder command.
          </small>
        </aside>
      </div>
    </AppShell>
  );
}
