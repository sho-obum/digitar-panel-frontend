import type { Metadata } from "next";

interface PageMetadataParams {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noindex?: boolean;
}

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

export function generatePageMetadata(
  params: PageMetadataParams
): Metadata {
  const {
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    keywords,
    canonicalUrl,
    noindex = false,
  } = params;

  const fullTitle = title
    ? `${title} | ${DEFAULT_METADATA.title}`
    : DEFAULT_METADATA.title;

  const metaDescription = description || DEFAULT_METADATA.description;

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: keywords || DEFAULT_METADATA.keywords,
    openGraph: {
      title: ogTitle || fullTitle,
      description: ogDescription || metaDescription,
      images: ogImage ? [{ url: ogImage }] : [{ url: DEFAULT_METADATA.ogImage }],
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle || fullTitle,
      description: ogDescription || metaDescription,
      images: ogImage ? [ogImage] : [DEFAULT_METADATA.ogImage],
    },
    robots: {
      index: !noindex,
      follow: !noindex,
    },
    ...(canonicalUrl && { alternates: { canonical: canonicalUrl } }),
  };
}

export const defaultMetadata: Metadata = {
  title: DEFAULT_METADATA.title,
  description: DEFAULT_METADATA.description,
  keywords: DEFAULT_METADATA.keywords,
  openGraph: {
    title: DEFAULT_METADATA.title,
    description: DEFAULT_METADATA.description,
    images: [{ url: DEFAULT_METADATA.ogImage }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_METADATA.title,
    description: DEFAULT_METADATA.description,
    images: [DEFAULT_METADATA.ogImage],
  },
};
