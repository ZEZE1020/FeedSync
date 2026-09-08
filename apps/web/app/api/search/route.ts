import { NextResponse } from 'next/server';

const API = process.env.FEED_SYNC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
export async function GET(request: Request) {
  const resource = new URL(request.url).searchParams.get('resource');
  const endpoint = resource === 'devices' ? '/v1/devices' : '/v1/culture-units';
  const response = await fetch(`${API}${endpoint}`, { cache: 'no-store' });
  if (!response.ok) return NextResponse.json([]);
  const items = await response.json();
  return NextResponse.json(items.map((item: { id: string; name: string; kind?: string; culture_unit_name?: string }) => ({ id: item.id, name: item.name ?? item.culture_unit_name, detail: item.kind ?? 'Culture unit', href: resource === 'devices' ? '/devices' : '/farms' })));
}
