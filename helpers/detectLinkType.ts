/**

 * @param {string} url - The URL to analyze.
 * @returns {{ type: "ios" | "android" | "web" | "invalid", appId?: string }}

 */
import { log } from "@/lib/logger";
export function detectLinkType(
  url: string
): { type: "ios" | "android" | "web" | "invalid"; appId?: string } {
  if (!url || typeof url !== "string") return { type: "invalid" };
  log.info('Detecting link type', { url });
  // Normalize and ensure protocol
  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = "https://" + normalizedUrl; 
  }

  try {
    const parsed = new URL(normalizedUrl);
    const hostname = parsed.hostname.toLowerCase();

    // 🔹 iOS App Store detection
    if (hostname.includes("apps.apple.com")) {
      const match = normalizedUrl.match(/\/id(\d+)/);
      const appId = match ? match[1] : undefined;
      return { type: "ios", ...(appId ? { appId } : {}) };
    }

    // 🔹 Google Play Store detection
    if (hostname.includes("play.google.com")) {
      const appId = parsed.searchParams.get("id") || undefined;
      return { type: "android", ...(appId ? { appId } : {}) };
    }

    // 🔹 Generic domain (valid)
    if (hostname.match(/[a-z0-9.-]+\.[a-z]{2,}$/)) {
      return { type: "web" };
    }

    return { type: "invalid" };
  } catch {
    return { type: "invalid" };
  }
}
