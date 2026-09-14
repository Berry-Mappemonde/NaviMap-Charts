# Feuille de route

Ordre volontairement étroit : d’abord ce qui est **légal et compilable**,
ensuite le rendu, jamais les licences payantes.

## V0 — ce dépôt (maintenant)

- Viewer MapLibre + acceptation juridique à chaque session
- Catalogue NOAA ENC (liste, téléchargement optionnel)
- Documentation des sources et de l’architecture
- Fond terrestre ouvert en attendant nos tuiles

## V1 — première carte compilée (eaux américaines)

- Télécharger les cellules NOAA *Active* d’une région pilote
  (Chesapeake / côte Est)
- Extraire géométries + attributs S-57 (feux, isobathes, dangers)
- Produire un PMTiles régional
- Style MapLibre inspiré INT-1 (sprites, secteurs de feux précalculés)
- Servir le fichier en statique (Range HTTP)

## V2 — Europe fluviale + bathymétrie scientifique

- IENC HVD (fleuves / canaux)
- Isobathes EMODnet (Europe) et GEBCO (large)
- Biais haut-fond à l’extraction
- Fusion OSM hors des eaux NOAA

## Plus tard, seulement si le besoin est réel

- Palettes S-52 allégées (profondeur de sécurité dynamique)
- Archive planète + usage hors-ligne
- IHO DCDB (sondages ouverts), jamais un « SonarChart »

## Hors route, définitivement

- Concurrent Garmin / Orca
- Licences VAR / Distribution Partner
- Homologation ECDIS
- Scraping SHOM / UKHO
