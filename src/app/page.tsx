import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, MapPin, Image as ImageIcon, FileText, Home } from "lucide-react";

type Row = {
  id: string;
  name: string;
  slug: string | null;
  location: string | null;
  location_district: string | null;
  deck_texts: { de?: Record<string, unknown> } | null;
  units_count: { count: number }[] | number | null;
  images_count: { count: number }[] | number | null;
};

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("crm_projects")
    .select(
      `id, name, slug, location, location_district, deck_texts,
       units_count:crm_project_units(count),
       images_count:project_deck_images(count)`,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8">
        <h1 className="font-heading text-3xl mb-4">Projekte</h1>
        <div className="text-red-600 text-sm">DB-Fehler: {error.message}</div>
      </div>
    );
  }

  const rows = (projects ?? []) as unknown as Row[];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="section-label">Übersicht</span>
          <h1 className="font-heading text-4xl mt-1">Projekte</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {rows.length} {rows.length === 1 ? "Projekt" : "Projekte"} insgesamt.
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-coral hover:bg-coral-600 text-white">
            <Plus className="h-4 w-4" />
            Neues Projekt
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Home className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground mb-4">
              Noch keine Projekte. Lege das erste an oder seed Emerald Park über
              <code className="mx-1 px-1 bg-muted rounded text-xs">/api/seed-emerald</code>.
            </p>
            <Link href="/projects/new">
              <Button className="bg-coral hover:bg-coral-600 text-white">
                <Plus className="h-4 w-4" />
                Neues Projekt
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((p) => {
            const unitsCount = Array.isArray(p.units_count)
              ? p.units_count[0]?.count ?? 0
              : 0;
            const imagesCount = Array.isArray(p.images_count)
              ? p.images_count[0]?.count ?? 0
              : 0;
            const hasTexts =
              p.deck_texts?.de && Object.keys(p.deck_texts.de).length > 0;

            return (
              <Link
                key={p.id}
                href={p.slug ? `/projects/${p.slug}` : "#"}
                className="block"
              >
                <Card className="hover:border-coral transition group h-full">
                  <CardContent className="p-5">
                    <span className="coral-rule" />
                    <h2 className="font-heading text-2xl group-hover:text-coral transition">
                      {p.name}
                    </h2>
                    {(p.location || p.location_district) && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {[p.location_district, p.location]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant={hasTexts ? "default" : "outline"} className={hasTexts ? "bg-coral hover:bg-coral text-white" : ""}>
                        <FileText className="h-3 w-3" />
                        Texte {hasTexts ? "✓" : "fehlen"}
                      </Badge>
                      <Badge variant={unitsCount > 0 ? "default" : "outline"} className={unitsCount > 0 ? "bg-coral hover:bg-coral text-white" : ""}>
                        <Home className="h-3 w-3" />
                        {unitsCount} Units
                      </Badge>
                      <Badge variant={imagesCount > 0 ? "default" : "outline"} className={imagesCount > 0 ? "bg-coral hover:bg-coral text-white" : ""}>
                        <ImageIcon className="h-3 w-3" />
                        {imagesCount} Bilder
                      </Badge>
                    </div>
                    {!p.slug && (
                      <p className="text-xs text-red-600 mt-3">
                        ⚠ Kein Slug — Projekt nicht aufrufbar
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
