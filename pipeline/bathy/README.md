# Module 2 — Bathymétrie

Pas de code ici pour la V0. La règle à coder plus tard :

1. Europe : raster EMODnet Bathymetry (CC-BY 4.0, ~115 m).
2. Reste du monde : grille GEBCO (citation obligatoire, ~450 m).
3. Extraire les isobathes 2, 5, 10, 20, 50 m avec **biais haut-fond**
   (retenir le minimum, jamais la moyenne).
4. Construire les polygones DEPARE (bandes de couleur).

Outils prévus : GDAL (`gdal_contour`) puis un post-traitement Python
(Rasterio / Shapely) pour le biais sécuritaire.

Ne pas héberger les rasters bruts dans git (~plusieurs Go).
