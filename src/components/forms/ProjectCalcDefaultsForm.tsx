"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateProject } from "@/app/projects/actions";
import { DEFAULT_CALC_DEFAULTS } from "@/lib/constants";
import type { CrmProject } from "@/lib/types";

export function ProjectCalcDefaultsForm({ project }: { project: CrmProject }) {
  const cd = { ...DEFAULT_CALC_DEFAULTS, ...(project.calc_defaults ?? {}) };
  const [grossYield, setGrossYield] = useState(String(cd.gross_yield_pct));
  const [rentGrowth, setRentGrowth] = useState(String(cd.rent_growth_pct));
  const [valueGrowth, setValueGrowth] = useState(String(cd.value_growth_pct));
  const [cost, setCost] = useState(String(cd.cost_pct));
  const [furnitureCost, setFurnitureCost] = useState(String(cd.furniture_cost));
  const [furnitureIncluded, setFurnitureIncluded] = useState(!!cd.furniture_included);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const res = await updateProject(project.id, {
        calc_defaults: {
          gross_yield_pct: Number(grossYield),
          rent_growth_pct: Number(rentGrowth),
          value_growth_pct: Number(valueGrowth),
          cost_pct: Number(cost),
          furniture_cost: Number(furnitureCost),
          furniture_included: furnitureIncluded,
        },
      });
      if (res?.error) toast.error(res.error);
      else toast.success("Gespeichert");
    });
  }

  const Field = ({ id, label, value, set, suffix }: { id: string; label: string; value: string; set: (v: string) => void; suffix?: string }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type="number" step="0.1" value={value} onChange={(e) => set(e.target.value)} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <p className="text-xs text-muted-foreground">
          Defaults für die Investment-Berechnung — wird in Phase 3 ins Deck integriert.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field id="gy" label="Bruttorendite" value={grossYield} set={setGrossYield} suffix="%" />
          <Field id="rg" label="Mietsteigerung p.a." value={rentGrowth} set={setRentGrowth} suffix="%" />
          <Field id="vg" label="Wertsteigerung p.a." value={valueGrowth} set={setValueGrowth} suffix="%" />
          <Field id="c" label="Bewirtschaftungskosten" value={cost} set={setCost} suffix="%" />
          <Field id="fc" label="Möblierungskosten" value={furnitureCost} set={setFurnitureCost} suffix="€" />
          <div className="flex items-center gap-3 pb-2">
            <Switch checked={furnitureIncluded} onCheckedChange={setFurnitureIncluded} id="fi" />
            <Label htmlFor="fi" className="cursor-pointer">Möbel im Preis enthalten</Label>
          </div>
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
