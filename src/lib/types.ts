// ═══════════════════════════════════════════════════════════════
// DB & Domain Types
// Manuell aus 0001_deck_extensions.sql gepflegt (kein supabase gen)
// ═══════════════════════════════════════════════════════════════

export type Poi = { minutes: number; name: string };

export type PaymentStep = {
  percent: string;
  label: string;
  trigger: string;
};

export type UspFeature = { value: string; label: string };

export type CtaStep = { number: string; title: string; text: string };

export type ExtrasRow = {
  name: string;
  studio: string;
  br1: string;
  br2: string;
  br3: string;
};

export type DeckTextsDe = {
  hero_subtitle: string;
  lage_heading: string;
  lage_text: string;
  standort_heading: string;
  projekt_heading: string;
  projekt_subtitle: string;
  usp_heading: string;
  usp_subtitle: string;
  usp_features: UspFeature[];
  amenities_heading: string;
  amenities_subtitle: string;
  preise_heading: string;
  preise_subtitle: string;
  preise_footer: string;
  preise_footer_text: string;
  extras_heading: string;
  extras_subtitle: string;
  extras_table: ExtrasRow[];
  extras_included_title: string;
  extras_included_text: string;
  interior_heading_1: string;
  interior_subtitle_1: string;
  interior_heading_2: string;
  interior_subtitle_2: string;
  highlight_heading: string;
  highlight_subtitle: string;
  highlight_value: string;
  highlight_value_label: string;
  zahlungsplan_heading: string;
  zahlungsplan_subtitle: string;
  zahlungsplan_footer: string;
  cta_heading: string;
  cta_subtitle: string;
  cta_steps: CtaStep[];
  cta_disclaimer: string;
};

export type CalcDefaults = {
  gross_yield_pct: number;
  rent_growth_pct: number;
  value_growth_pct: number;
  cost_pct: number;
  furniture_cost: number;
  furniture_included: boolean;
};

// CRM-Project (relevante Spalten — die CRM hat viele weitere)
export type CrmProject = {
  id: string;
  name: string;
  slug: string | null;
  location: string | null;
  location_district: string | null;
  developer: string | null;
  developer_class: string | null;
  completion_months: number | null;
  vat_refundable_shortterm: boolean | null;
  google_maps_url: string | null;
  google_maps_screenshot_url: string | null;
  poi_distances: Poi[];
  payment_schedule: PaymentStep[];
  deck_texts: { de?: Partial<DeckTextsDe>; en?: Record<string, unknown> };
  calc_defaults: Partial<CalcDefaults>;
  created_at?: string;
  updated_at?: string;
};

export type CrmProjectUnit = {
  id: string;
  project_id: string;
  unit_number: string | null;
  type: string | null;
  bedrooms: number | null;
  size_sqm: number | null;
  terrace_sqm: number | null;
  block: string | null;
  price_net: number | null;
  price_gross: number | null;
  hero_image_url: string | null;
  floorplan_url: string | null;
  sort_order: number | null;
};

export type ProjectDeckImage = {
  id: string;
  project_id: string;
  storage_path: string;
  category: string;
  caption_de: string | null;
  caption_en: string | null;
  sort_order: number;
  created_at?: string;
};

export type DeckRow = {
  id: string;
  project_id: string;
  client_id: string | null;
  language: string;
  selected_unit_ids: string[];
  is_share_deal: boolean;
  include_calculation: boolean;
  pdf_storage_path: string | null;
  created_at?: string;
};
