const API_BASE = process.env.FEED_SYNC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export interface ForecastDay {
  date: string;
  temperature_mean_c: number;
  temperature_min_c: number;
  temperature_max_c: number;
  windspeed_mean_m_s: number;
  windspeed_min_m_s: number;
  windspeed_max_m_s: number;
  precipitation_mm: number;
}

export interface WaterStaticContext {
  water_body_percentage: number;
  monthly_climatology_temperature_c: number | null;
  diffuse_attenuation_coefficient_m_1: number | null;
  chlorophyll_a_concentration_mg_m3: number | null;
  bathymetry_depth_m: number | null;
}

export interface WaterContextResponse {
  coordinates: { latitude: number; longitude: number };
  timezone: string;
  source: string;
  retrieved_at: string;
  static: WaterStaticContext;
  forecast: ForecastDay[];
}

export interface DashboardMetrics {
  feed_planned_kg: number;
  scheduled_feed_events: number;
  active_culture_units: number;
  pond_count: number;
  cage_count: number;
  online_devices: number;
  total_devices: number;
}

export interface AlertSummary {
  id: string;
  culture_unit_id: string;
  culture_unit_name: string;
  title: string;
  detail: string;
  severity: 'attention' | 'critical' | 'info';
  created_at: string;
  resolved: boolean;
}

export interface FeedPlanSummary {
  id: string;
  culture_unit_id: string;
  culture_unit_name: string;
  scheduled_for: string;
  amount_kg: number;
  feed_name: string;
  owner_name: string;
  status: 'approved' | 'awaiting_approval' | 'draft' | 'executed' | 'scheduled';
  rationale: string[];
}

export interface DashboardSummary {
  generated_at: string;
  data_mode: 'operational';
  metrics: DashboardMetrics;
  water_context: WaterContextResponse | null;
  context_error: string | null;
  alerts: AlertSummary[];
  upcoming_feedings: FeedPlanSummary[];
}

export async function getDashboardSummary(
  lat = -0.5,
  lon = 34.0,
): Promise<DashboardSummary> {
  const response = await fetch(
    `${API_BASE}/v1/dashboard/summary?lat=${lat}&lon=${lon}`,
    { next: { revalidate: 600 } },
  );
  if (!response.ok) {
    throw new Error(`Dashboard fetch failed: ${response.status}`);
  }
  return response.json() as Promise<DashboardSummary>;
}

export interface CultureUnit {
  id: string; name: string; kind: 'cage' | 'pond'; species: string;
  stocked_fish_count: number; estimated_biomass_kg: number; geometry_label: string;
  latest_temperature_c: number | null; health_status: 'attention' | 'healthy' | 'review';
}

export const lakeVictoriaTimeZone = 'Africa/Nairobi';

export interface Device {
  id: string; culture_unit_name: string; name: string; kind: string; status: 'online' | 'offline';
  latest_state: string; battery_label: string; last_seen_at: string;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export const getCultureUnits = () => getJson<CultureUnit[]>('/v1/culture-units');
export const getFeedPlans = () => getJson<FeedPlanSummary[]>('/v1/feed-plans');
export const getDevices = () => getJson<Device[]>('/v1/devices');

export interface CopilotBriefing {
  generated_at: string;
  headline: string;
  summary: string;
  priority: 'normal' | 'attention';
  confidence: string;
  actions: { label: string; href: string }[];
  evidence: { label: string; value: string }[];
}

export async function getCopilotBriefing(): Promise<CopilotBriefing> {
  try {
    return await getJson<CopilotBriefing>('/v1/copilot/briefing');
  } catch {
    return {
      generated_at: new Date().toISOString(),
      headline: 'Farm briefing is temporarily unavailable',
      summary: 'Review alerts and feed plans while the assistant reconnects.',
      priority: 'attention',
      confidence: 'low',
      actions: [{ label: 'Open alerts and devices', href: '/devices' }],
      evidence: [{ label: 'Assistant status', value: 'API unavailable' }],
    };
  }
}
