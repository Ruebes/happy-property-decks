import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Mustache from "mustache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildDeckData } from "@/lib/deck-data";
import { getBrowser } from "@/lib/puppeteer";
import { STORAGE_BUCKETS } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const userSb = await createClient();
  const { data: { user } } = await userSb.auth.getUser();
  const devBypass = process.env.ENABLE_DEV_ADMIN_ROUTES === "true";
  if (!user && !devBypass) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { project_id?: string; debug_html?: boolean };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const projectId = payload.project_id;
  if (!projectId) {
    return NextResponse.json({ error: "project_id required" }, { status: 400 });
  }

  // 1. Data
  let data;
  try {
    data = await buildDeckData(projectId);
  } catch (e) {
    return NextResponse.json({ error: `Data build failed: ${(e as Error).message}` }, { status: 500 });
  }

  // 2. Template + Styles
  const tplDir = path.join(process.cwd(), "src/templates/sales-deck");
  const [tpl, styles] = await Promise.all([
    readFile(path.join(tplDir, "index.html"), "utf-8"),
    readFile(path.join(tplDir, "styles.css"), "utf-8"),
  ]);
  const html = Mustache.render(tpl, { ...data, styles });

  if (payload.debug_html) {
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // 3. PDF via Puppeteer
  const browser = await getBrowser();
  let pdfBuf: Buffer;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: ["networkidle0", "domcontentloaded"], timeout: 25000 });
    await page.emulateMediaType("print");
    pdfBuf = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } catch (e) {
    await browser.close().catch(() => {});
    return NextResponse.json({ error: `Render failed: ${(e as Error).message}` }, { status: 500 });
  }
  await browser.close().catch(() => {});

  // 4. Upload + DB-Log via Admin (private bucket, signed URL für Download)
  const admin = createAdminClient();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const pdfPath = `${projectId}/${stamp}-${data.project.slug ?? "deck"}.pdf`;

  const { error: upErr } = await admin.storage
    .from(STORAGE_BUCKETS.pdfs)
    .upload(pdfPath, pdfBuf, {
      contentType: "application/pdf",
      upsert: false,
    });
  if (upErr) {
    return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 });
  }

  await userSb.from("decks").insert({
    project_id: projectId,
    language: "de",
    pdf_storage_path: pdfPath,
  });

  // 30 Tage signed URL
  const { data: signed, error: signErr } = await admin.storage
    .from(STORAGE_BUCKETS.pdfs)
    .createSignedUrl(pdfPath, 60 * 60 * 24 * 30);
  if (signErr || !signed) {
    return NextResponse.json({ error: `Signed URL failed: ${signErr?.message}` }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    url: signed.signedUrl,
    storage_path: pdfPath,
    bytes: pdfBuf.length,
  });
}
