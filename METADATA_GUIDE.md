"""NOTE: This file has been rewritten to a more conversational, human-friendly tone. Refer to the code examples inside for exact usage."""

# Dynamic Metadata — Friendly Guide

This guide explains how the metadata system works in the Digitar Panel frontend and gives simple, practical steps for adding or tweaking metadata for pages.

## Why metadata matters

Metadata helps search engines and social platforms show useful previews for your pages: a clear title, a short description, and a nice social preview image. That improves discoverability and click-through rates.

## Where to start

- `lib/metadata.ts` — the helper functions used to build metadata consistently.
- `app/layout.tsx` — app-wide defaults live here.
- Add `metadata.ts` inside a route to customize that page or section.

## How it works (short)

1. The root layout provides sensible defaults (site name, description, default OG image).
2. Layout files can set shared metadata for a group of pages (for example, the dashboard).
3. Individual routes can supply page-specific metadata using `metadata.ts`.

### Root defaults

In `app/layout.tsx` we expose `defaultMetadata` so pages have a consistent baseline:

```tsx
import { defaultMetadata } from "@/lib/metadata";

export const metadata: Metadata = defaultMetadata;
```

This typically includes the site title `Digitar Panel`, a short description, and a default OG image.

### Section-level metadata

Set metadata for a whole section in a layout file. Example for the dashboard:

```tsx
import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Dashboard",
  description: "Manage your affiliate campaigns, emails, and marketing automation",
  keywords: ["dashboard", "campaigns", "affiliate marketing", "analytics"],
});
```

This gives you a title like `Dashboard | Digitar Panel` and fills Open Graph/Twitter metadata automatically.

### Page-level metadata

Add a `metadata.ts` inside a route folder to control that page precisely. For example:

```tsx
// app/(dashboard)/settings/email-configuration/metadata.ts
import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Email Configuration",
  description: "Manage your SMTP email configurations and sender settings",
  keywords: ["email configuration", "SMTP settings", "mail config"],
});
```

## The helper: `generatePageMetadata`

Use this helper to create a full `Metadata` object in a consistent way.

Parameters (summary):

```ts
interface PageMetadataParams {
  title?: string;           // becomes "<title> | Digitar Panel"
  description?: string;     // short page summary
  ogTitle?: string;         // Open Graph title (fallback to full title)
  ogDescription?: string;   // OG description (fallback to description)
  ogImage?: string;         // OG image URL
  keywords?: string[];      // SEO keywords
  canonicalUrl?: string;    // canonical URL
  noindex?: boolean;        // true to prevent indexing
}
```

It returns a Next.js `Metadata` object with title, description, Open Graph and Twitter tags, keywords, and robots rules.

## Default metadata

We include a `defaultMetadata` object for site-wide defaults:

```ts
const DEFAULT_METADATA = {
  title: "Digitar Panel",
  description: "Affiliate marketing automation dashboard",
  ogImage: "/og-image.png",
  keywords: [
    "affiliate marketing",
    "email marketing",
    "automation",
    "campaign management",
    "digitar",
  ],
};
```

## Examples

- Campaigns page:

```tsx
// app/(dashboard)/campaign/metadata.ts
export const metadata = generatePageMetadata({
  title: "Campaigns",
  description: "Manage your affiliate marketing campaigns",
  keywords: ["campaigns", "manage campaigns", "affiliate"],
  ogImage: "/images/campaigns-og.png",
});
```

- Private/admin pages (mark them `noindex`):

```tsx
// app/(dashboard)/admin-roleaccess/metadata.ts
export const metadata = generatePageMetadata({
  title: "Role Access Management",
  description: "Manage user roles and access control",
  noindex: true,
});
```

- Full custom example:

```tsx
export const metadata = generatePageMetadata({
  title: "Analytics Dashboard",
  description: "View detailed campaign analytics and performance metrics",
  ogTitle: "Campaign Analytics - Digitar Panel",
  ogDescription: "Track your affiliate marketing performance in real-time",
  ogImage: "https://your-domain.com/og-analytics.png",
  keywords: ["analytics", "reports", "performance", "dashboard"],
  canonicalUrl: "https://your-domain.com/analytics",
});
```

## Practical tips

- Keep titles concise (under ~60 characters).
- Descriptions should be around 150–160 characters.
- Use 3–5 focused keywords per page.
- Use 1200x630px images for Open Graph previews.
- Mark admin-only pages with `noindex: true`.

## Pages that already have metadata

These routes already set metadata:

- Root layout
- Auth (login)
- Dashboard layout
- Email configuration
- Campaigns
- Email templates
- Appsflyer dashboard
- Role access management
- Team management
- Settings
- Profile
- Email logs

## Adding metadata to a new page

1. Create `metadata.ts` inside the route folder.
2. Import `generatePageMetadata`:

```ts
import { generatePageMetadata } from "@/lib/metadata";
```

3. Export the metadata object:

```ts
export const metadata = generatePageMetadata({
  title: "Feature Name",
  description: "Short description",
  keywords: ["keyword1", "keyword2"],
});
```

## Quick checks (how to verify)

1. Open browser DevTools → inspect the `<head>` tags.
2. Facebook Open Graph Debugger: https://developers.facebook.com/tools/debug/
3. Twitter Card Validator: https://card-validator.twitter.com/
4. Google Rich Results Test: https://search.google.com/test/rich-results

## Notes

- Metadata is usually generated at build time for speed.
- For runtime/dynamic metadata, use `generateMetadata()` inside a page.
- Serve OG images over HTTPS so social previews render reliably.

---

If you'd like, I can:

- add a short checklist to a PR template reminding authors to add metadata, or
- scan the repo for routes missing `metadata.ts` and create a TODO list.

Which would you prefer?
