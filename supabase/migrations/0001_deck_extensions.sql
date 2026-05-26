-- ═══════════════════════════════════════════════════════════════
-- DECK GENERATOR — Erweiterung CRM-Tabellen + neue Deck-Tabellen
-- Idempotent: kann mehrfach ausgeführt werden
-- ═══════════════════════════════════════════════════════════════

-- 1. crm_projects erweitern
ALTER TABLE crm_projects
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS location_district text,
  ADD COLUMN IF NOT EXISTS google_maps_url text,
  ADD COLUMN IF NOT EXISTS google_maps_screenshot_url text,
  ADD COLUMN IF NOT EXISTS poi_distances jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS payment_schedule jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS deck_texts jsonb DEFAULT '{"de":{},"en":{}}'::jsonb,
  ADD COLUMN IF NOT EXISTS calc_defaults jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS completion_months int,
  ADD COLUMN IF NOT EXISTS developer_class text,
  ADD COLUMN IF NOT EXISTS vat_refundable_shortterm boolean DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_projects_slug
  ON crm_projects(slug) WHERE slug IS NOT NULL;

-- 2. crm_project_units erweitern
ALTER TABLE crm_project_units
  ADD COLUMN IF NOT EXISTS block text,
  ADD COLUMN IF NOT EXISTS terrace_sqm numeric,
  ADD COLUMN IF NOT EXISTS price_gross numeric,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS floorplan_url text,
  ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0;

-- 3. Kategorisierte Deck-Bilder
CREATE TABLE IF NOT EXISTS project_deck_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES crm_projects(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  category text NOT NULL,
  caption_de text,
  caption_en text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deck_images_project ON project_deck_images(project_id);
CREATE INDEX IF NOT EXISTS idx_deck_images_category ON project_deck_images(category);

-- 4. Deck-Kunden (später durch leads ersetzt)
CREATE TABLE IF NOT EXISTS deck_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text,
  salutation text DEFAULT 'du',
  language text DEFAULT 'de',
  email text,
  notes text,
  last_calc_inputs jsonb,
  created_at timestamptz DEFAULT now()
);

-- 5. Generierte Decks (Logbuch)
CREATE TABLE IF NOT EXISTS decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES crm_projects(id),
  client_id uuid REFERENCES deck_clients(id),
  language text NOT NULL DEFAULT 'de',
  selected_unit_ids uuid[] DEFAULT ARRAY[]::uuid[],
  is_share_deal boolean DEFAULT false,
  include_calculation boolean DEFAULT false,
  pdf_storage_path text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decks_project ON decks(project_id);
CREATE INDEX IF NOT EXISTS idx_decks_client ON decks(client_id);

-- 6. RLS
ALTER TABLE project_deck_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- Idempotente Policy-Erstellung (DROP IF EXISTS, dann CREATE)
DROP POLICY IF EXISTS "auth_full_access" ON project_deck_images;
CREATE POLICY "auth_full_access" ON project_deck_images
  FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth_full_access" ON deck_clients;
CREATE POLICY "auth_full_access" ON deck_clients
  FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth_full_access" ON decks;
CREATE POLICY "auth_full_access" ON decks
  FOR ALL USING (auth.uid() IS NOT NULL);
