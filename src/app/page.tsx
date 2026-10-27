import { SiteExperience } from "@/components/SiteExperience";

/**
 * Renders the client's full website dynamically.
 *
 * Content is loaded at runtime through GET /api/site?site={slug} — a Cloudflare
 * Pages Function that reads the private GitHub repository with GITHUB_TOKEN —
 * and the admin state comes from GET /api/auth (HttpOnly JWT cookie).
 *
 * Supported templateId values:
 *   forge-automotive · apple-spatial · horology-chrono ·
 *   kinetic-monolith · swiss-editorial
 * Legacy ids are mapped in src/types/site.ts.
 */
export default function Home() {
  return <SiteExperience />;
}
