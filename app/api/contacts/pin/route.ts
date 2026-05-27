import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/contacts/pin — list all pinned contacts
export async function GET() {
  try {
    const db = getDb()
    const contacts = db.prepare(`
      SELECT * FROM contacts WHERE pinned = 1 ORDER BY name ASC
    `).all()
    return NextResponse.json(contacts)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/contacts/pin — pin an existing contact or create + pin a manual one
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = getDb()

    if (body.hs_id) {
      // Pin a HubSpot contact already in the cache
      db.prepare(`UPDATE contacts SET pinned = 1 WHERE hs_id = ?`).run(body.hs_id)
    } else if (body.name) {
      // Create and pin a manual contact
      db.prepare(`
        INSERT INTO contacts (name, org, job_title, type, pinned, source)
        VALUES (?, ?, ?, ?, 1, 'manual')
        ON CONFLICT(hs_id) DO UPDATE SET pinned = 1
      `).run(body.name, body.org ?? '', body.job_title ?? '', body.type ?? 'person')
    } else {
      return NextResponse.json({ error: 'Provide hs_id or name' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/contacts/pin?id=123 — unpin a contact
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const db = getDb()
    db.prepare(`UPDATE contacts SET pinned = 0 WHERE id = ?`).run(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
