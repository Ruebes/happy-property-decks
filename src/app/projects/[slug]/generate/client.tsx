"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, ExternalLink, FileDown, Loader2 } from "lucide-react";
import { IMAGE_CATEGORIES, type ImageCategory } from "@/lib/constants";

export function GenerateClient({
  projectId,
  checks,
}: {
  projectId: string;
  checks: {
    texts: boolean;
    payments: boolean;
    pois: boolean;
    units: boolean;
    imagesMissing: string[];
    imagesTotal: number;
  };
}) {
  const [pending, start] = useTransition();
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [bytes, setBytes] = useState<number | null>(null);

  function generate() {
    setResultUrl(null);
    setBytes(null);
    start(async () => {
      try {
        const r = await fetch("/api/render-deck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project_id: projectId }),
        });
        const json = await r.json();
        if (!r.ok) {
          toast.error("Render fehlgeschlagen", { description: json.error });
          return;
        }
        setResultUrl(json.url);
        setBytes(json.bytes);
        toast.success("PDF generiert");
      } catch (e) {
        toast.error("Render-Fehler", { description: (e as Error).message });
      }
    });
  }

  const Row = ({ ok, label, hint }: { ok: boolean; label: string; hint?: string }) => (
    <li className="flex items-start gap-3 py-2 border-b last:border-0">
      <span className={`flex-shrink-0 mt-0.5 ${ok ? "text-emerald-600" : "text-amber-600"}`}>
        {ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </span>
      <div>
        <div className={ok ? "" : "text-amber-700"}>{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
    </li>
  );

  const imagesOk = checks.imagesMissing.length === 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5">
          <h2 className="font-heading text-xl mb-2">Datencheck</h2>
          <ul className="text-sm">
            <Row ok={checks.texts} label="Deck-Texte (DE) gepflegt" hint="Editor → Tab Texte DE" />
            <Row ok={checks.payments} label="Zahlungsplan-Schritte vorhanden" hint="Editor → Tab Zahlungsplan" />
            <Row ok={checks.pois} label="POIs für Standort-Seite gepflegt" hint="Editor → Tab Lage" />
            <Row ok={checks.units} label="Mindestens eine Wohnung vorhanden" hint="Tab Wohnungen" />
            <Row
              ok={imagesOk}
              label={
                imagesOk
                  ? `Alle ${checks.imagesTotal} Bild-Kategorien gefüllt`
                  : `${checks.imagesTotal - checks.imagesMissing.length} / ${checks.imagesTotal} Bild-Kategorien gefüllt`
              }
              hint={
                imagesOk
                  ? undefined
                  : `Fehlt: ${checks.imagesMissing.slice(0, 4).map((c) => IMAGE_CATEGORIES[c as ImageCategory]).join(" · ")}${checks.imagesMissing.length > 4 ? " · …" : ""} (Deck wird mit Platzhaltern gerendert)`
              }
            />
          </ul>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          onClick={generate}
          disabled={pending}
          size="lg"
          className="bg-coral hover:bg-coral-600 text-white"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          {pending ? "Generiere PDF…" : "Deck jetzt generieren"}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          Auch ohne alle Daten möglich — fehlende Bilder werden als Platzhalter dargestellt.
        </p>
      </div>

      {resultUrl && (
        <Card className="border-coral">
          <CardContent className="p-5">
            <h3 className="font-heading text-lg mb-2 text-coral">PDF bereit</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {bytes ? `${Math.round(bytes / 1024)} KB · ` : ""}
              Signed URL ist 30 Tage gültig.
            </p>
            <div className="flex gap-3">
              <a href={resultUrl} target="_blank" rel="noreferrer">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4" /> In neuem Tab öffnen
                </Button>
              </a>
              <a href={resultUrl} download>
                <Button className="bg-coral hover:bg-coral-600 text-white">
                  <FileDown className="h-4 w-4" /> Download
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-coral">Debug: HTML statt PDF rendern</summary>
        <div className="mt-3">
          <a
            href={`/api/render-deck`}
            onClick={(e) => {
              e.preventDefault();
              fetch("/api/render-deck", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ project_id: projectId, debug_html: true }),
              })
                .then((r) => r.text())
                .then((html) => {
                  const blob = new Blob([html], { type: "text/html" });
                  const url = URL.createObjectURL(blob);
                  window.open(url, "_blank");
                });
            }}
            className="underline"
          >
            HTML in neuem Tab öffnen
          </a>
          <span className="ml-2">— zum schnellen Layout-Check ohne PDF-Roundtrip.</span>
        </div>
      </details>
    </div>
  );
}
