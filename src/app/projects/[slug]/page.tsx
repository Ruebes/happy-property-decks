import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Home, Image as ImageIcon, FileDown, ArrowLeft, MapPin } from "lucide-react";
import { IMAGE_CATEGORY_KEYS } from "@/lib/constants";

export default async function ProjectOverview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("crm_projects")
    .select("id, name, slug, location, location_district, deck_texts, payment_schedule, poi_distances")
    .eq("slug", slug)
    .maybeSingle();

  if (!project) notFound();

  const [{ count: unitsCount }, { data: images }] = await Promise.all([
    supabase.from("crm_project_units").select("id", { count: "exact", head: true }).eq("project_id", project.id),
    supabase.from("project_deck_images").select("id, category").eq("project_id", project.id),
  ]);

  const imagesByCat = new Set((images ?? []).map((i) => i.category));
  const imagesTotal = images?.length ?? 0;
  const categoriesCovered = IMAGE_CATEGORY_KEYS.filter((k) => imagesByCat.has(k)).length;
  const hasTexts = project.deck_texts?.de && Object.keys(project.deck_texts.de).length > 0;
  const hasPayments = Array.isArray(project.payment_schedule) && project.payment_schedule.length > 0;
  const hasPois = Array.isArray(project.poi_distances) && project.poi_distances.length > 0;

  const Section = ({
    href, icon: Icon, title, status, count,
  }: {
    href: string;
    icon: typeof Pencil;
    title: string;
    status: "ok" | "partial" | "missing";
    count?: string;
  }) => (
    <Link href={href}>
      <Card className="hover:border-coral transition h-full group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <Icon className="h-5 w-5 text-coral mb-3" />
              <h3 className="font-heading text-xl group-hover:text-coral transition">{title}</h3>
              {count && <p className="text-xs text-muted-foreground mt-1">{count}</p>}
            </div>
            <Badge variant={status === "ok" ? "default" : "outline"} className={status === "ok" ? "bg-coral text-white" : status === "partial" ? "border-amber-400 text-amber-700" : ""}>
              {status === "ok" ? "✓" : status === "partial" ? "Teil" : "Offen"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-coral mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
      </Link>

      <div className="mb-10">
        <span className="coral-rule" />
        <h1 className="font-heading text-4xl">{project.name}</h1>
        {(project.location || project.location_district) && (
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {[project.location_district, project.location].filter(Boolean).join(", ")}
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Section
          href={`/projects/${slug}/edit`}
          icon={Pencil}
          title="Stammdaten & Texte"
          status={hasTexts && hasPayments && hasPois ? "ok" : hasTexts || hasPayments || hasPois ? "partial" : "missing"}
          count={`${hasPois ? (project.poi_distances?.length ?? 0) : 0} POIs · ${hasPayments ? (project.payment_schedule?.length ?? 0) : 0} Zahlungsschritte`}
        />
        <Section
          href={`/projects/${slug}/units`}
          icon={Home}
          title="Wohnungen"
          status={unitsCount && unitsCount > 0 ? "ok" : "missing"}
          count={`${unitsCount ?? 0} Units gepflegt`}
        />
        <Section
          href={`/projects/${slug}/images`}
          icon={ImageIcon}
          title="Bilder"
          status={categoriesCovered === IMAGE_CATEGORY_KEYS.length ? "ok" : categoriesCovered > 0 ? "partial" : "missing"}
          count={`${imagesTotal} Bilder · ${categoriesCovered} / ${IMAGE_CATEGORY_KEYS.length} Kategorien`}
        />
        <Section
          href={`/projects/${slug}/generate`}
          icon={FileDown}
          title="Deck generieren"
          status={hasTexts && unitsCount && unitsCount > 0 ? "ok" : "missing"}
          count="PDF-Export"
        />
      </div>

      <div className="text-center">
        <Link href={`/projects/${slug}/generate`}>
          <Button size="lg" className="bg-coral hover:bg-coral-600 text-white">
            <FileDown className="h-4 w-4" /> Deck jetzt generieren
          </Button>
        </Link>
      </div>
    </div>
  );
}
