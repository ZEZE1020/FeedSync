import { KeyRound, Languages, Save, ShieldCheck } from 'lucide-react';

import { AppShell } from '@/components/layout/app-shell';
import { SectionHeading } from '@/components/ui/section-heading';
import { StatusBadge } from '@/components/ui/status-badge';

export default function SettingsPage() {
  return (
    <AppShell
      active="settings"
      title="Workspace settings"
      description="Manage farm defaults, integrations and interface preferences."
    >
      <div className="settings-grid">
        <section className="panel settings-section">
          <SectionHeading
            eyebrow="Integration"
            title="KijaniSpace connection"
            action={
              <StatusBadge dot tone="positive">
                Connected
              </StatusBadge>
            }
          />
          <div className="settings-row">
            <span className="settings-icon">
              <KeyRound size={19} />
            </span>
            <div>
              <strong>HTTP Basic authentication</strong>
              <p>Credentials are configured securely in the FastAPI environment.</p>
            </div>
          </div>
          <div className="settings-row">
            <span className="settings-icon">
              <ShieldCheck size={19} />
            </span>
            <div>
              <strong>Credential visibility</strong>
              <p>Username and password are never exposed to Next.js or browser code.</p>
            </div>
          </div>
        </section>
        <section className="panel settings-section">
          <SectionHeading eyebrow="Interface" title="Regional preferences" />
          <label className="form-field">
            <span>Farm timezone</span>
            <select defaultValue="Africa/Nairobi">
              <option>Africa/Nairobi (EAT)</option>
            </select>
          </label>
          <label className="form-field">
            <span>Measurement system</span>
            <select defaultValue="metric">
              <option value="metric">Metric (kg, °C, m)</option>
            </select>
          </label>
          <label className="form-field">
            <span>
              <Languages size={15} /> Interface language
            </span>
            <select defaultValue="en">
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
            </select>
          </label>
          <button className="primary-button" type="button">
            <Save size={16} /> Save preferences
          </button>
        </section>
      </div>
    </AppShell>
  );
}
