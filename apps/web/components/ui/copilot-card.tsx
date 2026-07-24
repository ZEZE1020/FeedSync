import { ArrowUpRight, Bot, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import type { CopilotBriefing } from '@/lib/api';

export function CopilotCard({ briefing }: { briefing: CopilotBriefing }) {
  return <section className="panel copilot-card" aria-label="Farm copilot briefing">
    <div className="copilot-card__top"><span className="copilot-icon"><Bot size={20} /></span><div><p className="panel-eyebrow">Farm copilot · explainable</p><h2>{briefing.headline}</h2></div><span className={`copilot-priority copilot-priority--${briefing.priority}`}>{briefing.priority}</span></div>
    <p className="copilot-summary">{briefing.summary}</p>
    <div className="copilot-evidence">{briefing.evidence.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>
    <div className="copilot-actions">{briefing.actions.map((action) => <Link className="secondary-button" href={action.href} key={action.href}>{action.label} <ArrowUpRight size={15} /></Link>)}<span className="copilot-confidence"><CheckCircle2 size={14} /> {briefing.confidence} confidence</span></div>
  </section>;
}
