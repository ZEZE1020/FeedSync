import { Bell, Cpu, LayoutDashboard, Search, Settings, Utensils, Waves } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Wordmark } from '@/components/brand/wordmark';

export type AppSection = 'dashboard' | 'devices' | 'farms' | 'feeding' | 'settings';

const navigation = [
  { href: '/dashboard', icon: LayoutDashboard, id: 'dashboard', label: 'Overview' },
  { href: '/farms', icon: Waves, id: 'farms', label: 'Farms & units' },
  { href: '/feeding', icon: Utensils, id: 'feeding', label: 'Feed plans' },
  { href: '/devices', icon: Cpu, id: 'devices', label: 'Devices' },
] as const;

interface AppShellProps {
  active: AppSection;
  children: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}

export function AppShell({ active, children, description, eyebrow, title }: AppShellProps) {
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Wordmark href="/dashboard" />
        <nav className="side-nav" aria-label="Application navigation">
          <p className="nav-label">Workspace</p>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === active;
            return (
              <Link
                className={`side-nav__item${isActive ? ' side-nav__item--active' : ''}`}
                href={item.href}
                key={item.id}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar__footer">
          <div className="connection-status">
            <span aria-hidden="true" />
            <div>
              <strong>KijaniSpace connected</strong>
              <small>Lake Victoria · live</small>
            </div>
          </div>
          <Link
            className={`side-nav__item${active === 'settings' ? ' side-nav__item--active' : ''}`}
            href="/settings"
            aria-current={active === 'settings' ? 'page' : undefined}
          >
            <Settings size={18} strokeWidth={1.8} aria-hidden="true" />
            Settings
          </Link>
        </div>
      </aside>

      <div className="app-body">
        <header className="topbar">
          <div className="mobile-brand">
            <Wordmark compact href="/dashboard" />
          </div>
          <button className="search-trigger" type="button">
            <Search size={17} aria-hidden="true" />
            <span>Search farms, cages or devices</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="topbar__actions">
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={19} aria-hidden="true" />
              <span className="notification-dot" />
            </button>
            <div className="profile-chip" aria-label="Current user">
              <span>AO</span>
              <div>
                <strong>Amina Otieno</strong>
                <small>Farm manager</small>
              </div>
            </div>
          </div>
        </header>

        <nav className="mobile-nav" aria-label="Mobile application navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === active;
            return (
              <Link
                className={isActive ? 'mobile-nav__item--active' : ''}
                href={item.href}
                key={item.id}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="page-wrap">
          <header className="page-intro">
            <div>
              <p>{eyebrow ?? 'Kisumu farm cluster'}</p>
              <h1>{title}</h1>
              <span>{description}</span>
            </div>
            <time dateTime="2026-07-24">Friday, 24 July</time>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
