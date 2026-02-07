# crxextract

[![Netlify Status](https://api.netlify.com/api/v1/badges/d850972b-2245-41c2-9b44-dfdc6e8513df/deploy-status)](https://app.netlify.com/sites/crxextract/deploys)

A web app for extracting Chrome (.crx) and Firefox (.xpi) browser extensions into downloadable zip files. All file processing happens client-side in the browser.

## Features

- **Local file upload** — Drag and drop .crx or .xpi files to extract them as .zip
- **URL-based download** — Paste a Chrome Web Store or Mozilla Add-on URL to download and extract the extension
- Supports CRX version 3 format
- XPI files are saved directly as .zip (they're already valid zip archives)

## Tech Stack

- **Frontend**: Svelte + TypeScript, bundled with Rollup
- **Backend**: Netlify serverless functions (Chrome CRX URL resolution, Firefox Add-on page scraping)
- **Deployment**: Netlify

## Development

Requires Node.js >= 22.

```bash
npm i
npm i -g netlify-cli
netlify dev
```

This starts the Svelte dev server with live reload and the Netlify serverless functions.

### Other commands

```bash
npm run build      # Production build
npm run dev        # Frontend dev server only (no serverless functions)
npm run validate   # Run svelte-check type validation
```
