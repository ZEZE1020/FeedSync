import { CircleAlert, Scale, Utensils } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { CreateFeedPlanForm } from '@/components/ui/create-feed-plan-form';
import { getCultureUnits, getFeedPlans, lakeVictoriaTimeZone } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function FeedingPage() {
  const [plans, units] = await Promise.all([getFeedPlans(), getCultureUnits()]);
  const planned = plans.reduce((sum, plan) => sum + plan.amount_kg, 0);
  const pending = plans.filter((plan) => plan.status === 'awaiting_approval').length;
  return <AppShell active="feeding" title="Feed plans" description="Review recommendations, approve schedules and record what was actually fed.">
    <section className="metrics-grid metrics-grid--three"><MetricCard icon={Utensils} label="Planned feed" value={`${planned.toFixed(1)} kg`} detail={`${plans.length} scheduled events`} tone="coral" /><MetricCard icon={Scale} label="Recorded actual" value={`${plans.filter((p) => p.status === 'executed').length} plans`} detail="Record actual feed after delivery" tone="lime" /><MetricCard icon={CircleAlert} label="Needs approval" value={String(pending)} detail="Operator review required" tone="water" /></section>
    <div className="feeding-layout"><section className="panel plan-table-panel"><div className="data-table" role="table"><div className="data-table__header"><span>Culture unit</span><span>Schedule (EAT)</span><span>Amount</span><span>Owner</span><span>Status</span></div>{plans.map((plan) => <div className="data-table__row" role="row" key={plan.id}><strong>{plan.culture_unit_name}</strong><span>{new Date(plan.scheduled_for).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: lakeVictoriaTimeZone })}</span><strong>{plan.amount_kg} kg</strong><span>{plan.owner_name}</span><StatusBadge tone={plan.status === 'awaiting_approval' ? 'attention' : plan.status === 'executed' ? 'positive' : 'neutral'}>{plan.status.replace('_', ' ')}</StatusBadge></div>)}</div></section><CreateFeedPlanForm units={units} /></div>
  </AppShell>;
}
