import type { MetadataRoute } from "next";
import { seoConfig } from "@/lib/seo-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
  };
}
