# Contribuer à NaviMap Charts

Merci. Ce dépôt construit un **éditeur de cartes libres**, pas une copie
d’un service commercial.

## Règles non négociables

1. **Sources ouvertes seulement.** Toute donnée ajoutée doit avoir une
   licence écrite (CC0, CC-BY, ODbL, domaine public). Indiquez-la dans
   `docs/SOURCES.md`.
2. **Pas de cellules SHOM / UKHO / CHS / AHO** sans contrat de distribution.
3. **Pas d’exploit, pas de scrape** d’un site ou d’un format protégé.
4. **Ne jamais retirer le disclaimer** « NOT FOR NAVIGATION ».
5. **Ne rien inventer** : un feu, une sonde ou un chenal absent reste absent.

## Comment proposer un changement

1. Forkez le dépôt (ou ouvrez une branche).
2. Un sujet = une pull request, message en *conventional commits*
   (`feat:`, `fix:`, `docs:`, `chore:`).
3. Les tests du catalogue NOAA et le build du viewer doivent passer.

## Où mettre le code

| Vous travaillez sur… | Dossier |
|---|---|
| L’écran de la carte | `client/` |
| Le téléchargement des ENC NOAA | `pipeline/ingest/` |
| Les isobathes | `pipeline/bathy/` |
| La compilation PMTiles | `pipeline/tiles/` |
| Le droit et les sources | `LEGAL.md`, `docs/SOURCES.md` |
