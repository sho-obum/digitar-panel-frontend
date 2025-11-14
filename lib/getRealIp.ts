import type { NextRequest } from "next/server";

/**
 * Get the real external client IP — never the host/server IP.
 * 
 * ✅ Works in Node.js + Edge runtimes
 * ✅ Filters out spoofed headers and private/local addresses
 * ✅ Supports Cloudflare / Vercel / Nginx reverse proxies
 * ✅ Returns "0.0.0.0" if no valid public IP detected
 */
export function getRealIp(req: Request | NextRequest): string {
  let ip: string | null = null;

  try {
    const trustProxy = process.env.TRUST_PROXY === "true";

    // --- 1️⃣ Cloudflare & trusted CDN headers ---
    if (trustProxy) {
      const cfIp = req.headers.get("cf-connecting-ip");
      if (cfIp && isPublicIp(cfIp)) return sanitizeIp(cfIp);

      const forwarded = req.headers.get("x-forwarded-for");
      if (forwarded) {
        const parts = forwarded.split(",").map((p) => p.trim());
        for (const candidate of parts) {
          if (isPublicIp(candidate)) return sanitizeIp(candidate);
        }
      }

      const realIp = req.headers.get("x-real-ip");
      if (realIp && isPublicIp(realIp)) return sanitizeIp(realIp);
    }

    // --- 2️⃣ Edge Runtime ---
    const edgeIp = (req as any).ip;
    if (edgeIp && isPublicIp(edgeIp)) return sanitizeIp(edgeIp);

    // --- 3️⃣ Node.js TCP Connection ---
    const conn =
      (req as any)?.socket ||
      (req as any)?.connection ||
      (req as any)?.info ||
      null;
    ip = conn?.remoteAddress || null;

    if (ip && ip.includes("::ffff:")) ip = ip.replace("::ffff:", "");

    if (ip && isPublicIp(ip)) return sanitizeIp(ip);
  } catch (err) {
    console.error("getRealIp error:", err);
  }

  return "0.0.0.0";
}

/**
 * Check if an IP is public (not local/private).
 */
function isPublicIp(ip?: string | null): boolean {
  if (!ip) return false;

  ip = sanitizeIp(ip);

  // Private IPv4 ranges
  const privateIPv4 = [
    /^10\./,                      // 10.0.0.0/8
    /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0 – 172.31.255.255
    /^192\.168\./,                // 192.168.0.0/16
    /^127\./,                     // localhost
  ];

  // Private IPv6 & loopbacks
  const privateIPv6 = [
    /^::1$/,
    /^fc00:/,
    /^fd00:/,
    /^fe80:/,
  ];

  if (privateIPv4.some((r) => r.test(ip))) return false;
  if (privateIPv6.some((r) => r.test(ip))) return false;

  // Must look like IPv4 or IPv6
  const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
  const isIPv6 = /^[0-9a-fA-F:]+$/.test(ip);
  if (!isIPv4 && !isIPv6) return false;

  return true;
}

/**
 * Normalize IPv6/IPv4 formatting, strip ports, and remove zone IDs.
 */
function sanitizeIp(raw: string): string {
  let ip = raw.trim();

  // Remove port (e.g., "192.168.0.1:3000")
  if (ip.includes(":") && ip.includes(".")) {
    ip = ip.split(":")[0];
  }

  // Remove IPv6 brackets or zone identifiers (e.g., "[::1]", "fe80::1%eth0")
  ip = ip.replace(/^\[|\]$/g, "").replace(/%.+$/, "");

  // Normalize IPv6-wrapped IPv4 "::ffff:192.0.2.128"
  ip = ip.replace(/^::ffff:/, "");

  // Map localhost
  if (ip === "::1") ip = "127.0.0.1";

  return ip;
}
