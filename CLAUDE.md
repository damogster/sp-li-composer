# SP-LI Composer — Claude Code Briefing

## What this is
LinkedIn post composer for Shaun Scallan — Unicode bold/italic formatting, hook templates, HubSpot contact search for @mentions, draft saving, and sending a finished post to Buffer as a draft. Internal tool, not public-facing; used across Shaun's personal, VBN, and SP Intelligence LinkedIn voices, not tied to any one of them.

Has no Buffer credentials of its own — "Send to Buffer as Draft" (`components/Composer.tsx`) posts to this
app's own `/api/send-to-buffer`, which relays server-to-server to sp-composer's `/api/buffer/draft`
(sp-composer is the only place in this ecosystem with real Buffer API keys; see `~/Projects/ECOSYSTEM.md`).
Only the main post body + hashtags go to Buffer — the "first comment" field isn't sent anywhere
automatically (Buffer's API here has no first-comment support), so that still gets copy-pasted in by hand
after the post goes live from Buffer, same as before.

## Stack
- Next.js 14 (App Router, TypeScript)
- SQLite via `better-sqlite3` — drafts, contacts cache, settings
- HubSpot CRM API — live contact search (Private App token)
- Tailwind CSS
- Port 3003

## Deployment target
- **Mac only**: launchd service, starts on login — `http://localhost:3003`
  - plist: `~/Library/LaunchAgents/org.spintelligence.sp-li-composer.plist`
  - logs: `/tmp/sp-li-composer.log`
- Raspberry Pi — not deployed

## Linked tools
- Content Orchestrator (sp-composer) — runs on this same Mac via launchd: `http://localhost:3004` (the
  header's external link points at the Pi instead, `http://100.103.100.63:3004` — worth double-checking
  that Tailscale IP is still current if that link ever 404s; `send-to-buffer` below always targets
  localhost, not that address)

## Key files
- `lib/db.ts` — SQLite singleton, schema auto-init on first run
- `lib/hubspot.ts` — HubSpot search with SQLite caching
- `lib/unicode.ts` — Unicode bold/italic conversion for LinkedIn
- `components/Composer.tsx` — main editor component; `fullPost` (body + hashtags) is what both "Copy
  post" and "Send to Buffer as Draft" use — the first comment is copy-only, never sent to Buffer
- `components/ContactSearch.tsx` — HubSpot live search + pin management
- `app/api/send-to-buffer/route.ts` — POST `{text, channel}`: relays to sp-composer's `/api/buffer/draft`
  server-to-server (no CORS issue, no Buffer key here) — `channel` is `'personal' | 'vbn' | 'spi'`
- `systemd/sp-li-composer.service` — Pi service file

## Environment variables (.env.local)
- `HUBSPOT_TOKEN` — HubSpot Private App token (scope: crm.objects.contacts.read)
- `DB_PATH` — absolute path to SQLite file (default: ./composer.db)
- `SP_COMPOSER_URL` — optional, default `http://localhost:3004`; where `send-to-buffer` relays to

## Dev
npm run dev        # port 3003
npm run build
npm start          # production, port 3003

## Mac deploy (after pulling changes)
npm install && npm run build
launchctl kickstart -k gui/$(id -u)/org.spintelligence.sp-li-composer

## Pi deploy (not currently in use)
git pull && npm install && npm run build && sudo systemctl restart sp-li-composer

## Owners
- Shaun Scallan (shaunscallan / damogster)
- SP Intelligence / Sustainability Plus Projects
