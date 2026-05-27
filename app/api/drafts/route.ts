import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = getDb()
    const drafts = db.prepare(`
      SELECT * FROM drafts ORDER BY updated_at DESC
    `).all()
    return NextResponse.json(drafts.map((d: any) => ({
      ...d,
      hashtags: JSON.parse(d.hashtags),
    })))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title = 'Untitled', body: postBody = '', first_comment = '', hashtags = [] } = body
    const db = getDb()
    const result = db.prepare(`
      INSERT INTO drafts (title, body, first_comment, hashtags)
      VALUES (?, ?, ?, ?)
    `).run(title, postBody, first_comment, JSON.stringify(hashtags))
    const draft = db.prepare(`SELECT * FROM drafts WHERE id = ?`).get(result.lastInsertRowid) as any
    return NextResponse.json({ ...draft, hashtags: JSON.parse(draft.hashtags) }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
