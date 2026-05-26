import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { ProjectStammdatenForm } from "@/components/forms/ProjectStammdatenForm";
import { ProjectLageForm } from "@/components/forms/ProjectLageForm";
import { ProjectPaymentForm } from "@/components/forms/ProjectPaymentForm";
import { ProjectTextsForm } from "@/components/forms/ProjectTextsForm";
import { ProjectCalcDefaultsForm } from "@/components/forms/ProjectCalcDefaultsForm";
import type { CrmProject } from "@/lib/types";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("crm_projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!project) notFound();

  const p = project as CrmProject;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href={`/projects/${slug}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-coral mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
      </Link>
      <span className="section-label">Editor</span>
      <h1 className="font-heading text-4xl mt-1 mb-8">{p.name}</h1>

      <Tabs defaultValue="stammdaten" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="stammdaten">Stammdaten</TabsTrigger>
          <TabsTrigger value="lage">Lage</TabsTrigger>
          <TabsTrigger value="zahlung">Zahlungsplan</TabsTrigger>
          <TabsTrigger value="texte">Texte DE</TabsTrigger>
          <TabsTrigger value="calc">Calc Defaults</TabsTrigger>
        </TabsList>

        <TabsContent value="stammdaten">
          <ProjectStammdatenForm project={p} />
        </TabsContent>
        <TabsContent value="lage">
          <ProjectLageForm project={p} />
        </TabsContent>
        <TabsContent value="zahlung">
          <ProjectPaymentForm project={p} />
        </TabsContent>
        <TabsContent value="texte">
          <ProjectTextsForm project={p} />
        </TabsContent>
        <TabsContent value="calc">
          <ProjectCalcDefaultsForm project={p} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
