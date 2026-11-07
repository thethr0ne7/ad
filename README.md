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

## Map-first workflow (no restricted cadastral API)
1. Open **«Контур и координаты»** in the application.
2. Navigate using latitude/longitude, or pan and zoom over Kabardino-Balkaria.
3. Click at least three corners of a *candidate* area on the OpenStreetMap base map.
4. Inspect approximate area in hectares and export coordinates (CSV) or a valid closed polygon (GeoJSON WGS84).
5. Optionally upload a lawfully obtained GeoJSON polygon layer of **known** boundaries. The application reports detected intersections against that particular uploaded layer, not against a national cadastre.
6. Treat all candidate results as **unverified** until confirmed by official documents and competent authorities.

### Meaning of «free land»
An apparent gap on a basemap, unused agricultural field, or absent intersection in an incomplete layer **does not** establish freedom from ownership, use rights, leases, public easements, protected zones or pending claims. The system must never assert legal availability solely from imagery, OpenStreetMap, or hand-drawn polygons.

### Licensing and operation
The candidate sketching interface uses Leaflet with standard OpenStreetMap raster tiles for modest interactive testing. Respect © OpenStreetMap contributors attribution and the [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/). For production/commercial usage or scaled scanning, configure an appropriate licensed tile provider or self-host tiles. Bulk tile scraping is not supported.
Google Maps data and satellite imagery must not be digitized into new stored polygons, per Google Maps Platform restrictions.

### Important development notes
- Additional dependency: `leaflet` and type package `@types/leaflet`. Reinstall dependencies and regenerate the Bun lockfile before deployment.
- The earlier prototype still contains hardcoded guesses in other import paths and the legal engine. Do not treat it as a production verification service.
- There is **no automated image segmentation** in this phase. Automatic candidate discovery needs a separately licensed imagery source, quality controls, and independent cadastral data.
