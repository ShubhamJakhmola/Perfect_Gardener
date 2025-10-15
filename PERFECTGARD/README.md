# Perfect Gardener — Affiliate Product Landing Page

A modern, fully responsive landing page that:
- Imports products from CSV/Excel automatically
- Auto-fetches images from product URLs
- Highlights your YouTube channel
- Includes a contact form powered by EmailJS

## Quick Start

1) Serve this folder locally (required for auto CSV/XLSX loading):
- Python: `python -m http.server 5500`
- Node: `npx serve -l 5500`
Then open `http://localhost:5500/`.

2) Add a `products.csv` or `products.xlsx` next to `index.html` (or use the Import button in the hero).

3) Configure EmailJS in `script.js` by replacing `YOUR_PUBLIC_KEY`, `YOUR_SERVICE_ID`, `YOUR_TEMPLATE_ID`.

## CSV/Excel Format

Minimum columns (case-insensitive):
- `Product Name` (or `Name`, `Title`)
- `Product URL` (or `URL`, `Link`)
- `Price` (or `Cost`)

For Excel, the first worksheet is read.

## Auto Image Fetching

The page calls the Microlink API to get the Open Graph image. If that fails, it tries a screenshot; otherwise a placeholder image is shown. You can swap Microlink for your own metadata proxy if preferred.

## Customize

- Colors/spacing: edit `:root{}` in `styles.css`
- Branding/copy: edit `index.html`
- YouTube handle and embed: update links in `index.html`

## Notes

- Some affiliate sites block metadata/screenshot requests; placeholders will appear.
- Opening `index.html` directly from the filesystem may block auto file loading; use a local server.

