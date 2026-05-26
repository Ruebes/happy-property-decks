import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { IMAGE_CATEGORY_KEYS } from "@/lib/constants";

export const runtime = "nodejs";

// Volle Texte aus Emerald-Park-Referenz-PDF
const EMERALD_TEXTS = {
  hero_subtitle:
    "Exklusive Investmentwohnungen in Geroskipou — Pre-Sale-Konditionen bis Fertigstellung 2027.",
  lage_heading: "Mitten in Geroskipou — und doch grün.",
  lage_text:
    "Eingebettet in eines der schönsten und ruhigsten Wohnviertel von Paphos. Stadt, Strand und Berge in unter 15 Minuten erreichbar.",
  standort_heading: "Alles in unter 15 Minuten.",
  projekt_heading: "Modern. Effizient. Wertstabil.",
  projekt_subtitle:
    "Direkte Parklage · A+ Energieeffizienz · Hochwertige Ausstattung · Smart-Home-ready",
  usp_heading: "Mehr als Wohnen.",
  usp_subtitle: "Das Community-Gebäude — exklusiv für Bewohner und Gäste.",
  usp_features: [
    { value: "Pool", label: "Lap- & Familienpool" },
    { value: "Gym", label: "Fitness · Yoga · Sauna" },
    { value: "Café", label: "Bar & Lounge" },
    { value: "Co-Working", label: "Arbeiten mit Aussicht" },
    { value: "Spa", label: "Wellness & Spa" },
    { value: "Lobby", label: "24/7 Concierge" },
  ],
  amenities_heading: "Ausstattung auf Boutique-Hotel-Niveau.",
  amenities_subtitle: "Alles vor der Haustür — täglich nutzbar.",
  preise_heading: "Transparente Preise.",
  preise_subtitle:
    "Brutto inkl. 19 % MwSt. · Bei Kurzzeitvermietung rückerstattungsfähig.",
  preise_footer: "VAT bei Kurzzeitvermietung",
  preise_footer_text:
    "Werden die Einheiten als kurzzeitvermietete Ferienwohnungen genutzt, ist die MwSt. in der Regel rückerstattungsfähig.",
  extras_heading: "Optionale Pakete.",
  extras_subtitle:
    "Individuell konfigurierbar · Alle Preise netto zzgl. 19% MwSt.",
  extras_table: [
    { name: "Photovoltaik-Anlage", studio: "5.000 € / 3 kWp", br1: "5.000 € / 3 kWp", br2: "6.000 € / 4,1 kWp", br3: "6.000 € / 4,1 kWp" },
    { name: "Fußbodenheizung", studio: "3.000 €", br1: "3.500 €", br2: "5.000 €", br3: "6.000 €" },
    { name: "Möblierungspaket", studio: "16.000 €", br1: "17.000 €", br2: "19.000 €", br3: "21.000 €" },
    { name: "Elektrogeräte", studio: "5.000 €", br1: "5.000 €", br2: "5.000 €", br3: "5.000 €" },
  ],
  extras_included_title: "Im Kaufpreis enthalten:",
  extras_included_text:
    "Gemeinschaftspool · Überdachter Parkplatz · Lagerraum · Klimaanlagen in allen Räumen · Doppelverglasung · Elektrische Rollläden in allen Schlafzimmern · Einbauküche · Einbauschränke · Vorrüstung Elektroauto-Ladestation · Gegensprechanlage · Geschlossene Einfahrt",
  interior_heading_1: "Wohnen. Kochen. Leben.",
  interior_subtitle_1: "Hochwertige Ausstattung, durchdachte Grundrisse.",
  interior_heading_2: "Rückzug & Komfort.",
  interior_subtitle_2: "Private Rückzugsorte auf Boutique-Hotel-Niveau.",
  highlight_heading: "Penthouses mit privater Dachterrasse.",
  highlight_subtitle:
    "Bis zu 111 m² Außenfläche · Pergola · Photovoltaik · Panorama-Aussicht",
  highlight_value: "111 m²",
  highlight_value_label: "Private Dachterrasse",
  zahlungsplan_heading: "Kapital bleibt flexibel.",
  zahlungsplan_subtitle:
    "Zahlung nach Baufortschritt — nicht vorab. Fertigstellung in 18 Monaten ab Baustart.",
  zahlungsplan_footer:
    "Zahlungen immer erst nach Bauabschnitt · Alle Beträge zzgl. MwSt. · VAT bei Kurzzeitvermietung rückerstattungsfähig",
  cta_heading: "Jetzt Einheit sichern.",
  cta_subtitle: "Die besten Units gehen zuerst — Reservierung bereits ab 10.000 €.",
  cta_steps: [
    { number: "01", title: "Reservieren", text: "Wunsch-Einheit mit 10.000 € sichern" },
    { number: "02", title: "Vertrag", text: "Anwalt + Reservierung, 30 % bei Vertrag" },
    { number: "03", title: "Bau & Übergabe", text: "Restzahlung in 5 Raten bis Schlüsselübergabe" },
  ],
  cta_disclaimer:
    "Bilder und Informationen vorbehaltlich Planungsgenehmigung · Nur für Marketingzwecke",
};

