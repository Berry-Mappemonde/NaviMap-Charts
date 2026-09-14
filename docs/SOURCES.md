# Sources de données

Dernière revue : 2026-09-14. N’ajoutez une source ici **que** si la licence
est vérifiée.

## Autorisées

### NOAA Electronic Navigational Charts

- Portail : https://charts.noaa.gov/ENCs/ENCs.shtml
- Catalogue XML : https://www.charts.noaa.gov/ENCs/ENCProdCat.xml
- Format : S-57 (cellules `.zip`)
- Licence : domaine public fédéral américain
- DOI / citation : https://doi.org/10.25923/jyyk-j845
- Script : `python pipeline/ingest/noaa_enc_catalog.py list`

Les ENC NOAA téléchargées **directement** chez NOAA sont gratuites. Les
mêmes cellules vendues via IC-ENC / un VAR restent hors de notre canal.

### OpenStreetMap — balises `seamark:*`

- Licence : Open Database License (ODbL)
- Attribution obligatoire : © OpenStreetMap contributors
- Usage : infrastructures portuaires, amers, balisage là où NOAA n’existe pas
- Recette : `pipeline/ingest/README.md`

### IENC européennes (High-Value Datasets)

- Directive UE 2019/1024 et règlement 2023/138
- Couvre les **voies navigables intérieures**, pas les ENC côtières nationales
- Licences typiques : CC-BY 4.0
- Automatisation : à écrire

### EMODnet Bathymetry

- https://emodnet.ec.europa.eu/en/bathymetry
- Résolution : 1/16′ (~115 m)
- Licence : CC-BY 4.0
- Usage : isobathes européennes, jamais comme carte officielle

### GEBCO

- Grille mondiale 15″ (~450 m)
- Usage libre **avec citation**
- Usage : continuité océanique, trop grossier pour un port

## Interdites sans contrat

| Agence | Protection | Pourquoi c’est interdit |
|---|---|---|
| SHOM (France) | Droits d’auteur / redevances | Financement des levés |
| UKHO | Crown Copyright | Poursuites en cas de redistribution |
| CHS (Canada) | Contrats fabricants | Même logique |
| AHO (Australie) | Licence commerciale | Même logique |
| Garmin, Navionics, Orca, C-MAP | Formats propriétaires | Contrefaçon + CGU |

## IHO DCDB (sondages participatifs)

Dépôt ouvert de traces CSB. Intéressant plus tard, **pas** un substitut
aux ENC. Hors V1.
