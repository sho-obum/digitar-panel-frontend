import { log } from "@/lib/logger";
const APOLLO_BASE_URL = process.env.APOLLO_BASE_URL;
const APOLLO_API_KEY = process.env.APOLLO_API_KEY ;
console.log("Using APOLLO_BASE_URL:", APOLLO_BASE_URL ? "✅ Loaded" : "❌ Missing");
console.log("Using Apollo API Key:", APOLLO_API_KEY ? "✅ Loaded" : "❌ Missing");

export async function orgDataByWeb(domain: string) {
  const url = `${APOLLO_BASE_URL}/organizations/enrich?domain=${encodeURIComponent(domain)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `  ${APOLLO_API_KEY}`,
    },
    cache: "no-store",
  });
    if (!response.ok) {
        const errorText = await response.text();
        log.error('Apollo API request failed', { url, errorText });
        throw new Error(`Apollo API request failed: ${errorText}`);
    }
    log.info('Apollo API request successful', { url });
    return response.json();
}
