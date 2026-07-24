import { NextResponse } from 'next/server';
const API = process.env.FEED_SYNC_API_BASE_URL ?? 'http://localhost:3001';
export async function POST(request: Request) {
  const response = await fetch(`${API}/v1/culture-units`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: await request.text() });
  return NextResponse.json(await response.json(), { status: response.status });
}
