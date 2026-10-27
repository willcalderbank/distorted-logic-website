# Distorted Logic website

Static site for `distortedlogic.co.uk`, built with Astro and served by nginx on Coolify.

## Editing

- Home and About copy: `src/pages/index.astro`, `src/pages/about.astro`
- Project cards: one markdown file each in `src/content/projects/`
- 3D print cards: one markdown file each in `src/content/prints/`
- Tags: `src/content/tags.yaml`
- Email and social links: `src/data/profile.json`
- Styles and scripts: `public/css/site.css`, `public/js/site.js`
- Images: `public/assets/`

Cards are ordered by their `order` field.

## Running

```bash
npm install
npm run dev
```

`npm run build` writes the site to `dist/`. The `Dockerfile` builds it and serves it with `nginx.conf`.
