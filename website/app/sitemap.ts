import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/demo", "/privacy"].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
  }));
}
