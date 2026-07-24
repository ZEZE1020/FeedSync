'use client';

import { useState } from 'react';
import type { CultureUnit } from '@/lib/api';

export function CreateFeedPlanForm({ units }: { units: CultureUnit[] }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(data: FormData) {
    setBusy(true); setMessage('');
    const response = await fetch('/api/feed-plans', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ culture_unit_id: data.get('culture_unit_id'), scheduled_for: new Date(String(data.get('scheduled_for'))).toISOString(), amount_kg: Number(data.get('amount_kg')), feed_name: data.get('feed_name'), owner_name: data.get('owner_name'), rationale: ['Created by farm operator'] }),
    });
    setBusy(false);
    setMessage(response.ok ? 'Plan created and awaiting approval.' : 'Could not create plan. Check the values and try again.');
    if (response.ok) window.location.reload();
  }
  return <form className="panel create-form" action={submit}>
    <h2>Create feed plan</h2>
    <label>Culture unit<select name="culture_unit_id" required>{units.map((u) => <option value={u.id} key={u.id}>{u.name}</option>)}</select></label>
    <label>Date and time<input name="scheduled_for" type="datetime-local" required /></label>
    <label>Amount (kg)<input name="amount_kg" type="number" min="0.1" step="0.1" required /></label>
    <label>Feed<input name="feed_name" defaultValue="Tilapia grower pellets" required /></label>
    <label>Owner<input name="owner_name" defaultValue="Farm operator" required /></label>
    <button className="primary-button" disabled={busy} type="submit">{busy ? 'Creating…' : 'Create plan'}</button>
    {message && <p className="data-note" role="status">{message}</p>}
  </form>;
}
