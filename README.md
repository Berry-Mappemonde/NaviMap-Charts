# NaviMap Charts

Dépôt : [github.com/NAVIGUIDE-for-Berry-Mappemonde/NaviMap-Charts](https://github.com/NAVIGUIDE-for-Berry-Mappemonde/NaviMap-Charts)

Éditeur de cartes marines **libres**, **non-ECDIS**.

> **NOT FOR NAVIGATION — non destiné à la navigation officielle.**
> Ce n’est pas une carte SHOM, pas un ECDIS, pas un concurrent Garmin ou Orca.
> Vérifiez toujours les documents nautiques officiels avant d’appareiller.

NaviMap Charts assemble uniquement des données que l’on a le **droit**
d’utiliser : ENC NOAA (domaine public), balisage OpenStreetMap, plus tard
les IENC européennes et les bathymétries EMODnet / GEBCO.

## Ouvrir le viewer (sur votre Mac)

1. Installez [Node.js 20](https://nodejs.org/) si ce n’est pas déjà fait.
2. Dans le Terminal :

```bash
git clone https://github.com/NAVIGUIDE-for-Berry-Mappemonde/NaviMap-Charts.git
cd NaviMap-Charts/client
npm install
npm run dev
```

3. Ouvrez l’adresse affichée (en général `http://localhost:5173`).
4. Cochez la case d’avertissement — sans elle, la carte ne s’affiche pas.

Le fond actuel est une carte **terrestre** ouverte (OpenFreeMap). Pour la carte
auto-actualisée qui réunit Charts, Ground et Satellites, utilisez plutôt le
serveur live :

```bash
cd client
npm run live
```

Ouvrez `http://localhost:5173`. Le serveur expose un flux SSE
`GET /api/events`; les pipelines publient leurs statuts et leurs couches sur
`POST /api/events`. Les reconnexions reçoivent immédiatement l’état courant,
donc aucune actualisation manuelle de la page n’est nécessaire.

Dans deux autres terminaux, par exemple :

```bash
# Couches Charts de démonstration : tuiles, emprise ENC, bathymétrie
cd navimap-charts/client
npm run demo:live

# Les autres dépôts publient leurs vraies sorties dès qu’elles sont écrites
navimap-ground demo --out out --live-url http://localhost:5173
navimap-sat demo --out work/demo --live-url http://localhost:5173 --live-delay 0.8
```

`NAVIMAP_LIVE_MAP_URL=http://localhost:5173` remplace aussi l’option
`--live-url` côté Python.

Pour servir un build sans Vite :

```bash
npm run build
npm start
```

## Lister les cellules NOAA (sans tout télécharger)

Python 3.11+ suffit, aucune bibliothèque à installer :

```bash
cd NaviMap-Charts
python3 pipeline/ingest/noaa_enc_catalog.py list --status Active --limit 15
```

Pour télécharger **une** cellule (fichier ZIP, dossier `data/`, non versionné) :

```bash
python3 pipeline/ingest/noaa_enc_catalog.py download --cell US5VA22M
```

## Organisation du dépôt

```
client/                 Viewer MapLibre (disclaimer + palettes)
pipeline/ingest/        Catalogue et téléchargement NOAA ENC
pipeline/bathy/         Recette des isobathes (pas encore de code)
pipeline/tiles/         Recette PMTiles (pas encore de code)
docs/                   Architecture, sources, feuille de route
LEGAL.md                Droit, licences, interdits
```

## Ce que nous ne ferons pas

- Télécharger ou convertir des cellules SHOM, UKHO, CHS ou AHO sans contrat.
- Copier un format Garmin / Navionics / Orca.
- Affirmer qu’une carte NaviMap suffit à naviguer.

Détail : [`LEGAL.md`](LEGAL.md) · sources : [`docs/SOURCES.md`](docs/SOURCES.md) ·
plan : [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Licence du code

Le logiciel est sous [MIT](LICENSE). Les **données** gardent leur propre
licence (domaine public NOAA, ODbL OSM, CC-BY EMODnet…). Ne mélangez pas
les deux.