const EMERALD_POIS = [
  { minutes: 4, name: "Neon Mall" },
  { minutes: 5, name: "Autobahn Limassol" },
  { minutes: 6, name: "Zentrum Paphos" },
  { minutes: 7, name: "Cabana Beach" },
  { minutes: 7, name: "Lumio School" },
  { minutes: 15, name: "Flughafen Paphos" },
];

const EMERALD_PAYMENTS = [
  { percent: "10.000 €", label: "RESERVIERUNG", trigger: "+30% bei Vertrag" },
  { percent: "30%", label: "ROHBAU", trigger: "Fundament & Rohbau" },
  { percent: "20%", label: "VERPUTZ", trigger: "Mauerwerk & Verputz" },
  { percent: "10%", label: "FLIESEN", trigger: "nach Fliesen" },
  { percent: "5%", label: "FENSTER", trigger: "Aluminiumfenster" },
  { percent: "5%", label: "ÜBERGABE", trigger: "Schlüsselübergabe" },
];

// type-Spalte hat Check-Constraint: nur 'villa'|'apartment'|'studio'
// Display-Differenzierung Studio/1BR/2BR/Penthouse passiert im deck-data via bedrooms + terrace_sqm
const EMERALD_UNITS = [
  { unit_number: "A101", bedrooms: 1, type: "studio",    size_sqm: 47.5,  terrace_sqm: null, price_net: 165000, price_gross: 196350, block: "A" },
  { unit_number: "A102", bedrooms: 1, type: "studio",    size_sqm: 47.5,  terrace_sqm: null, price_net: 165000, price_gross: 196350, block: "A" },
  { unit_number: "A103", bedrooms: 1, type: "apartment", size_sqm: 62.0,  terrace_sqm: null, price_net: 210000, price_gross: 249900, block: "A" },
  { unit_number: "A104", bedrooms: 1, type: "apartment", size_sqm: 68.5,  terrace_sqm: null, price_net: 230000, price_gross: 273700, block: "A" },
  { unit_number: "A201", bedrooms: 2, type: "apartment", size_sqm: 100.5, terrace_sqm: null, price_net: 320000, price_gross: 380800, block: "A" },
  { unit_number: "A202", bedrooms: 2, type: "apartment", size_sqm: 104.5, terrace_sqm: null, price_net: 340000, price_gross: 404600, block: "A" },
  { unit_number: "A301", bedrooms: 3, type: "apartment", size_sqm: 104.5, terrace_sqm: 50,   price_net: 420000, price_gross: 499800, block: "A" },
  { unit_number: "A302", bedrooms: 3, type: "apartment", size_sqm: 107.5, terrace_sqm: 60,   price_net: 430000, price_gross: 511700, block: "A" },
  { unit_number: "A303", bedrooms: 3, type: "apartment", size_sqm: 122.5, terrace_sqm: 80,   price_net: 460000, price_gross: 547400, block: "A" },
];

