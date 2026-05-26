import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { IMAGE_CATEGORIES, IMAGE_CATEGORY_KEYS, STORAGE_BUCKETS, type ImageCategory } from "@/lib/constants";
import type { ProjectDeckImage } from "@/lib/types";

export default async function ImagesPage({
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

  const { data: images } = await supabase
    .from("project_deck_images")
    .select("*")
    .eq("project_id", project.id)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  const byCat: Record<string, ProjectDeckImage[]> = {};
  for (const img of (images ?? []) as ProjectDeckImage[]) {
    if (!byCat[img.category]) byCat[img.category] = [];
    byCat[img.category].push(img);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publicUrlFor = (path: string) =>
    path.startsWith("placeholder/")
      ? null
      : `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKETS.images}/${path}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href={`/projects/${slug}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-coral mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
      </Link>
      <span className="section-label">Bilder</span>
      <h1 className="font-heading text-4xl mt-1 mb-6">{project.name}</h1>

      <ImageUploader projectId={project.id} />

      <div className="mt-10 space-y-8">
        {IMAGE_CATEGORY_KEYS.map((cat) => {
          const imgs = byCat[cat] ?? [];
          return (
            <section key={cat}>
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <span className="coral-rule" />
                  <h2 className="font-heading text-xl">{IMAGE_CATEGORIES[cat as ImageCategory]}</h2>
                  <p className="text-xs text-muted-foreground">Kategorie: <code>{cat}</code> · {imgs.length} Bild{imgs.length === 1 ? "" : "er"}</p>
                </div>
              </div>
              {imgs.length === 0 ? (
                <div className="border border-dashed rounded-md p-6 text-center text-xs text-muted-foreground">
                  Noch kein Bild für diese Kategorie.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imgs.map((img) => {
                    const url = publicUrlFor(img.storage_path);
                    return (
                      <div key={img.id} className="group relative aspect-[4/3] rounded-md overflow-hidden border bg-muted">
                        {url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt={img.caption_de ?? ""} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs text-muted-foreground italic">
                            Platzhalter
                          </div>
                        )}
                        {img.caption_de && (
                          <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] uppercase tracking-wider p-1 truncate">
                            {img.caption_de}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
