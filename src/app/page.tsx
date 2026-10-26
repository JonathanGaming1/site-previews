import { SiteExperience } from "@/components/SiteExperience";

/**
 * Renders the client's full website dynamically from src/data/siteData.json,
 * which n8n pushes to the repository before each deploy.
 */
export default function Home() {
  return <SiteExperience />;
}
