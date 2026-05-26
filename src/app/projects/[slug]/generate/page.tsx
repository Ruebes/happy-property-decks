import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { GenerateClient } from "./client";
import { IMAGE_CATEGORY_KEYS } from "@/lib/constants";

export default async function GeneratePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("crm_projects")
    .select("id, name, slug, deck_texts, payment_schedule, poi_distances")
    .eq("slug", slug)
    .maybeSingle();
  if (!project) notFound();

  const [{ count: unitsCount }, { data: images }] = await Promise.all([
    supabase.from("crm_project_units").select("id", { count: "exact", head: true }).eq("project_id", project.id),
    supabase.from("project_deck_images").select("category").eq("project_id", project.id),
  ]);

  const haveCats = new Set((images ?? []).map((i: { category: string }) => i.category));
  const missingCats = IMAGE_CATEGORY_KEYS.filter((c) => !haveCats.has(c));
  const hasTexts = project.deck_texts?.de && Object.keys(project.deck_texts.de).length > 0;
  const hasPayments = Array.isArray(project.payment_schedule) && project.payment_schedule.length > 0;
  const hasPois = Array.isArray(project.poi_distances) && project.poi_distances.length > 0;
  const hasUnits = (unitsCount ?? 0) > 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/projects/${slug}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-coral mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
      </Link>
      <span className="section-label">Generieren</span>
      <h1 className="font-heading text-4xl mt-1 mb-2">{project.name}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Datencheck und PDF-Export. Generierung dauert 10–25 Sekunden.
      </p>

      <GenerateClient
        projectId={project.id}
        checks={{
          texts: !!hasTexts,
          payments: hasPayments,
          pois: hasPois,
          units: hasUnits,
          imagesMissing: missingCats,
          imagesTotal: IMAGE_CATEGORY_KEYS.length,
        }}
      />
    </div>
  );
}
