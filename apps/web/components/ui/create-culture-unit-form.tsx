'use client';
import { useState } from 'react';
export function CreateCultureUnitForm() {
  const [open, setOpen] = useState(false); const [message, setMessage] = useState('');
  async function submit(data: FormData) { const response = await fetch('/api/culture-units', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.get('name'), kind: data.get('kind'), species: data.get('species'), stocked_fish_count: Number(data.get('stocked')), estimated_biomass_kg: Number(data.get('biomass')), geometry_label: data.get('geometry') }) }); if (response.ok) window.location.reload(); else setMessage('Check the required values and try again.'); }
  if (!open) return <button className="primary-button" type="button" onClick={() => setOpen(true)}>Add culture unit</button>;
  return <form className="panel create-form" action={submit}><h2>Onboard culture unit</h2><label>Name<input name="name" required /></label><label>Type<select name="kind"><option value="pond">Pond</option><option value="cage">Cage</option></select></label><label>Species<input name="species" defaultValue="Nile tilapia" required /></label><label>Stocked fish<input name="stocked" type="number" min="1" required /></label><label>Estimated biomass (kg)<input name="biomass" type="number" min="0.1" step="0.1" required /></label><label>Geometry<input name="geometry" required placeholder="600 m² · 1.2 m avg depth" /></label><button className="primary-button" type="submit">Save unit</button>{message && <p className="data-note">{message}</p>}</form>;
}
