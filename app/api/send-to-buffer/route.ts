import { NextRequest, NextResponse } from 'next/server'

// sp-composer owns the actual Buffer credentials/client — this just
// relays to its generic draft endpoint, server-to-server (no CORS issue,
// no Buffer key duplicated here). Both run on this same Mac via launchd,
// so localhost is the default; SP_COMPOSER_URL overrides it if needed.
const SP_COMPOSER_URL = process.env.SP_COMPOSER_URL || 'http://localhost:3004'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { text, channel, image } = body as {
    text?: string
    channel?: string
    image?: { dataBase64: string; filename: string; mimeType: string }
  }
  if (!text?.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }
  if (!channel) {
    return NextResponse.json({ error: 'channel is required' }, { status: 400 })
  }

  let res: Response
  try {
    res = await fetch(`${SP_COMPOSER_URL}/api/buffer/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, text: text.trim(), image }),
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Could not reach sp-composer at ${SP_COMPOSER_URL} — is it running? (${err instanceof Error ? err.message : 'fetch failed'})` },
      { status: 502 }
    )
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return NextResponse.json({ error: data.error || 'sp-composer rejected the request' }, { status: res.status })
  }
  return NextResponse.json(data)
}
