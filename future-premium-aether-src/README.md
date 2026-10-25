# Future Premium Template (Aether) — source

A luxurious, premium, futuristic landing page in the Apple/NVIDIA register:
deep space-black, a slow plasma aurora (electric cyan → indigo → violet),
Inter typography with Apple-tight tracking, glassmorphic nav, squircle
surfaces with a lit-from-above "depth" edge, and motion that respects
`prefers-reduced-motion`.

**Live preview:** https://site-00ab288e9c8c4dec8f7dadac00b33dae.freebuff.page

This folder is the fully editable React + Vite (Cloudflare Workers) project.
## Run it

```sh
bun install
bun run dev        # local dev server
bun run build      # dist/client assets + Worker bundle
bun run typecheck
```

## Re-theme it for a client

- `src/content.ts` — the ONLY file you edit per client. Every string, price,
  label and link lives there, with a checklist comment at the top.
- `src/styles.css` — the `@theme` tokens (accent colors, surfaces). Swapping
  `--color-accent*` re-themes the entire site.

## Single-file preview

After a build, generate a self-contained HTML export that runs anywhere:

```sh
bun run build && node scripts/make-single-file.mjs
# writes future-premium-aether.html (~460 KB, no build tooling needed)
```

## Deploy (Freebuff Sites)

`deploy.json` points at the build output. After `bun run build`, deploy it with
the `sites_deploy` tool (or the Sites API) from this directory.
