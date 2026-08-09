# DotBros Painting Co. Landing Page

This project is the initial local frontend for a polished, responsive single-page website for DotBros Painting Co.

## Folder structure

This project now separates editable design source files from production-ready website assets.

- `assets-source/` is for editable source artwork and working files.
- `assets-source/photoshop/` stores layered PSD compositions and raster design source files.
- `assets-source/illustrator/` stores logos, vectors, icons, and branding source files.
- `assets-source/blender/` stores 3D scenes, renders, and animation source files.
- `assets-source/exports/` stores temporary exports before final optimization.
- `public/assets/` is for optimized files that are safe to reference from the website code.
- `public/assets/hero/`, `logo/`, `intro/`, `services/`, `portfolio/`, `icons/`, and `textures/` organize production assets by usage.

Only optimized web assets should be placed inside `public/assets`.
Editable source files should always remain inside `assets-source`.

## Asset workflow

Recommended workflow for adding new assets:

1. Create artwork in Photoshop, Illustrator, or Blender.
2. Save the editable source file in the correct folder inside `assets-source/`.
3. Export a working version into `assets-source/exports/`.
4. Optimize the asset for the web as `WebP`, `PNG`, or `SVG` as appropriate.
5. Move the final optimized file into the correct folder inside `public/assets/`.
6. Reference only files inside `public/assets/` from the website code.

For the dedicated workflow guide, see `asset-workflow.md`.

## Start the local development server

1. Install dependencies if needed with `npm install`.
2. Start the Vite dev server with `npm run dev`.
3. If your environment blocks the default bind, run `npm run dev -- --host 127.0.0.1`.

## Main files

- `index.html` contains the page structure, semantic sections, modal markup, and the inline intro failsafe.
- `src/style.css` controls layout, colors, responsive behavior, placeholders, and the paint-roller animation styling.
- `src/main.js` handles the intro sequence, mobile navigation, project modal, form preview message, and the footer year.

## Adjust the paint-roller intro

- In `src/main.js`, change `INTRO_DURATION_MS` to adjust the full intro length.
- In `src/main.js`, change `ROLLER_TRAVEL_MS` to adjust roller speed.
- In `src/main.js`, change `INTRO_PLAY_MODE` to `'always'` or `'session'` for local testing.
- In `src/style.css`, change `--intro-roller-size` to resize the roller.
- In `src/style.css`, change `--intro-fill` to alter the painted page color.
- In `src/style.css`, change `--paint-accent` if you want the accent details and roller color to shift with the brand.

## Future asset handoff

- Add a final SVG, WebM, or video-backed intro asset inside `public/assets/` when you are ready to replace the current inline/CSS roller version.
- Swap the hero visual placeholder and the service/gallery placeholders with real local images or video assets once they exist.
- Permanent static assets should live in `public/assets/`.

## Update business contact details

- Replace the placeholder phone number and email in the footer section inside `index.html`.

## Production build

Run `npm run build` to create the production bundle in `dist/`.
