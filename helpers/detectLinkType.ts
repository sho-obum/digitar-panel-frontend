/**
 * Detects if a given link is from App Store, Play Store, or a website/domain.
 * @param {string} url - The URL to analyze.
 * @returns {"ios" | "android" | "web" | "invalid"}
 */
export function detectLinkType(url: string): "ios" | "android" | "web" | "invalid" {
  if (!url || typeof url !== "string") return "invalid";

  // Ensure URL is well-formed
  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = "https://" + normalizedUrl; // handle "digitarmedia.com" type
  }

  try {
    const parsed = new URL(normalizedUrl);
    const hostname = parsed.hostname.toLowerCase();

    // iOS App Store
    if (hostname.includes("apps.apple.com")) return "ios";

    // Google Play Store
    if (hostname.includes("play.google.com")) return "android";

    // Any other valid domain
    if (hostname.match(/[a-z0-9.-]+\.[a-z]{2,}$/)) return "web";

    return "invalid";
  } catch {
    return "invalid";
  }
}
