"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { updateProject } from "@/app/projects/actions";
import type { CrmProject, Poi } from "@/lib/types";

export function ProjectLageForm({ project }: { project: CrmProject }) {
  const [mapsUrl, setMapsUrl] = useState(project.google_maps_url ?? "");
  const [mapsScreenshot, setMapsScreenshot] = useState(project.google_maps_screenshot_url ?? "");
  const [pois, setPois] = useState<Poi[]>(project.poi_distances ?? []);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const cleaned = pois
        .filter((p) => p.name?.trim())
        .map((p) => ({ minutes: Number(p.minutes) || 0, name: p.name.trim() }));
      const res = await updateProject(project.id, {
        google_maps_url: mapsUrl || null,
        google_maps_screenshot_url: mapsScreenshot || null,
        poi_distances: cleaned,
      });
      if (res?.error) toast.error(res.error);
      else toast.success("Gespeichert");
    });
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="mapsurl">Google Maps URL (Standort öffnen)</Label>
          <Input id="mapsurl" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.app.goo.gl/..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mapsscreenshot">Maps-Screenshot URL (für Deck Seite 3)</Label>
          <Input id="mapsscreenshot" value={mapsScreenshot} onChange={(e) => setMapsScreenshot(e.target.value)} placeholder="https://..." />
          <p className="text-xs text-muted-foreground">
            Alternativ: Bild der Kategorie <code className="px-1 bg-muted rounded">lage_map</code> hochladen — das hat Vorrang.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>POI-Distanzen</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPois([...pois, { minutes: 5, name: "" }])}
            >
              <Plus className="h-3 w-3" /> POI
            </Button>
          </div>
          {pois.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Noch keine POIs.</p>
          )}
          {pois.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                type="number"
                className="w-20"
                value={p.minutes}
                onChange={(e) => {
                  const v = [...pois];
                  v[i] = { ...p, minutes: Number(e.target.value) || 0 };
                  setPois(v);
                }}
              />
              <span className="text-xs text-muted-foreground">Min.</span>
              <Input
                value={p.name}
                onChange={(e) => {
                  const v = [...pois];
                  v[i] = { ...p, name: e.target.value };
                  setPois(v);
                }}
                placeholder="Strand / Flughafen / ..."
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setPois(pois.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-3 w-3 text-red-600" />
              </Button>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Button onClick={save} disabled={pending} className="bg-coral hover:bg-coral-600 text-white">
            {pending ? "Speichere..." : "Speichern"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
