import { BatteryMedium, Bluetooth, Cpu, Plus, Radio, Thermometer, WifiOff } from 'lucide-react';

import { AppShell } from '@/components/layout/app-shell';
import { MetricCard } from '@/components/ui/metric-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { StatusBadge } from '@/components/ui/status-badge';
import { getDevices } from '@/lib/api';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const devices = [
  {
    battery: '86%',
    kind: 'Water monitor',
    location: 'North pond',
    name: 'WM-POND-01',
    reading: '25.1°C',
    status: 'Online',
  },
  {
    battery: '72%',
    kind: 'Water monitor',
    location: 'Lake cage A',
    name: 'WM-CAGE-01',
    reading: '24.7°C',
    status: 'Online',
  },
  {
    battery: '—',
    kind: 'DO monitor',
    location: 'Lake cage C',
    name: 'DO-CAGE-03',
    reading: 'No data',
    status: 'Offline',
  },
  {
    battery: 'External',
    kind: 'Feeder controller',
    location: 'Lake cage A',
    name: 'FC-CAGE-01',
    reading: 'Ready',
    status: 'Online',
  },
] as const;

export default function DevicesPage() {
  return <DevicesContent />;
}

async function DevicesContent() {
  const liveDevices = await getDevices();
  const devices = liveDevices.map((device) => ({ battery: device.battery_label, kind: device.kind.replaceAll('_', ' '), location: device.culture_unit_name, name: device.name, reading: device.latest_state, status: device.status === 'online' ? 'Online' : 'Offline', lastSeen: new Date(device.last_seen_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) }));
  return (
    <AppShell
      active="devices"
      title="Devices"
      description="Monitor field hardware, sensor freshness and feeder acknowledgements."
    >
      <div className="page-actions page-actions--end">
        <button className="primary-button" type="button">
          <Plus size={17} /> Register device
        </button>
      </div>
      <section className="metrics-grid metrics-grid--three" aria-label="Device summary">
        <MetricCard
          icon={Radio}
          label="Connected devices"
          value={`${liveDevices.filter((d) => d.status === 'online').length} / ${liveDevices.length}`}
          detail="Reported by API"
          tone="green"
        />
        <MetricCard
          icon={Thermometer}
          label="Sensor observations"
          value={String(liveDevices.length)}
          detail="Registered field devices"
          tone="water"
        />
        <MetricCard
          icon={Bluetooth}
          label="Pending commands"
          value="0"
          detail="All acknowledgements received"
          tone="lime"
        />
      </section>
      <section className="panel devices-panel">
        <SectionHeading eyebrow="Kisumu farm cluster" title="Registered devices" />
        <div className="device-grid">
          {devices.map((device) => {
            const online = device.status === 'Online';
            return (
              <article className="device-card" key={device.name}>
                <div className="device-card__header">
                  <span className={online ? 'device-icon' : 'device-icon device-icon--offline'}>
                    {online ? <Cpu size={21} /> : <WifiOff size={21} />}
                  </span>
                  <StatusBadge dot tone={online ? 'positive' : 'attention'}>
                    {device.status}
                  </StatusBadge>
                </div>
                <span className="unit-kind">{device.kind}</span>
                <h2>{device.name}</h2>
                <p>{device.location}</p>
                <div className="device-reading">
                  <span>Latest state</span>
                  <strong>{device.reading}</strong>
                </div>
                <div className="device-meta">
                  <span>
                    <BatteryMedium size={15} /> {device.battery}
                  </span>
                  <span>{device.lastSeen}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
