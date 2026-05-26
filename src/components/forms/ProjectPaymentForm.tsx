"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { updateProject } from "@/app/projects/actions";
import type { CrmProject, PaymentStep } from "@/lib/types";

export function ProjectPaymentForm({ project }: { project: CrmProject }) {
  const [steps, setSteps] = useState<PaymentStep[]>(project.payment_schedule ?? []);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const res = await updateProject(project.id, {
        payment_schedule: steps.filter((s) => s.label?.trim() || s.percent?.trim()),
      });
      if (res?.error) toast.error(res.error);
      else toast.success("Gespeichert");
    });
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Label>Zahlungsplan-Schritte</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Maximal 6 Schritte fürs Deck-Layout empfehlenswert.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setSteps([...steps, { percent: "", label: "", trigger: "" }])
            }
          >
            <Plus className="h-3 w-3" /> Schritt
          </Button>
        </div>
        {steps.map((s, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-1 text-center text-coral font-heading text-xl">{i + 1}</div>
            <Input
              className="col-span-3"
              placeholder="z.B. 30% oder 10.000 €"
              value={s.percent}
              onChange={(e) => {
                const v = [...steps];
                v[i] = { ...s, percent: e.target.value };
                setSteps(v);
              }}
            />
            <Input
              className="col-span-3"
              placeholder="ROHBAU"
              value={s.label}
              onChange={(e) => {
                const v = [...steps];
                v[i] = { ...s, label: e.target.value };
                setSteps(v);
              }}
            />
            <Input
              className="col-span-4"
              placeholder="Fundament & Rohbau"
              value={s.trigger}
              onChange={(e) => {
                const v = [...steps];
                v[i] = { ...s, trigger: e.target.value };
                setSteps(v);
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setSteps(steps.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-3 w-3 text-red-600" />
            </Button>
          </div>
        ))}
        <div className="pt-2">
          <Button onClick={save} disabled={pending} className="bg-coral hover:bg-coral-600 text-white">
            {pending ? "Speichere..." : "Speichern"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
