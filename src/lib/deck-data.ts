// Datenbuilder für das Sales-Deck-Template
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_DECK_TEXTS_DE,
  DEFAULT_PAYMENT_SCHEDULE,
  IMAGE_CATEGORY_KEYS,
  STORAGE_BUCKETS,
} from "@/lib/constants";
import type {
  CrmProject,
  CrmProjectUnit,
  DeckTextsDe,
  ProjectDeckImage,
  PaymentStep,
} from "@/lib/types";

function fmtEur(v: number | null | undefined) {
  if (v == null) return "—";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);
}
function fmtEurRange(min: number, max: number) {
  if (min === max) return fmtEur(min);
  return `${fmtEur(min)} – ${fmtEur(max)}`;
}
function fmtSqm(v: number) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(v);
}
function fmtSqmRange(min: number, max: number) {
  if (min === max) return `${fmtSqm(min)} m²`;
  return `${fmtSqm(min)} – ${fmtSqm(max)} m²`;
}

// Display-Kategorie aus type + bedrooms + terrace_sqm ableiten
// (db `type` ist auf studio/apartment/villa eingeschränkt — hier mehr Granularität)
function displayCategory(u: CrmProjectUnit): string {
  const t = (u.type ?? "").toLowerCase();
  const br = u.bedrooms ?? 0;
  const hasTerrace = (u.terrace_sqm ?? 0) > 0;
  if (t === "studio") return "Studio";
  if (t === "villa") return "Villa";
  // apartment
  if (br >= 3 && hasTerrace) return "Penthouse";
  if (br === 1) return "1-Schlafz.";
  if (br === 2) return "2-Schlafz.";
  if (br === 3) return "3-Schlafz.";
  return "Wohnung";
}

const CATEGORY_ORDER = ["Studio", "1-Schlafz.", "2-Schlafz.", "3-Schlafz.", "Penthouse", "Villa"];
function categoryRank(c: string) {
  const i = CATEGORY_ORDER.indexOf(c);
  return i === -1 ? 99 : i;
}

export type DeckData = {
  project: CrmProject;
  texts: DeckTextsDe;
  pois: { minutes: number; name: string }[];
  payment_schedule: (PaymentStep & { number: number })[];
  price_rows: {
    type: string;
    sqm_str: string;
    price_str: string;
    gross_str: string;
  }[];
  images: Record<string, string | null>;
  footer_label: string;
};

export async function buildDeckData(projectId: string): Promise<DeckData> {
  const admin = createAdminClient();

  const [{ data: project }, { data: units }, { data: images }] = await Promise.all([
    admin.from("crm_projects").select("*").eq("id", projectId).single(),
    admin
      .from("crm_project_units")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true })
      .order("unit_number", { ascending: true }),
    admin
      .from("project_deck_images")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (!project) throw new Error(`Project ${projectId} not found`);
  const p = project as CrmProject;

  // ─── Texte ────────────────────────────────────────────────────
  const texts: DeckTextsDe = {
    ...DEFAULT_DECK_TEXTS_DE,
    ...(p.deck_texts?.de ?? {}),
  } as DeckTextsDe;

  // ─── POIs ─────────────────────────────────────────────────────
  const pois = Array.isArray(p.poi_distances) ? p.poi_distances : [];

  // ─── Payment Schedule ─────────────────────────────────────────
  const paySrc =
    Array.isArray(p.payment_schedule) && p.payment_schedule.length > 0
      ? p.payment_schedule
      : DEFAULT_PAYMENT_SCHEDULE;
  const payment_schedule = paySrc.map((s, i) => ({ ...s, number: i + 1 }));

  // ─── Preisübersicht (gruppiert nach displayCategory) ──────────
  const unitsList = (units ?? []) as CrmProjectUnit[];
  const byType = new Map<string, CrmProjectUnit[]>();
  for (const u of unitsList) {
    const t = displayCategory(u);
    if (!byType.has(t)) byType.set(t, []);
    byType.get(t)!.push(u);
  }
  const price_rows = Array.from(byType.entries())
    .sort((a, b) => categoryRank(a[0]) - categoryRank(b[0]))
    .map(([type, list]) => {
      const sqms = list.map((u) => u.size_sqm ?? 0).filter((x) => x > 0);
      const prices = list.map((u) => u.price_net ?? 0).filter((x) => x > 0);
      const gross = list.map((u) => u.price_gross ?? 0).filter((x) => x > 0);
      const sqmStr = sqms.length ? fmtSqmRange(Math.min(...sqms), Math.max(...sqms)) : "—";
      const priceStr = prices.length ? fmtEurRange(Math.min(...prices), Math.max(...prices)) : "—";
      const grossStr = gross.length ? fmtEurRange(Math.min(...gross), Math.max(...gross)) : "—";
      return { type, sqm_str: sqmStr, price_str: priceStr, gross_str: grossStr };
    });

  // ─── Bilder pro Kategorie ─────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const imgs: Record<string, string | null> = {};
  const imageList = (images ?? []) as ProjectDeckImage[];
  for (const cat of IMAGE_CATEGORY_KEYS) {
    const first = imageList.find((i) => i.category === cat);
    if (!first || first.storage_path.startsWith("placeholder/")) {
      imgs[`${cat}_url`] = null;
    } else {
      imgs[`${cat}_url`] =
        `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKETS.images}/${first.storage_path}`;
    }
  }
  // ─── Maps fallback ────────────────────────────────────────────
  if (!imgs["lage_map_url"] && p.google_maps_screenshot_url) {
    imgs["lage_map_url"] = p.google_maps_screenshot_url;
  }

  const footer_label = `${p.name.toUpperCase()} · HAPPY PROPERTY`;

  return {
    project: p,
    texts,
    pois,
    payment_schedule,
    price_rows,
    images: imgs,
    footer_label,
  };
}
