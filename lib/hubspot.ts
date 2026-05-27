import { getDb } from './db'

const HS_BASE = 'https://api.hubapi.com'

function getToken() {
  const token = process.env.HUBSPOT_TOKEN
  if (!token) throw new Error('HUBSPOT_TOKEN not set in environment')
  return token
}

export type HubSpotContact = {
  id: string
  name: string
  org: string
  job_title: string
  type: 'person' | 'org'
}

export async function searchHubSpotContacts(query: string): Promise<HubSpotContact[]> {
  const db = getDb()

  // Check cache first
  const cacheTtl = Number(
    (db.prepare(`SELECT value FROM settings WHERE key = 'hs_cache_ttl_minutes'`).get() as any)?.value ?? 60
  )
  const cached = db.prepare(`
    SELECT * FROM contacts
    WHERE source = 'hubspot'
      AND name LIKE ?
      AND last_seen > datetime('now', ? || ' minutes')
    ORDER BY pinned DESC, name ASC
    LIMIT 20
  `).all(`%${query}%`, `-${cacheTtl}`) as any[]

  if (cached.length > 0) {
    return cached.map(rowToContact)
  }

  // Fetch from HubSpot
  const body = {
    filterGroups: [],
    query,
    properties: ['firstname', 'lastname', 'company', 'jobtitle'],
    limit: 20,
    sorts: [{ propertyName: 'lastname', direction: 'ASCENDING' }],
  }

  const res = await fetch(`${HS_BASE}/crm/v3/objects/contacts/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`HubSpot API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const results: HubSpotContact[] = []

  const upsert = db.prepare(`
    INSERT INTO contacts (hs_id, name, org, job_title, type, source, last_seen)
    VALUES (@hs_id, @name, @org, @job_title, @type, 'hubspot', datetime('now'))
    ON CONFLICT(hs_id) DO UPDATE SET
      name = excluded.name,
      org = excluded.org,
      job_title = excluded.job_title,
      last_seen = excluded.last_seen
  `)

  const upsertMany = db.transaction((records: any[]) => {
    for (const r of records) upsert.run(r)
  })

  const rows = []
  for (const item of data.results ?? []) {
    const p = item.properties ?? {}
    const firstName = p.firstname ?? ''
    const lastName = p.lastname ?? ''
    const name = [firstName, lastName].filter(Boolean).join(' ').trim() || p.hs_full_name_or_email || 'Unknown'

    // Skip obvious non-person entries
    if (!name || name.includes('@') || name.length < 2) continue

    const contact: HubSpotContact = {
      id: item.id,
      name,
      org: p.company ?? '',
      job_title: p.jobtitle ?? '',
      type: 'person',
    }
    results.push(contact)
    rows.push({ hs_id: item.id, name, org: p.company ?? '', job_title: p.jobtitle ?? '', type: 'person' })
  }

  upsertMany(rows)
  return results
}

function rowToContact(row: any): HubSpotContact {
  return {
    id: row.hs_id ?? String(row.id),
    name: row.name,
    org: row.org ?? '',
    job_title: row.job_title ?? '',
    type: row.type ?? 'person',
  }
}

export async function searchCachedContacts(query: string): Promise<HubSpotContact[]> {
  const db = getDb()
  const rows = db.prepare(`
    SELECT * FROM contacts
    WHERE name LIKE ? OR org LIKE ?
    ORDER BY pinned DESC, name ASC
    LIMIT 20
  `).all(`%${query}%`, `%${query}%`) as any[]
  return rows.map(rowToContact)
}
