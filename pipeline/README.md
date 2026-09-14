# Pipeline NaviMap Charts

Trois dossiers, un par module encore incomplet :

| Dossier | Module | État |
|---|---|---|
| `ingest/` | NOAA ENC + recettes OSM / IENC | Catalogue NOAA opérationnel |
| `bathy/` | Isobathes EMODnet / GEBCO | Recette seulement |
| `tiles/` | Compilation PMTiles | Recette seulement |

Toujours depuis la racine du dépôt :

```bash
python3 pipeline/ingest/noaa_enc_catalog.py list --status Active --limit 10
python3 -m unittest pipeline/ingest/test_noaa_enc_catalog.py -q
```
