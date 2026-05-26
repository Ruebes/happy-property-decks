"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateProject } from "@/app/projects/actions";
import type { CrmProject } from "@/lib/types";

export function ProjectStammdatenForm({ project }: { project: CrmProject }) {
  const [name, setName] = useState(project.name);
  const [slug, setSlug] = useState(project.slug ?? "");
  const [location, setLocation] = useState(project.location ?? "");
  const [district, setDistrict] = useState(project.location_district ?? "");
  const [developer, setDeveloper] = useState(project.developer ?? "");
  const [developerClass, setDeveloperClass] = useState(project.developer_class ?? "");
  const [completionMonths, setCompletionMonths] = useState<string>(
    project.completion_months?.toString() ?? "",
  );
  const [vatRefundable, setVatRefundable] = useState(
    project.vat_refundable_shortterm ?? true,
  );
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const res = await updateProject(project.id, {
        name,
        slug: slug || null,
        location: location || null,
        location_district: district || null,
        developer: developer || null,
        developer_class: developerClass || null,
        completion_months: completionMonths ? Number(completionMonths) : null,
        vat_refundable_shortterm: vatRefundable,
      });
      if (res?.error) toast.error(res.error);
      else toast.success("Gespeichert");
    });
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Projektname *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL-Slug *</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Stadt</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Paphos" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Geroskipou" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="developer">Developer / Bauträger</Label>
            <Input id="developer" value={developer} onChange={(e) => setDeveloper(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dev_class">Klasse</Label>
            <Input id="dev_class" value={developerClass} onChange={(e) => setDeveloperClass(e.target.value)} placeholder="Class A" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="cm">Bauzeit (Monate)</Label>
            <Input id="cm" type="number" value={completionMonths} onChange={(e) => setCompletionMonths(e.target.value)} placeholder="18" />
          </div>
          <div className="flex items-center gap-3 pb-2">
            <Switch checked={vatRefundable} onCheckedChange={setVatRefundable} id="vat" />
            <Label htmlFor="vat" className="cursor-pointer">
              VAT bei Kurzzeitvermietung rückerstattungsfähig
            </Label>
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
