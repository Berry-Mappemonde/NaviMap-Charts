# Module 3 — Compilation PMTiles

Cible : un fichier unique `.pmtiles` par région, servi en HTTP avec
requêtes `Range`. Pas de PostGIS en production.

## V1 (région pilote)

1. Convertir les géométries NOAA (+ OSM hors recouvrement) en GeoJSON
   ou en couches Planetiler.
2. `tippecanoe` ou Planetiler → `chesapeake.pmtiles`.
3. Déposer le fichier sur un stockage objet / CDN.

Exemple tippecanoe (quand les GeoJSON existeront) :

```bash
tippecanoe -o data/tiles/chesapeake.pmtiles --force \
  -zg --drop-densest-as-needed \
  --name "NaviMap Charts Chesapeake" \
  --attribution "NOAA ENC (public domain) · © OpenStreetMap contributors" \
  -L depth_areas:data/derived/depare.geojson \
  -L depth_contours:data/derived/depcnt.geojson \
  -L seamarks:data/derived/seamarks.geojson \
  -L hazards:data/derived/hazards.geojson
```

## Machine

La compilation d’une région tient sur un Mac bien doté ou sur CI.
Une planète entière demande 32 Go de RAM et beaucoup de disque — pas
un petit VPS de production.
