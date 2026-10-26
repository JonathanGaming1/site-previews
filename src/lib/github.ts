import { REPO_NAME, REPO_OWNER, SITES_DIR } from "@/components/SiteProvider";

const CONTENTS_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;

export function ghHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export interface GhFileResponse {
  sha: string;
  content?: string;
}

/** Fetch the current file metadata (needed for the `sha` on every update). */
export async function getFileSha(
  token: string,
  slug: string,
): Promise<string | undefined> {
  const url = `${CONTENTS_API}/${SITES_DIR}/${slug}.json?ref=main`;
  const res = await fetch(url, { headers: ghHeaders(token) });
  if (res.status === 404) return undefined; // new file
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to read ${slug}.json (${res.status}): ${body}`);
  }
  const json = (await res.json()) as GhFileResponse;
  return json.sha;
}

/** Commit a JSON file into public/sites/{slug}.json on main (with cache-busting
 * commit message so raw.githubusercontent delivers fresh content on refresh). */
export async function saveSiteJson(
  token: string,
  slug: string,
  value: unknown,
): Promise<void> {
  const sha = await getFileSha(token, slug);
  const content = btoa(
    String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value, null, 2))),
  );
  const res = await fetch(`${CONTENTS_API}/${SITES_DIR}/${slug}.json`, {
    method: "PUT",
    headers: ghHeaders(token),
    body: JSON.stringify({
      message: `Admin edit: update ${slug} @ ${new Date().toISOString()}`,
      content,
      sha,
      branch: "main",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub save failed (${res.status}): ${body}`);
  }
}
