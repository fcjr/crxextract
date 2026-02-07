# crxextract

A web app for extracting Chrome (.crx) and Firefox (.xpi) browser extensions into downloadable zip files. All file processing happens client-side in the browser.

## Features

- **Local file upload** — Drag and drop .crx or .xpi files to extract them as .zip
- **URL-based download** — Paste a Chrome Web Store or Mozilla Add-on URL to download and extract the extension
- Supports CRX version 3 format
- XPI files are saved directly as .zip (they're already valid zip archives)

## Tech Stack

- **Frontend**: SvelteKit + TypeScript
- **Backend**: SvelteKit server routes (Chrome CRX URL resolution, Firefox Add-on page scraping)
- **Deployment**: Vercel (via @sveltejs/adapter-vercel)

## Development

Requires Node.js >= 22.

```bash
npm i
npm run dev
```

This starts the dev server with both frontend and API routes.

### Other commands

```bash
npm run build      # Production build
npm run preview    # Preview production build locally
npm run check      # Run svelte-check type validation
```
