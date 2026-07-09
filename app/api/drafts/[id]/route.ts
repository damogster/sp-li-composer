import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = getDb()
    const draft = db.prepare(`SELECT * FROM drafts WHERE id = ?`).get(id) as any
    if (!draft) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...draft, hashtags: JSON.parse(draft.hashtags) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const db = getDb()
    const existing = db.prepare(`SELECT * FROM drafts WHERE id = ?`).get(id)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const fields: string[] = []
    const values: any[] = []

    if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title) }
    if (body.body !== undefined) { fields.push('body = ?'); values.push(body.body) }
    if (body.first_comment !== undefined) { fields.push('first_comment = ?'); values.push(body.first_comment) }
    if (body.hashtags !== undefined) { fields.push('hashtags = ?'); values.push(JSON.stringify(body.hashtags)) }

    fields.push(`updated_at = datetime('now')`)
    values.push(id)

    db.prepare(`UPDATE drafts SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    const draft = db.prepare(`SELECT * FROM drafts WHERE id = ?`).get(id) as any
    return NextResponse.json({ ...draft, hashtags: JSON.parse(draft.hashtags) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = getDb()
    db.prepare(`DELETE FROM drafts WHERE id = ?`).run(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
