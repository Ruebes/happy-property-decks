"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { slugify } from "@/lib/slugify";
import { createProject } from "@/app/projects/actions";
import { ArrowLeft } from "lucide-react";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [location, setLocation] = useState("");
  const [district, setDistrict] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error("Name und Slug sind Pflicht");
      return;
    }
    start(async () => {
      const res = await createProject({
        name: name.trim(),
        slug: slug.trim(),
        location: location.trim() || undefined,
        location_district: district.trim() || undefined,
      });
      if (res?.error) toast.error(res.error);
    });
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-coral mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Zurück zur Übersicht
      </Link>
      <span className="section-label">Neues Projekt</span>
      <h1 className="font-heading text-3xl mt-1 mb-6">Anlegen</h1>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Projektname *</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Emerald Park"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL-Slug *</Label>
              <Input
                id="slug"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugTouched(true);
                }}
                placeholder="emerald-park"
              />
              <p className="text-xs text-muted-foreground">
                /projects/<span className="font-mono">{slug || "…"}</span>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Stadt</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="z.B. Paphos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District / Ortsteil</Label>
              <Input
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="z.B. Geroskipou"
              />
            </div>
            <Button
              type="submit"
              disabled={pending}
              className="w-full bg-coral hover:bg-coral-600 text-white"
            >
              {pending ? "Anlegen..." : "Projekt anlegen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
