# Architecture — NaviMap Charts

Quatre modules, dans cet ordre. Aucun n’est un ECDIS.

```
Sources libres          NOAA ENC (CC0)         MNT scientifiques
OSM seamark:*           S-57 / S-101           EMODnet · GEBCO
        │                     │                       │
        ▼                     ▼                       ▼
   Osmium / ETL          Catalogue + parseur     Isobathes biais
                         (tile57 plus tard)      haut-fond (GDAL)
        │                     │                       │
        └──────────┬──────────┘                       │
                   ▼                                  │
         Harmonisation topologique ◄──────────────────┘
                   │
                   ▼
         Compilateur PMTiles (Planetiler / tippecanoe)
                   │
                   ▼
         Fichier unique .pmtiles (CDN, Range HTTP)
                   │
                   ▼
         Viewer MapLibre GL — style inspiré INT-1
         + disclaimer « NOT FOR NAVIGATION »
```

## Module 1 — Ingestion

- **NOAA** : le script `pipeline/ingest/noaa_enc_catalog.py` lit le catalogue
  officiel XML et, sur demande, télécharge les cellules *Active* en S-57.
- **OSM** : extraire `seamark:*` d’un extrait planète (osmium). Recette dans
  `pipeline/ingest/README.md`.
- **IENC** : portails HVD européens (VNF, Rijkswaterstaat…). Pas encore
  automatisé.
- **Priorité spatiale** : sur les eaux américaines, NOAA l’emporte sur OSM.

## Module 2 — Bathymétrie

EMODnet (~115 m) sur l’Europe, GEBCO (~450 m) ailleurs. Les courbes sont
tracées avec un **biais vers les hauts-fonds** (IHO S-4) : on retient la
sonde la moins profonde, jamais une moyenne qui ferait disparaître un écueil.

Hors périmètre pour l’instant : sondeurs participatifs, modèles de marée
TPXO/FES, estimateur CUBE. Cela demanderait une communauté et un cloud
dédiés.

## Module 3 — Tuiles

Cible : une archive **PMTiles** (tuiles vectorielles MVT) servie par un
stockage objet + CDN. Le VPS n’a pas à faire tourner PostGIS.

La compilation se fera **hors machine de production** (CI ou poste local
avec beaucoup de RAM). tippecanoe ou Planetiler, puis tile57 quand le
parseur S-57 sera branché.

## Module 4 — Viewer

`client/` : MapLibre GL, palettes jour / crépuscule / nuit, bandeau et
modale juridiques. Tant que nos tuiles n’existent pas, le fond est une
carte terrestre ouverte (tuiles OpenStreetMap).

Le serveur `client/server.mjs` ajoute un hub live en mémoire :

```
Charts ──────┐  POST /api/events       GET /api/events (SSE)
Ground ──────┼────────────────► hub ───────────────────────► MapLibre
Satellites ──┘                 état courant                 couches + statut
```

Un événement `status` alimente le bandeau de progression. Un événement
`layer` ajoute, remplace ou retire une source MapLibre (`geojson`, `image`,
`raster` ou `vector`). Chaque couche porte un groupe `charts`, `ground` ou
`satellites`; le viewer construit les interrupteurs à partir de cet état.

Le hub conserve la dernière version de chaque couche et de chaque statut.
À l’ouverture ou après une coupure réseau, le premier événement SSE est un
instantané complet. Les producteurs restent découplés : ils utilisent un
simple POST JSON, et une panne du viewer ne doit jamais faire échouer un
traitement scientifique.

## Ce que ce dépôt n’est pas

- Pas un concurrent Garmin / Navionics / Orca.
- Pas un parseur S-57 complet (prévu, pas écrit).
- Pas une homologation SOLAS.
