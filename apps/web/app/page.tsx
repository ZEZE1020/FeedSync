import { ArrowRight, Database, FishSymbol, Radio, Waves, Leaf, TrendingDown, Users, ShieldCheck, BarChart3, Clock } from 'lucide-react';
import Link from 'next/link';

import { Wordmark } from '@/components/brand/wordmark';

const workflow = [
  {
    icon: Database,
    number: '01',
    title: 'Collect Data',
    text: 'Combine satellite agro-climate context with on-site sensor readings and farmer observations from across all your units.',
  },
  {
    icon: FishSymbol,
    number: '02',
    title: 'Get Recommendations',
    text: 'AI-powered feeding recommendations that factor in biomass, water quality, species, and historical farm response.',
  },
  {
    icon: Radio,
    number: '03',
    title: 'Execute & Learn',
    text: 'Keep humans in control, automate feeding via connected devices, and continuously improve outcomes.',
  },
] as const;

const benefits = [
  {
    icon: TrendingDown,
    title: 'Reduce Feed Waste',
    text: 'Cut unnecessary feed costs by up to 30% with data-driven feeding schedules tailored to your farm\'s specific conditions.',
  },
  {
    icon: Leaf,
    title: 'Environmental Impact',
    text: 'Minimize environmental impact by only feeding what your fish need, reducing nutrient loading in lake cages and pond ecosystems.',
  },
  {
    icon: BarChart3,
    title: 'Track Performance',
    text: 'Comprehensive analytics and reporting to measure farm productivity, feed conversion ratios, and growth metrics.',
  },
  {
    icon: ShieldCheck,
    title: 'Full Traceability',
    text: 'Complete audit trail of all feeding decisions, environmental conditions, and farm activities for certification and compliance.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    text: 'Unified platform that keeps farm managers, field staff, and stakeholders all on the same page.',
  },
  {
    icon: Clock,
    title: 'Save Time',
    text: 'Automate routine tasks and reduce manual paperwork, freeing your team can focus on what matters most.',
  },
] as const;

