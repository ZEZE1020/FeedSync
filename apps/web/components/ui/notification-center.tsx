'use client';

import { Bell, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AlertSummary } from '@/lib/api';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertSummary[]>([]);
  const [read, setRead] = useState(false);
  useEffect(() => { fetch('/api/alerts').then((response) => response.ok ? response.json() : []).then(setAlerts).catch(() => setAlerts([])); }, []);
  const unread = read ? 0 : alerts.length;
  return <div className="notification-center">
    <button className="icon-button" type="button" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={open} onClick={() => { setOpen(!open); setRead(true); }}>
      <Bell size={19} aria-hidden="true" />{unread > 0 && <span className="notification-dot" />}
    </button>
    {open && <div className="notification-panel" role="dialog" aria-label="Notifications">
      <div className="notification-panel__header"><div><strong>Notifications</strong><small>{alerts.length ? `${alerts.length} items need attention` : 'All clear'}</small></div><button type="button" onClick={() => setOpen(false)} aria-label="Close notifications"><X size={17} /></button></div>
      {alerts.length ? <div className="notification-list">{alerts.map((alert) => <Link href="/devices" key={alert.id} onClick={() => setOpen(false)}><span className={`notification-severity notification-severity--${alert.severity}`} /><div><strong>{alert.title}</strong><small>{alert.culture_unit_name} · {alert.detail}</small></div></Link>)}</div> : <div className="notification-empty"><Check size={18} /> No active alerts</div>}
    </div>}
  </div>;
}
