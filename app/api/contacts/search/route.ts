import { NextRequest, NextResponse } from 'next/server'
import { searchHubSpotContacts, searchCachedContacts } from '@/lib/hubspot'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], source: 'none' })
  }

  try {
    // Try live HubSpot first
    const results = await searchHubSpotContacts(q)
    return NextResponse.json({ results, source: 'hubspot' })
  } catch (err) {
    console.warn('HubSpot search failed, falling back to cache:', err)
    // Fall back to cached contacts if HubSpot is unreachable
    const results = await searchCachedContacts(q)
    return NextResponse.json({ results, source: 'cache' })
  }
}
