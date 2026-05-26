# Happy Property — Sales Deck Generator

Standalone Next.js-App für die Generierung von PDF-Sales-Decks für Immobilienprojekte
(Cyprus → DACH-Kapitalanleger). Greift auf die bestehende CRM-Supabase-Instanz zu
und erweitert die Tabellen `crm_projects` / `crm_project_units` um Deck-spezifische
Felder.

Visuelles Vorbild: `reference/Emerald_Park_Sales_Deck.pdf` (13 Seiten A4 Landscape).

## Tech-Stack

- Next.js 16 (App Router) + TypeScript + React 19
- Tailwind CSS 4 + shadcn/ui
- Supabase (DB + Auth + Storage), gleiche Instanz wie CRM `vjlwgajmtqlwjjreowbu`
- Puppeteer + `@sparticuz/chromium` für PDF-Rendering (serverless-kompatibel)
- Mustache.js als HTML-Templating-Engine
- React Hook Form + Zod für Forms
- `sharp` für Image-Resize beim Upload

## Setup für neuen Entwickler

```bash
# 1. Repo klonen
git clone https://github.com/Ruebes/happy-property-decks.git
cd happy-property-decks

# 2. Dependencies installieren (--legacy-peer-deps wegen React 19 / Next 16 Konflikten)
npm install --legacy-peer-deps

# 3. ENV anlegen
cp .env.local.example .env.local
# Werte aus /Users/ArPritsch/Downloads/happy-property/.env übernehmen
#   (gleiche Supabase-Instanz wie CRM)

# 4. Migration prüfen und ausführen
#    supabase/migrations/0001_deck_extensions.sql
#    Entweder über Supabase Dashboard SQL Editor
#    oder via Management API mit SUPABASE_ACCESS_TOKEN

# 5. Storage-Buckets anlegen (per Skript)
npx tsx scripts/init-storage.ts

# 6. Dev-Server starten
npm run dev
# → http://localhost:3000
```

## Workflow für Sven

1. **Login** auf `/login` mit den gleichen Zugangsdaten wie im CRM
2. **Dashboard** zeigt alle Projekte aus `crm_projects` mit Status-Indikatoren
3. **Neues Projekt** über `+ Neues Projekt` (Name, Slug, City, District)
4. **Pflege** über `/projects/[slug]/edit`:
   - Stammdaten (Name, Slug, Developer, Completion-Months, VAT-Toggle)
   - Lage (Google Maps URL, POI-Distanzen)
   - Zahlungsplan (6 Schritte konfigurierbar)
   - Texte DE (alle Heading- und Body-Felder fürs Deck)
   - Calc-Defaults (für spätere Berechnung)
5. **Wohnungen** über `/projects/[slug]/units` (Tabelle mit Inline-Edit)
6. **Bilder** über `/projects/[slug]/images` (Upload mit Kategorie-Auswahl)
7. **Generieren** über `/projects/[slug]/generate` → PDF wird in Storage abgelegt,
   Download-Link erscheint

## Bekannte Limitierungen Phase 1

- Nur deutsche Texte (en-Schema ist in DB, Form nicht implementiert)
- Keine Kunden-Personalisierung (Anrede, Name in Deck)
- Keine integrierte Investment-Berechnung im Deck (Calc-Defaults werden gepflegt,
  aber nicht ins PDF gerendert)
- Keine Email-Versand-Pipeline

## Roadmap

- **Phase 2:** Kunden-Modul (deck_clients, Anrede, Personalisierung)
- **Phase 3:** Investment-Berechnung im Deck (ROI, Mietsteigerung, IRR)
- **Phase 4:** Englische Texte + Sprach-Switch im Generate-Step

## Getroffene Annahmen (autonom entschieden)

| Annahme | Grund |
|---------|-------|
| Next.js 16 statt 15 | `create-next-app@latest` installiert aktuell 16.2.6, funktional kompatibel mit Anforderungen |
| `src/`-Dir verwendet | Svens Original-Korrektur ("src-Dir ja"), passt zur App-Struktur-Vorgabe |
| Supabase-Keys neues Format (`sb_publishable_*` / `sb_secret_*`) | CRM nutzt bereits neues Format; `@supabase/ssr` ≥ 0.5 unterstützt beide. Falls Auth-Probleme: legacy JWT aus Supabase Dashboard → Settings → API → "Legacy API Keys" holen. |
| Lokaler npm-Cache (`/tmp/npm-cache-decks`) | Globaler `~/.npm/_cacache` hat einen von `root` angelegten Subordner, der EACCES wirft |
| `--legacy-peer-deps` bei allen npm installs | Next 16 + React 19 + shadcn haben unaufgelöste Peer-Konflikte (typische ERESOLVE) |
| `lucide-react@1.16.0` | Aktuell `latest` dist-tag — lucide hat 2025 eine 1.0 Major-Release gemacht |
| Image-Resize: max 1920px breit, 85% Quality, WEBP | Sven's Vorgabe (+ WEBP statt JPEG für kleinere Files in PDFs) |
| Storage-Bucket `deck-project-images` ist **public** | Schnelleres Laden in Puppeteer ohne signed-URL-Roundtrip |
| Storage-Bucket `deck-pdfs` ist **private** | Signed URLs mit 30 Tagen TTL |
| Reservierte Slugs: `new`, `api` | Konfliktvermeidung mit Routen |
| Toasts via Sonner | `<Toaster richColors />` global in layout |
| Confirm-Dialogs vor Delete | shadcn Alert Dialog, kein native `window.confirm` |

## Offene Punkte

- **Azure_Living_Sales_Deck_Jens.pdf nicht gefunden** in `~/Downloads/` — nur das
  Emerald-PDF lag dort. Layout-Referenz ausreichend.
- **Echte Projekt-Bilder fehlen** — alle Bilder sind Platzhalter mit grauen Boxen
  bis Sven über `/projects/[slug]/images` echte hochlädt.
- **Vercel-Deployment in Phase 1 nicht aktiv** — `vercel.json` ist vorbereitet,
  ENV-Sync-Befehle in der README dokumentiert, aber kein `vercel link` ausgeführt.
- **Migration nicht automatisch ausgeführt** — STOPP-Punkt 1, Sven prüft erst.

## FEHLENDE SECRETS

Keine. Alle benötigten Secrets stammen aus dem CRM-Repo (`/Users/ArPritsch/Downloads/happy-property/.env`)
und wurden automatisch in `.env.local` übernommen.

## Deployment (für später, nicht in Phase 1)

```bash
npm install -g vercel
vercel link --yes
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel --prod
```

`vercel.json` setzt `maxDuration: 30` für die `/api/render-deck`-Route.
