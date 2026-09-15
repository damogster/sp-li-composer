# SP-LI Composer

LinkedIn post composer for Shaun Scallan. Internal tool, not public-facing — used across Shaun's
personal, VBN, and SP Intelligence LinkedIn voices, not tied to any one of them.

## Features

- Unicode bold/italic formatting (works in LinkedIn)
- Bullet styles, dividers, hook templates
- Emoji picker
- Live HubSpot contact search with SQLite caching
- Pin/unpin contacts for quick @mention insertion
- Draft saving (SQLite)
- LinkedIn-style preview
- First comment field + hashtag selector

## Stack

- Next.js 15 (App Router, TypeScript)
- SQLite via `better-sqlite3`
- HubSpot CRM API (Private App token)
- Tailwind CSS
- Port 3003

---

## Setup on Mac (current deployment)

```bash
git clone https://github.com/damogster/sp-li-composer.git
cd sp-li-composer
npm install
cp .env.example .env.local
```

Set your HubSpot Private App token in `.env.local`:
```
HUBSPOT_TOKEN=pat-na2-your-token-here
DB_PATH=./composer.db
```

**Getting your HubSpot token:**
1. HubSpot → Settings → Integrations → Private Apps
2. Create app with scope: `crm.objects.contacts.read`
3. Copy the token

```bash
npm run build
```

Runs as a launchd service (starts on login) at `http://localhost:3003`, via a plist already installed at
`~/Library/LaunchAgents/org.spintelligence.sp-li-composer.plist` (not checked into this repo). Logs:
`/tmp/sp-li-composer.log`.

## Setup on Raspberry Pi (prepared, not currently deployed)

```bash
git clone https://github.com/damogster/sp-li-composer.git ~/sp-li-composer
cd ~/sp-li-composer
npm install && npm run build
echo 'HUBSPOT_TOKEN=your-token-here' > .env.local
sudo cp systemd/sp-li-composer.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable sp-li-composer
sudo systemctl start sp-li-composer
```

---

## Development

```bash
npm run dev   # runs on port 3003
```

---

## Database

SQLite file lives at the path set in `DB_PATH` (default: `./composer.db`).

Schema is auto-initialised on first run. Tables:
- `drafts` — post drafts
- `contacts` — HubSpot cache + manual contacts + pin state
- `settings` — default hashtags, cache TTL

**Backup:**
```bash
cp composer.db ~/backups/composer-$(date +%Y%m%d).db
```

---

## Updating

```bash
git pull
npm install
npm run build
launchctl kickstart -k gui/$(id -u)/org.spintelligence.sp-li-composer   # Mac
# or, on the Pi:
sudo systemctl restart sp-li-composer
```

## Owners
- Shaun Scallan (shaunscallan / damogster)
- SP Intelligence / Sustainability Plus Projects