export default function HomePage() {
  return (
    <main className="marketing-main">
      <nav className="marketing-nav" aria-label="Primary navigation">
        <Wordmark href="/" />
        <div className="marketing-nav__actions">
          <span className="outline-badge">v1.0 Launch</span>
          <Link className="nav-cta" href="/signup">
            Start Free Trial <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      <section className="marketing-hero">
        <p className="eyebrow">Intelligent Aquaculture Management Platform</p>
        <h1>
          Feed with context.
          <br />
          Farm with confidence.
        </h1>
        <p className="lede">
          The complete operating platform for sustainable fish farming. Combine IoT sensors, satellite
          data, and AI-powered recommendations to maximize yields while reducing waste across all your
          ponds and cages.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href="/signup">
            Start Your Free Trial <ArrowRight size={17} />
          </Link>
          <Link
            className="secondary-button"
            href="/demo"
          >
            Request a Demo
          </Link>
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
          <p className="panel-eyebrow">Works with any aquaculture system</p>
          <h2>Ponds and lake cages, unified management.</h2>
        </div>
        <p>
          Whether you manage small-scale ponds or large commercial cage operations, Feed Sync adapts to
          your geometry, species, and local environmental conditions with region-specific insights.
        </p>
      </section>

      <section className="marketing-workflow" aria-label="Feed Sync workflow" style={{ borderTop: '1px solid rgba(22, 58, 45, 0.16)', padding: '4rem 0' }}>
        <div style={{ maxWidth: '420px', marginBottom: '3rem' }}>
          <p className="panel-eyebrow">How it works</p>
          <h2 style={{ fontSize: '2rem', letterSpacing: '-0.035em', margin: '0.5rem 0 0 0', lineHeight: 1.1 }}>
            Simple workflow that fits how you already farm.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {workflow.map((step) => {
          const Icon = step.icon;
          return (
            <article key={step.number} style={{ minHeight: 'auto', padding: 0, borderLeft: 'none' }}>
              <div>
                <span>{step.number}</span>
                <Icon size={20} strokeWidth={1.7} />
              </div>
              <h2 style={{ margin: '2rem 0 0.7rem' }}>{step.title}</h2>
              <p>{step.text}</p>
            </article>
          );
        })}
        </div>
      </section>

      <section style={{ padding: '4rem 0', borderTop: '1px solid rgba(22, 58, 45, 0.16)' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem auto' }}>
          <p className="panel-eyebrow">Platform benefits</p>
          <h2 style={{ fontSize: '2.5rem', letterSpacing: '-0.04em', margin: '0.5rem 0', lineHeight: 1 }}>
            Everything you need to farm smarter.
          </h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '1.1rem', marginTop: '1.5rem', lineHeight: 1.6 }}>
            Built exclusively for fish farms in the Lake Victoria region, Feed Sync brings modern
            technology to age-old farming practices.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {benefits.slice(0, 6).map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div key={idx} style={{ padding: '1.5rem' }}>
                <div style={{ 
                  display: 'grid', width: '48px', height: '48px', placeItems: 'center', borderRadius: '12px', background: 'var(--lime)', marginBottom: '1rem'
                }}>
                  <Icon size={24} strokeWidth={1.7} color="var(--green)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>{benefit.title}</h3>
                <p style={{ color: 'var(--ink-soft)', lineHeight: 1.55, margin: 0 }}>{benefit.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ padding: '2rem 0 4rem 0', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <img 
            src="https://storage.googleapis.com/static-files-feesync/images/mother-son-walking-through-muddy-location.jpg"
            alt="Farmers walking through their aquaculture location, inspecting their farm operations"
            style={{ width: '100%', height: '300px', objectFit: 'cover' }}
            loading="lazy"
          />
        </div>
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <img 
            src="https://storage.googleapis.com/static-files-feesync/images/instasave.website_632339762_18422558923191359_7437398003708557096_n.jpg"
            alt="Fish farming operations in Lake Victoria - FeedSync helps farmers manage sustainable aquaculture"
            style={{ width: '100%', height: '300px', objectFit: 'cover' }}
            loading="lazy"
          />
        </div>
        <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '0.9rem', marginTop: '1rem' }}>
          FeedSync empowers local fish farmers across Lake Victoria with data-driven insights for sustainable, profitable operations.
        </p>
      </section>

      <section style={{ 
        background: 'var(--green)', 
        padding: '4rem', 
        borderRadius: 'var(--radius)',
        margin: '2rem 0 4rem 0',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2.2rem', color: 'white', margin: '0 0 1rem 0', letterSpacing: '-0.03em' }}>
          Ready to transform your fish farm?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
          Join hundreds of progressive fish farmers across East Africa who are already using Feed Sync
          to farm more sustainably and profitably.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/signup" style={{
            background: 'white',
            color: 'var(--green)',
            padding: '0.8rem 1.5rem',
            borderRadius: 'var(--radius-sm)',
            fontWeight: '700',
            textDecoration: 'none',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Get Started Today <ArrowRight size={16} />
          </Link>
          <a href="mailto:sales@feedsync.app" style={{
            border: '1px solid rgba(255,255,255,0.5)',
            color: 'white',
            padding: '0.8rem 1.5rem',
            borderRadius: 'var(--radius-sm)',
            fontWeight: '700',
            textDecoration: 'none',
            fontSize: '0.9rem'
          }}>
            Contact Sales
          </a>
        </div>
      </section>

      <footer className="marketing-footer">
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/features" style={{ color: 'var(--ink-soft)', textDecoration: 'none', fontSize: '0.8rem' }}>Features</Link>
          <Link href="/pricing" style={{ color: 'var(--ink-soft)', textDecoration: 'none', fontSize: '0.8rem' }}>Pricing</Link>
          <Link href="https://feedsync-api-975790420809.europe-west10.run.app/docs" style={{ color: 'var(--ink-soft)', textDecoration: 'none', fontSize: '0.8rem' }}>Documentation</Link>
          <a href="https://www.kijanispace.eu/" target="_blank" rel="noreferrer" style={{ color: 'var(--ink-soft)', textDecoration: 'none', fontSize: '0.8rem' }}>KijaniSpace</a>
        </div>
        <span>© 2026 Feed Sync. Lake Victoria, East Africa.</span>
      </footer>
    </main>
  );
}