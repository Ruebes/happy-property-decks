import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { UnitsTable } from "@/components/UnitsTable";
import type { CrmProjectUnit } from "@/lib/types";

export default async function UnitsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("crm_projects")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();
  if (!project) notFound();

  const { data: units } = await supabase
    .from("crm_project_units")
    .select("*")
    .eq("project_id", project.id)
    .order("block", { ascending: true, nullsFirst: false })
    .order("unit_number", { ascending: true });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href={`/projects/${slug}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-coral mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
      </Link>
      <span className="section-label">Wohnungen</span>
      <h1 className="font-heading text-4xl mt-1 mb-2">{project.name}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Inline-Edit · Änderungen werden direkt gespeichert · {units?.length ?? 0} Units
      </p>
      <UnitsTable projectId={project.id} initialUnits={(units ?? []) as CrmProjectUnit[]} />
    </div>
  );
}
