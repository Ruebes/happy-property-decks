import { NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { IMAGE_CATEGORY_KEYS, STORAGE_BUCKETS } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  // Auth: nur eingeloggte User
  const userSb = await createClient();
  const { data: { user } } = await userSb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fd = await req.formData();
  const projectId = fd.get("project_id");
  const category = fd.get("category");
  const file = fd.get("file");

  if (typeof projectId !== "string" || typeof category !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!IMAGE_CATEGORY_KEYS.includes(category as never)) {
    return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });
  }

  // Resize → WebP, max 1920w, q85
  const buf = Buffer.from(await file.arrayBuffer());
  let optimized: Buffer;
  try {
    optimized = await sharp(buf)
      .rotate() // auto-orient
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
  } catch (e) {
    return NextResponse.json({ error: `Image processing failed: ${(e as Error).message}` }, { status: 500 });
  }

  // Upload via Service-Role (umgeht etwaige Bucket-Policies)
  const admin = createAdminClient();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const path = `${projectId}/${category}/${filename}`;

  const { error: upErr } = await admin.storage
    .from(STORAGE_BUCKETS.images)
    .upload(path, optimized, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  // DB-Eintrag (RLS: auth.uid() IS NOT NULL — user-client geht)
  const { error: dbErr } = await userSb.from("project_deck_images").insert({
    project_id: projectId,
    storage_path: path,
    category,
    sort_order: 0,
  });

  if (dbErr) {
    await admin.storage.from(STORAGE_BUCKETS.images).remove([path]);
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, path });
}
