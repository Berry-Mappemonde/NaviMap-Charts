# NaviMap Charts

Dépôt officiel : [github.com/Berry-Mappemonde/NaviMap-Charts](https://github.com/Berry-Mappemonde/NaviMap-Charts)

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
git clone https://github.com/Berry-Mappemonde/NaviMap-Charts.git
cd NaviMap-Charts/client
npm install
npm run dev
```

3. Ouvrez l’adresse affichée (en général `http://localhost:5173`).
4. Cochez la case d’avertissement — sans elle, la carte ne s’affiche pas.

Le fond actuel est une carte **terrestre** ouverte (OpenFreeMap). Le calque
jaune montre la première zone prévue : les eaux américaines couvertes par
les ENC NOAA. Nos propres tuiles nautiques arriveront en V1.

## Programme NaviMap (organisation Berry-Mappemonde)

Les trois ateliers sont sous l’organisation GitHub
**[Berry-Mappemonde](https://github.com/Berry-Mappemonde)**, et non plus
sous le compte personnel `NAVIGUIDE-for-Berry-Mappemonde`.

| Atelier | Dépôt |
|---|---|
| Cartes (ce dépôt) | [NaviMap-Charts](https://github.com/Berry-Mappemonde/NaviMap-Charts) |
| Documents / calage | [NaviMap-Ground](https://github.com/Berry-Mappemonde/NaviMap-Ground) |
| Satellite | [NaviMap-Satellites](https://github.com/Berry-Mappemonde/NaviMap-Satellites) |

Dans Cursor, ouvrez l’agent ou l’environnement Cloud **depuis ces URLs**.
Un favori ou un clone encore pointé vers
`NAVIGUIDE-for-Berry-Mappemonde/NaviMap-*` produit le toast
*You do not have access to this repository*. Enchaîner les tentatives
déclenche *GitHub is rate limiting requests* : attendre la fin de l’heure
UTC, puis réessayer avec l’URL d’organisation.

Sur l’organisation GitHub, cocher
*Allow GitHub Actions to create and approve pull requests*
(Settings → Actions → General). Sinon les PR Cloud Agent restent bloquées
(`must be a collaborator`). Détail : [`docs/GITHUB_PR_CURSOR.md`](docs/GITHUB_PR_CURSOR.md).

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
