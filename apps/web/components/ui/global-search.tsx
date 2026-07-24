'use client';

import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Result = { id: string; name: string; detail: string; href: string };

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(true); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (!open) return;
    Promise.all([fetch('/api/search?resource=units').then((r) => r.json()), fetch('/api/search?resource=devices').then((r) => r.json())]).then(([units, devices]) => setResults([...units, ...devices]));
  }, [open]);
  const filtered = results.filter((item) => `${item.name} ${item.detail}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <button className="search-trigger" type="button" onClick={() => setOpen(true)}><Search size={17} aria-hidden="true" /><span>Search farms, cages or devices</span><kbd>⌘ K</kbd></button>
    {open && <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search farm resources" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><div className="search-dialog"><div className="search-dialog__input"><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search farms, cages or devices" /><button type="button" onClick={() => setOpen(false)} aria-label="Close search"><X size={18} /></button></div><div className="search-results">{filtered.length ? filtered.map((item) => <Link href={item.href} key={item.id} onClick={() => setOpen(false)}><strong>{item.name}</strong><small>{item.detail}</small></Link>) : <p>No matching farm resources.</p>}</div></div></div>}
  </>;
}
