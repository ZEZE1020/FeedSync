import { ArrowRight, Database, FishSymbol, Radio, Waves } from 'lucide-react';
import Link from 'next/link';

import { Wordmark } from '@/components/brand/wordmark';

const workflow = [
  {
    icon: Database,
    number: '01',
    title: 'Observe',
    text: 'Combine KijaniSpace context with pond or cage measurements and farmer observations.',
  },
  {
    icon: FishSymbol,
    number: '02',
    title: 'Decide',
    text: 'Draft a transparent feeding plan from biomass, feed, environment and recent response.',
  },
  {
    icon: Radio,
    number: '03',
    title: 'Confirm',
    text: 'Keep the farmer in control, then record actual feed and device acknowledgement.',
  },
] as const;

export default function HomePage() {
  return (
    <main className="marketing-main">
      <nav className="marketing-nav" aria-label="Primary navigation">
        <Wordmark />
        <div className="marketing-nav__actions">
          <span className="outline-badge">KijaniSpace Hackathon</span>
          <Link className="nav-cta" href="/dashboard">
            Open dashboard <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      <section className="marketing-hero">
        <p className="eyebrow">Fish-farm decision support</p>
        <h1>
          Feed with context.
          <br />
          Farm with confidence.
        </h1>
        <p className="lede">
          A shared operating view for feeding decisions, water conditions and field devices across
          cages and ponds in the Lake Victoria region.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href="/dashboard">
            Explore the workspace <ArrowRight size={17} />
          </Link>
          <a
            className="secondary-button"
            href="https://api.kijanispace.eu/docs#/"
            target="_blank"
            rel="noreferrer"
          >
            View KijaniSpace API
          </a>
        </div>
      </section>

      <section className="marketing-system-card" aria-label="Supported culture systems">
        <div className="system-visual">
          <span>
            <Waves size={24} />
          </span>
          <span>
            <FishSymbol size={24} />
          </span>
        </div>
        <div>
          <p className="panel-eyebrow">Built for both systems</p>
          <h2>Ponds and lake cages, one operating view.</h2>
        </div>
        <p>
          Shared workflows with the geometry, observations and environmental context each system
          needs.
        </p>
      </section>

      <section className="marketing-workflow" aria-label="Feed Sync workflow">
        {workflow.map((step) => {
          const Icon = step.icon;
          return (
            <article key={step.number}>
              <div>
                <span>{step.number}</span>
                <Icon size={20} strokeWidth={1.7} />
              </div>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
            </article>
          );
        })}
      </section>

      <footer className="marketing-footer">
        <span>Designed for people in the loop</span>
        <span>Lake Victoria · 2026</span>
      </footer>
    </main>
  );
}
