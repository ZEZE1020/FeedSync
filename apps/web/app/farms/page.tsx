import { ArrowUpRight, FishSymbol, MapPin, Plus, Ruler, Waves } from 'lucide-react';

import { AppShell } from '@/components/layout/app-shell';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { getCultureUnits } from '@/lib/api';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const units = [
  {
    biomass: '1,240 kg',
    detail: '600 m² · 1.2 m avg depth',
    fish: '2,000 fish',
    kind: 'Pond',
    name: 'North pond',
    status: 'Healthy',
    temperature: '25.1°C',
  },
  {
    biomass: '2,850 kg',
    detail: '125 m³ · 12 m site depth',
    fish: '5,000 fish',
    kind: 'Cage',
    name: 'Lake cage A',
    status: 'Healthy',
    temperature: '24.7°C',
  },
  {
    biomass: '420 kg',
    detail: '280 m² · 0.9 m avg depth',
    fish: '4,500 fish',
    kind: 'Pond',
    name: 'Nursery pond',
    status: 'Review sample',
    temperature: '25.8°C',
  },
  {
    biomass: '2,610 kg',
    detail: '125 m³ · 14 m site depth',
    fish: '4,800 fish',
    kind: 'Cage',
    name: 'Lake cage B',
    status: 'Healthy',
    temperature: '24.6°C',
  },
] as const;

export default function FarmsPage() {
  return <FarmsContent />;
}

async function FarmsContent() {
  const liveUnits = await getCultureUnits();
  const units = liveUnits.map((unit) => ({ biomass: `${unit.estimated_biomass_kg.toLocaleString()} kg`, detail: unit.geometry_label, fish: `${unit.stocked_fish_count.toLocaleString()} fish`, kind: unit.kind === 'cage' ? 'Cage' : 'Pond', name: unit.name, status: unit.health_status === 'healthy' ? 'Healthy' : unit.health_status === 'review' ? 'Review sample' : 'Attention', temperature: unit.latest_temperature_c == null ? '—' : `${unit.latest_temperature_c}°C` }));
  return (
    <AppShell
      active="farms"
      title="Farms & culture units"
      description="Track stocking, geometry, biomass and conditions by production unit."
    >
      <div className="page-actions">
        <div className="segmented-control" role="group" aria-label="Filter culture units">
          <button className="segmented-control__active" type="button">
            All units
          </button>
          <button type="button">Ponds</button>
          <button type="button">Cages</button>
        </div>
        <button className="primary-button" type="button">
          <Plus size={17} /> Add culture unit
        </button>
      </div>
      <section className="metrics-grid metrics-grid--three" aria-label="Culture unit summary">
        <MetricCard
          icon={Waves}
          label="Culture units"
          value={String(liveUnits.length)}
          detail={`${liveUnits.filter((u) => u.kind === 'pond').length} ponds · ${liveUnits.filter((u) => u.kind === 'cage').length} cages`}
          tone="water"
        />
        <MetricCard
          icon={FishSymbol}
          label="Estimated biomass"
          value="12.4 t"
          detail="Across active production"
          tone="lime"
        />
        <MetricCard
          icon={Ruler}
          label="Sampling coverage"
          value="75%"
          detail="2 units due this week"
          tone="coral"
        />
      </section>
      <section className="unit-grid" aria-label="Culture units">
        {units.map((unit) => (
          <article className="unit-card" key={unit.name}>
            <div className="unit-card__visual">
              <div className={`culture-symbol culture-symbol--${unit.kind.toLowerCase()}`}>
                {unit.kind === 'Cage' ? <FishSymbol size={26} /> : <Waves size={26} />}
              </div>
              <StatusBadge tone={unit.status === 'Healthy' ? 'positive' : 'attention'} dot>
                {unit.status}
              </StatusBadge>
            </div>
            <div className="unit-card__body">
              <span className="unit-kind">{unit.kind}</span>
              <h2>{unit.name}</h2>
              <p>
                <MapPin size={14} /> Kisumu farm cluster
              </p>
              <dl className="unit-facts">
                <div>
                  <dt>Estimated biomass</dt>
                  <dd>{unit.biomass}</dd>
                </div>
                <div>
                  <dt>Stocking</dt>
                  <dd>{unit.fish}</dd>
                </div>
                <div>
                  <dt>Geometry</dt>
                  <dd>{unit.detail}</dd>
                </div>
                <div>
                  <dt>Latest temperature</dt>
                  <dd>{unit.temperature}</dd>
                </div>
              </dl>
              <button className="secondary-button secondary-button--full" type="button">
                View unit <ArrowUpRight size={16} />
              </button>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
