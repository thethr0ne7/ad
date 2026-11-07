<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/86f339e3-54f2-4412-ac05-c9316ca65c2a

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Scope of this project

DIVE LAND INTELLIGENCE is a web application for researching land parcels in Kabardino-Balkaria, tracking provenance, validating imported registry data and producing preliminary analytical reports.

**Out of scope by decision of the project owner:** Blender and QGIS, their plugins, desktop automation, Blender scene generation, QGIS processing, and corresponding export pipelines. Do not introduce these dependencies or integrations in subsequent iterations.

The existing optional in-browser 3D preview uses Three.js and is **not** a Blender or QGIS integration. It must not be described as surveyed terrain, a digital elevation model (DEM), or a legally valid cadastral drawing unless backed by verified geospatial source data.

Priorities: reliable official data access, fail-closed parsing, cadastral provenance, legal review, search, mapping and document generation.
