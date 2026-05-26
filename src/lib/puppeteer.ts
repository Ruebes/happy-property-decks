// Puppeteer-Launcher mit Serverless-Fallback (@sparticuz/chromium auf Vercel/Lambda)
import "server-only";

type AnyBrowser = {
  newPage: () => Promise<AnyPage>;
  close: () => Promise<void>;
};
type AnyPage = {
  setViewport: (v: { width: number; height: number; deviceScaleFactor?: number }) => Promise<void>;
  setContent: (html: string, opts?: { waitUntil?: string | string[]; timeout?: number }) => Promise<void>;
  emulateMediaType: (m: string) => Promise<void>;
  pdf: (opts: Record<string, unknown>) => Promise<Buffer>;
  evaluateHandle?: (fn: string) => Promise<unknown>;
};

export async function getBrowser(): Promise<AnyBrowser> {
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    const chromiumMod: { default?: { args: string[]; executablePath: () => Promise<string> }; args?: string[]; executablePath?: () => Promise<string> } = await import("@sparticuz/chromium");
    const chromium = chromiumMod.default ?? (chromiumMod as { args: string[]; executablePath: () => Promise<string> });
    const puppeteer = await import("puppeteer-core");
    return puppeteer.launch({
      args: [...chromium.args, "--font-render-hinting=none", "--disable-web-security"],
      executablePath: await chromium.executablePath(),
      headless: true,
      defaultViewport: { width: 1123, height: 794, deviceScaleFactor: 2 },
    }) as unknown as Promise<AnyBrowser>;
  }

  // Lokal: full puppeteer
  const puppeteer = await import("puppeteer");
  return puppeteer.launch({
    headless: true,
    args: ["--font-render-hinting=none", "--disable-web-security"],
  }) as unknown as Promise<AnyBrowser>;
}
