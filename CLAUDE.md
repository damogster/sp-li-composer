# SP-LI Composer — Claude Code Briefing

## What this is
LinkedIn post composer for the Victorian Bioenergy Network (VBN). Internal tool, not public-facing.

## Stack
- Next.js 14 (App Router, TypeScript)
- SQLite via `better-sqlite3` — drafts, contacts cache, settings
- HubSpot CRM API — live contact search (Private App token)
- Tailwind CSS
- Port 3003

## Deployment target
- Mac (primary): runs as a launchd service, starts on login
  - plist: `~/Library/LaunchAgents/org.spintelligence.sp-li-composer.plist`
  - logs: `/tmp/sp-li-composer.log`
- Raspberry Pi `rpiot03` (Tailscale hostname) — not currently in use
  - systemd service: `sp-li-composer`

## Key files
- `lib/db.ts` — SQLite singleton, schema auto-init on first run
- `lib/hubspot.ts` — HubSpot search with SQLite caching
- `lib/unicode.ts` — Unicode bold/italic conversion for LinkedIn
- `components/Composer.tsx` — main editor component
- `components/ContactSearch.tsx` — HubSpot live search + pin management
- `systemd/sp-li-composer.service` — Pi service file

## Environment variables (.env.local)
- `HUBSPOT_TOKEN` — HubSpot Private App token (scope: crm.objects.contacts.read)
- `DB_PATH` — absolute path to SQLite file (default: ./composer.db)

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
