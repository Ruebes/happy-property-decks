"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { updateProject } from "@/app/projects/actions";
import { DEFAULT_DECK_TEXTS_DE } from "@/lib/constants";
import type { CrmProject, DeckTextsDe } from "@/lib/types";

export function ProjectTextsForm({ project }: { project: CrmProject }) {
  const initial: DeckTextsDe = {
    ...DEFAULT_DECK_TEXTS_DE,
    ...(project.deck_texts?.de ?? {}),
  } as DeckTextsDe;

  const [t, setT] = useState<DeckTextsDe>(initial);
  const [pending, start] = useTransition();

  const set = <K extends keyof DeckTextsDe>(k: K, v: DeckTextsDe[K]) =>
    setT((prev) => ({ ...prev, [k]: v }));

  function save() {
    start(async () => {
      const res = await updateProject(project.id, {
        deck_texts: { ...(project.deck_texts ?? {}), de: t },
      });
      if (res?.error) toast.error(res.error);
      else toast.success("Texte gespeichert");
    });
  }

  const TextField = ({ k, label, multi = false, rows = 3 }: { k: keyof DeckTextsDe; label: string; multi?: boolean; rows?: number }) => {
    const val = t[k];
    if (typeof val !== "string") return null;
    return (
      <div className="space-y-2">
        <Label htmlFor={String(k)}>{label}</Label>
        {multi ? (
          <Textarea id={String(k)} rows={rows} value={val} onChange={(e) => set(k, e.target.value as never)} />
        ) : (
          <Input id={String(k)} value={val} onChange={(e) => set(k, e.target.value as never)} />
        )}
      </div>
    );
  };

  const Section = ({ title, page, children }: { title: string; page: number; children: React.ReactNode }) => (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <span className="text-coral font-heading text-xl">{page.toString().padStart(2, "0")}</span>
        <h3 className="font-heading text-lg">{title}</h3>
      </div>
      <div className="pl-10 space-y-3">{children}</div>
      <Separator />
    </div>
  );

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <Section title="Cover" page={1}>
          <TextField k="hero_subtitle" label="Subtitle unter Projektname" multi rows={2} />
        </Section>

        <Section title="Lage" page={2}>
          <TextField k="lage_heading" label="Heading" />
          <TextField k="lage_text" label="Text" multi rows={3} />
        </Section>

        <Section title="Standort" page={3}>
          <TextField k="standort_heading" label="Heading" />
          <p className="text-xs text-muted-foreground">
            POIs werden im Tab „Lage" gepflegt.
          </p>
        </Section>

        <Section title="Projekt" page={4}>
          <TextField k="projekt_heading" label="Heading" />
          <TextField k="projekt_subtitle" label="Subtitle (unter Bild)" />
        </Section>

        <Section title="USP — Community" page={5}>
          <TextField k="usp_heading" label="Heading" />
          <TextField k="usp_subtitle" label="Subtitle" />
          <div className="space-y-2">
            <Label>6 Feature-Boxen (Wert + Label)</Label>
            {t.usp_features?.map((f, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <Input className="col-span-4" value={f.value} placeholder="z.B. Pool" onChange={(e) => {
                  const v = [...t.usp_features]; v[i] = { ...f, value: e.target.value }; set("usp_features", v);
                }} />
                <Input className="col-span-7" value={f.label} placeholder="Lap- & Familienpool" onChange={(e) => {
                  const v = [...t.usp_features]; v[i] = { ...f, label: e.target.value }; set("usp_features", v);
                }} />
                <Button variant="ghost" size="icon" onClick={() => set("usp_features", t.usp_features.filter((_, j) => j !== i))}>
                  <Trash2 className="h-3 w-3 text-red-600" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => set("usp_features", [...(t.usp_features ?? []), { value: "", label: "" }])}>
              <Plus className="h-3 w-3" /> Feature
            </Button>
          </div>
        </Section>

        <Section title="Amenities" page={6}>
          <TextField k="amenities_heading" label="Heading" />
          <TextField k="amenities_subtitle" label="Subtitle" />
          <p className="text-xs text-muted-foreground">Bilder Kategorien: amenity_pool, amenity_cafe, amenity_gym, amenity_lobby</p>
        </Section>

        <Section title="Preisübersicht" page={7}>
          <TextField k="preise_heading" label="Heading" />
          <TextField k="preise_subtitle" label="Subtitle" />
          <TextField k="preise_footer" label="Footer-Heading" />
          <TextField k="preise_footer_text" label="Footer-Text" multi rows={2} />
        </Section>

        <Section title="Extras" page={8}>
          <TextField k="extras_heading" label="Heading" />
          <TextField k="extras_subtitle" label="Subtitle" />
          <div className="space-y-2">
            <Label>Extras-Tabelle</Label>
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground">
              <span className="col-span-3">PAKET</span>
              <span className="col-span-2">Studio</span>
              <span className="col-span-2">1-Schlafz.</span>
              <span className="col-span-2">2-Schlafz.</span>
              <span className="col-span-2">3-Schlafz.</span>
            </div>
            {t.extras_table?.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <Input className="col-span-3" value={r.name} onChange={(e) => { const v = [...t.extras_table]; v[i] = { ...r, name: e.target.value }; set("extras_table", v); }} />
                <Input className="col-span-2" value={r.studio} onChange={(e) => { const v = [...t.extras_table]; v[i] = { ...r, studio: e.target.value }; set("extras_table", v); }} />
                <Input className="col-span-2" value={r.br1} onChange={(e) => { const v = [...t.extras_table]; v[i] = { ...r, br1: e.target.value }; set("extras_table", v); }} />
                <Input className="col-span-2" value={r.br2} onChange={(e) => { const v = [...t.extras_table]; v[i] = { ...r, br2: e.target.value }; set("extras_table", v); }} />
                <div className="col-span-3 flex gap-2">
                  <Input value={r.br3} onChange={(e) => { const v = [...t.extras_table]; v[i] = { ...r, br3: e.target.value }; set("extras_table", v); }} />
                  <Button variant="ghost" size="icon" onClick={() => set("extras_table", t.extras_table.filter((_, j) => j !== i))}>
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => set("extras_table", [...(t.extras_table ?? []), { name: "", studio: "", br1: "", br2: "", br3: "" }])}>
              <Plus className="h-3 w-3" /> Zeile
            </Button>
          </div>
          <TextField k="extras_included_title" label="Im-Kaufpreis-Heading" />
          <TextField k="extras_included_text" label="Im-Kaufpreis-Text" multi rows={3} />
        </Section>

        <Section title="Interieur 1" page={9}>
          <TextField k="interior_heading_1" label="Heading" />
          <TextField k="interior_subtitle_1" label="Subtitle" />
        </Section>

        <Section title="Interieur 2" page={10}>
          <TextField k="interior_heading_2" label="Heading" />
          <TextField k="interior_subtitle_2" label="Subtitle" />
        </Section>

        <Section title="Highlight" page={11}>
          <TextField k="highlight_heading" label="Heading" />
          <TextField k="highlight_subtitle" label="Subtitle" />
          <div className="grid grid-cols-2 gap-3">
            <TextField k="highlight_value" label='Großer Wert (z.B. "111 m²")' />
            <TextField k="highlight_value_label" label="Wert-Label" />
          </div>
        </Section>

        <Section title="Zahlungsplan" page={12}>
          <TextField k="zahlungsplan_heading" label="Heading" />
          <TextField k="zahlungsplan_subtitle" label="Subtitle" />
          <TextField k="zahlungsplan_footer" label="Footer-Text" multi rows={2} />
          <p className="text-xs text-muted-foreground">Schritte werden im Tab „Zahlungsplan" gepflegt.</p>
        </Section>

        <Section title="CTA" page={13}>
          <TextField k="cta_heading" label="Heading" />
          <TextField k="cta_subtitle" label="Subtitle" />
          <div className="space-y-2">
            <Label>3 CTA-Steps</Label>
            {t.cta_steps?.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <Input className="col-span-1" value={s.number} placeholder="01" onChange={(e) => { const v = [...t.cta_steps]; v[i] = { ...s, number: e.target.value }; set("cta_steps", v); }} />
                <Input className="col-span-3" value={s.title} placeholder="Reservieren" onChange={(e) => { const v = [...t.cta_steps]; v[i] = { ...s, title: e.target.value }; set("cta_steps", v); }} />
                <Input className="col-span-7" value={s.text} placeholder="Wunsch-Einheit mit 10.000 € sichern" onChange={(e) => { const v = [...t.cta_steps]; v[i] = { ...s, text: e.target.value }; set("cta_steps", v); }} />
                <Button variant="ghost" size="icon" onClick={() => set("cta_steps", t.cta_steps.filter((_, j) => j !== i))}>
                  <Trash2 className="h-3 w-3 text-red-600" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => set("cta_steps", [...(t.cta_steps ?? []), { number: "", title: "", text: "" }])}>
              <Plus className="h-3 w-3" /> Step
            </Button>
          </div>
          <TextField k="cta_disclaimer" label="Disclaimer (Fußzeile)" multi rows={2} />
        </Section>

        <div className="sticky bottom-4 bg-cream/95 backdrop-blur p-4 -mx-6 -mb-6 px-6 pb-6 border-t">
          <Button onClick={save} disabled={pending} size="lg" className="w-full bg-coral hover:bg-coral-600 text-white">
            {pending ? "Speichere..." : "Alle Texte speichern"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
