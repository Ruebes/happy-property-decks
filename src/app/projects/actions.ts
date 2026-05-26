"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import { RESERVED_SLUGS, DEFAULT_DECK_TEXTS_DE, DEFAULT_PAYMENT_SCHEDULE, DEFAULT_CALC_DEFAULTS } from "@/lib/constants";
import type { CrmProjectUnit } from "@/lib/types";

export async function createProject(input: {
  name: string;
  slug?: string;
  location?: string;
  location_district?: string;
}) {
  const supabase = await createClient();
  const slug = slugify(input.slug || input.name);
  if (!slug || RESERVED_SLUGS.includes(slug)) {
    return { error: `Slug "${slug}" ist nicht zulässig.` };
  }

  // Doppel-Check
  const { data: existing } = await supabase
    .from("crm_projects")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return { error: `Slug "${slug}" ist bereits vergeben.` };

  const { data, error } = await supabase
    .from("crm_projects")
    .insert({
      name: input.name,
      slug,
      location: input.location || null,
      location_district: input.location_district || null,
      deck_texts: { de: DEFAULT_DECK_TEXTS_DE, en: {} },
      payment_schedule: DEFAULT_PAYMENT_SCHEDULE,
      calc_defaults: DEFAULT_CALC_DEFAULTS,
      poi_distances: [],
      vat_refundable_shortterm: true,
    })
    .select("slug")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/");
  redirect(`/projects/${data.slug}`);
}

export async function updateProject(
  id: string,
  patch: Record<string, unknown>,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("crm_projects")
    .update(patch)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("crm_projects").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  redirect("/");
}

// ─── Units ─────────────────────────────────────────────────────
export async function upsertUnit(projectId: string, unit: Partial<CrmProjectUnit> & { id?: string }) {
  const supabase = await createClient();
  if (unit.id) {
    const { id, ...rest } = unit;
    const { error } = await supabase
      .from("crm_project_units")
      .update(rest)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("crm_project_units")
      .insert({ ...unit, project_id: projectId });
    if (error) return { error: error.message };
  }
  revalidatePath(`/projects/[slug]`, "page");
  return { ok: true };
}

export async function deleteUnit(unitId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("crm_project_units")
    .delete()
    .eq("id", unitId);
  if (error) return { error: error.message };
  return { ok: true };
}

// ─── Images ────────────────────────────────────────────────────
export async function deleteImage(imageId: string, storagePath: string) {
  const supabase = await createClient();
  // Erst aus Storage löschen (best-effort, kein hard failure)
  await supabase.storage.from("deck-project-images").remove([storagePath]);
  const { error } = await supabase.from("project_deck_images").delete().eq("id", imageId);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function updateImageCaption(imageId: string, caption_de: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_deck_images")
    .update({ caption_de })
    .eq("id", imageId);
  if (error) return { error: error.message };
  return { ok: true };
}
