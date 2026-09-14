# Module 1 — Ingestion

## ENC NOAA (déjà scripté)

Le catalogue officiel fait ~10 Mo. On le lit en flux, on n’en garde que
les cellules utiles.

```bash
# Depuis la racine du dépôt
python3 pipeline/ingest/noaa_enc_catalog.py list
python3 pipeline/ingest/noaa_enc_catalog.py list --status Active --state VA --limit 20
python3 pipeline/ingest/noaa_enc_catalog.py download --cell US5VA22M
```

Les ZIP vont dans `data/noaa-enc/` (gitignoré). Par défaut, le script
**liste** ; il ne télécharge que si vous le demandez.

Tests (sans réseau) :

```bash
python3 -m unittest pipeline/ingest/test_noaa_enc_catalog.py -q
```

## OpenStreetMap `seamark:*` (recette, pas encore automatisée)

Il vous faut [osmium-tool](https://osmcode.org/osmium-tool/) et un extrait
`.osm.pbf` (Geofabrik ou planète).

```bash
# Garder uniquement le balisage marin
osmium tags-filter planet.osm.pbf \
  nwr/seamark:type \
  -o data/osm/seamarks.osm.pbf

# Aperçu GeoJSON (petit extrait régional d'abord)
osmium export data/osm/seamarks.osm.pbf -o data/osm/seamarks.geojson
```

Licence du résultat : ODbL — l’attribution OpenStreetMap reste obligatoire.

## IENC européennes

Pas de script pour l’instant. Points d’entrée à documenter au fil de l’eau
dans `docs/SOURCES.md` (VNF, Rijkswaterstaat, portails HVD).
