# VBN LinkedIn Composer

LinkedIn post composer for the Victorian Bioenergy Network. Runs on Raspberry Pi, served via Cloudflare tunnel.

## Features

- Unicode bold/italic formatting (works in LinkedIn)
- Bullet styles, dividers, hook templates
- Emoji picker
- Live HubSpot contact search with SQLite caching
- Pin/unpin contacts for quick @mention insertion
- Draft saving (SQLite, persisted on Pi)
- LinkedIn-style preview
- First comment field + hashtag selector

## Stack

- Next.js 14 (App Router)
- SQLite via `better-sqlite3`
- HubSpot CRM API (Private App token)
- Tailwind CSS
- Port 3003
- Cloudflare tunnel → `composer.spintelligence.org`

---

## Setup on Pi (rpiot03)

### 1. Clone the repo

```bash
cd /home/pi
git clone https://github.com/damogster/vbn-composer.git
cd vbn-composer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
nano .env.local
```

Set your HubSpot Private App token:
```
HUBSPOT_TOKEN=pat-na2-your-token-here
DB_PATH=/home/pi/vbn-composer/composer.db
```

**Getting your HubSpot token:**
1. HubSpot → Settings → Integrations → Private Apps
2. Create app with scope: `crm.objects.contacts.read`
3. Copy the token

### 4. Build

```bash
npm run build
```

### 5. Install systemd service

```bash
sudo cp systemd/vbn-composer.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable vbn-composer
sudo systemctl start vbn-composer
sudo systemctl status vbn-composer
```

### 6. Cloudflare tunnel

Add a new public hostname in the Cloudflare tunnel dashboard:

- **Tunnel:** `spintelligence` (UUID: `ca76f509-3b60-4443-ab9f-7c895176d0b1`)
- **Subdomain:** `composer`
- **Domain:** `spintelligence.org`
- **Service:** `http://localhost:3003`

Or via config file, add to `/home/pi/.cloudflared/config.yml`:

```yaml
ingress:
  - hostname: composer.spintelligence.org
    service: http://localhost:3003
  # ... your existing rules
```

Then restart the tunnel:
```bash
sudo systemctl restart cloudflared
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
cp /home/pi/vbn-composer/composer.db ~/backups/composer-$(date +%Y%m%d).db
```

---

## Updating

```bash
cd /home/pi/vbn-composer
git pull
npm install
npm run build
sudo systemctl restart vbn-composer
```
