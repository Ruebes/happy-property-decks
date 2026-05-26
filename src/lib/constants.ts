// ═══════════════════════════════════════════════════════════════
// Branding + Application-wide Constants
// ═══════════════════════════════════════════════════════════════

export const BRAND = {
  coral: "#ff795d",
  dark: "#0a0a0a",
  cream: "#fffcf6",
  fontHeading: "Playfair Display",
  fontBody: "Montserrat",
} as const;

export const IMAGE_CATEGORIES = {
  hero: "Cover-Bild (Seite 1)",
  lage_aerial: "Luftbild Lage (Seite 2)",
  lage_map: "Map-Screenshot (Seite 3)",
  projekt_overview: "Anlagen-Übersicht (Seite 4)",
  usp_hero: "Community-Gebäude (Seite 5)",
  amenity_pool: "Pool (Seite 6, Slot 1)",
  amenity_cafe: "Café (Seite 6, Slot 2)",
  amenity_gym: "Gym (Seite 6, Slot 3)",
  amenity_lobby: "Lobby (Seite 6, Slot 4)",
  interior_living: "Wohnbereich (Seite 9, Slot 1)",
  interior_kitchen: "Küche (Seite 9, Slot 2)",
  interior_bedroom: "Schlafzimmer (Seite 10, Slot 1)",
  interior_bathroom: "Badezimmer (Seite 10, Slot 2)",
  highlight: "Highlight-Bild (Seite 11)",
  cta_background: "CTA-Hintergrund (Seite 13)",
} as const;

export type ImageCategory = keyof typeof IMAGE_CATEGORIES;
export const IMAGE_CATEGORY_KEYS = Object.keys(IMAGE_CATEGORIES) as ImageCategory[];

export const STORAGE_BUCKETS = {
  images: "deck-project-images",
  pdfs: "deck-pdfs",
} as const;

export const RESERVED_SLUGS = ["new", "api", "auth", "login", "logout"];

// Default Deck-Texte (DE) — werden beim Anlegen eines Projekts als Vorlage gefüllt
export const DEFAULT_DECK_TEXTS_DE = {
  hero_subtitle:
    "Exklusive Investmentprojekte für deutsche Kapitalanleger in Zypern.",
  lage_heading: "Erstklassige Lage.",
  lage_text:
    "Eingebettet zwischen Stadt, Strand und Bergen — eine Location, die langfristig Wert schafft.",
  standort_heading: "Alles in unter 15 Minuten.",
  projekt_heading: "Modern. Effizient. Wertstabil.",
  projekt_subtitle:
    "Energieeffizienz · A+ Class · Hochwertige Ausstattung · Smart-Home-ready",
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
  preise_subtitle: "Brutto inkl. 19 % MwSt. · Bei Kurzzeitvermietung rückerstattungsfähig.",
  preise_footer: "VAT bei Kurzzeitvermietung",
  preise_footer_text:
    "Werden die Einheiten als kurzzeitvermietete Ferienwohnungen genutzt, ist die MwSt. in der Regel rückerstattungsfähig.",
  extras_heading: "Optionale Pakete.",
  extras_subtitle: "Individuell konfigurierbar · Alle Preise netto zzgl. 19% MwSt.",
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
  highlight_heading: "Das Highlight.",
  highlight_subtitle: "Außenflächen · Pergola · Photovoltaik · Panorama-Aussicht",
  highlight_value: "—",
  highlight_value_label: "Private Dachterrasse",
  zahlungsplan_heading: "Kapital bleibt flexibel.",
  zahlungsplan_subtitle: "Zahlung nach Baufortschritt — nicht vorab.",
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

// Standard-Zahlungsplan (kann pro Projekt überschrieben werden)
export const DEFAULT_PAYMENT_SCHEDULE = [
  { percent: "10.000 €", label: "RESERVIERUNG", trigger: "+30% bei Vertrag" },
  { percent: "30%", label: "ROHBAU", trigger: "Fundament & Rohbau" },
  { percent: "20%", label: "VERPUTZ", trigger: "Mauerwerk & Verputz" },
  { percent: "10%", label: "FLIESEN", trigger: "nach Fliesen" },
  { percent: "5%", label: "FENSTER", trigger: "Aluminiumfenster" },
  { percent: "5%", label: "ÜBERGABE", trigger: "Schlüsselübergabe" },
];

export const DEFAULT_CALC_DEFAULTS = {
  gross_yield_pct: 6.5,
  rent_growth_pct: 3.0,
  value_growth_pct: 4.0,
  cost_pct: 20.0,
  furniture_cost: 17000,
  furniture_included: false,
};