export async function POST() {
  if (process.env.ENABLE_DEV_ADMIN_ROUTES !== "true") {
    return NextResponse.json({ error: "Seed routes disabled" }, { status: 403 });
  }
  // Auth: bei ENABLE_DEV_ADMIN_ROUTES=true wird der User-Check übersprungen
  // (Dev-Bypass — nie in Production setzen)
  const userSb = await createClient();
  await userSb.auth.getUser(); // session refresh, kein hard-check

  const admin = createAdminClient();
  const log: string[] = [];

  // 1. Upsert Project (slug eindeutig)
  const projectPayload = {
    name: "Emerald Park",
    slug: "emerald-park",
    location: "Paphos",
    location_district: "Geroskipou",
    developer: null,
    developer_class: "Class A",
    completion_months: 18,
    vat_refundable_shortterm: true,
    poi_distances: EMERALD_POIS,
    payment_schedule: EMERALD_PAYMENTS,
    deck_texts: { de: EMERALD_TEXTS, en: {} },
    calc_defaults: {
      gross_yield_pct: 6.5,
      rent_growth_pct: 3.0,
      value_growth_pct: 4.0,
      cost_pct: 20.0,
      furniture_cost: 17000,
      furniture_included: false,
    },
  };

  const { data: existing } = await admin
    .from("crm_projects")
    .select("id")
    .eq("slug", "emerald-park")
    .maybeSingle();

  let projectId: string;
  if (existing) {
    projectId = existing.id;
    const { error } = await admin
      .from("crm_projects")
      .update(projectPayload)
      .eq("id", projectId);
    if (error) return NextResponse.json({ error: `Update fail: ${error.message}` }, { status: 500 });
    log.push(`✓ Updated project ${projectId}`);
  } else {
    const { data: created, error } = await admin
      .from("crm_projects")
      .insert(projectPayload)
      .select("id")
      .single();
    if (error || !created) return NextResponse.json({ error: `Insert fail: ${error?.message}` }, { status: 500 });
    projectId = created.id;
    log.push(`✓ Created project ${projectId}`);
  }

  // 2. Units neu seeden — erst alle löschen, dann insert
  await admin.from("crm_project_units").delete().eq("project_id", projectId);
  const unitRows = EMERALD_UNITS.map((u, i) => ({ ...u, project_id: projectId, sort_order: i }));
  const { error: unitErr } = await admin.from("crm_project_units").insert(unitRows);
  if (unitErr) return NextResponse.json({ error: `Units fail: ${unitErr.message}` }, { status: 500 });
  log.push(`✓ Inserted ${unitRows.length} units`);

  // 3. Bild-Platzhalter pro Kategorie (nur falls noch keine existieren)
  const { data: existingImgs } = await admin
    .from("project_deck_images")
    .select("category")
    .eq("project_id", projectId);
  const existingCats = new Set((existingImgs ?? []).map((i: { category: string }) => i.category));
  const placeholderRows = IMAGE_CATEGORY_KEYS
    .filter((c) => !existingCats.has(c))
    .map((c, i) => ({
      project_id: projectId,
      storage_path: `placeholder/${c}.jpg`,
      category: c,
      sort_order: i,
    }));
  if (placeholderRows.length > 0) {
    const { error: imgErr } = await admin.from("project_deck_images").insert(placeholderRows);
    if (imgErr) return NextResponse.json({ error: `Images fail: ${imgErr.message}` }, { status: 500 });
    log.push(`✓ Inserted ${placeholderRows.length} placeholder images`);
  } else {
    log.push(`◦ Keep existing images (${existingCats.size})`);
  }

  return NextResponse.json({
    ok: true,
    project_id: projectId,
    slug: "emerald-park",
    log,
    next: `/projects/emerald-park`,
  });
}

export async function GET() {
  return NextResponse.json({
    info: "POST to seed Emerald Park. Requires logged-in user + ENABLE_DEV_ADMIN_ROUTES=true.",
  });
}
