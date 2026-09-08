import { NextResponse } from 'next/server';

const API = process.env.FEED_SYNC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
export async function GET() {
  const response = await fetch(`${API}/v1/alerts?resolved=false`, { cache: 'no-store' });
  if (!response.ok) return NextResponse.json([]);
  return NextResponse.json(await response.json());
}
