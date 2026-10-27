import { SiteExperience } from "@/components/SiteExperience";

/**
 * Renders the client's full website dynamically from src/data/siteData.json,
 * which n8n pushes to the repository before each deploy.
 *
 * Supported templateId values:
 *   forge-automotive · apple-spatial · horology-chrono ·
 *   kinetic-monolith · swiss-editorial
 * Legacy ids are mapped in src/types/site.ts.
 */
export default function Home() {
  return <SiteExperience />;
}
