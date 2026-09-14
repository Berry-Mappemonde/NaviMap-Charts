# Cadre juridique — NaviMap Charts

NaviMap Charts est un **éditeur de cartes marines libres, non-ECDIS**.
Ce n’est pas un instrument de navigation homologué.

## Avertissement obligatoire

L’application et chaque export doivent porter, de façon visible et acceptée
par l’utilisateur :

> **NOT FOR NAVIGATION / NON DESTINÉ À LA NAVIGATION OFFICIELLE**
>
> Cet outil est strictement informatif. Il ne remplace pas les cartes marines
> officielles ni les documents nautiques exigés par l’État du pavillon.
> Aucune garantie d’exactitude bathymétrique, d’exhaustivité ou de continuité
> de service n’est donnée. L’utilisateur reste seul responsable de la conduite
> du navire (COLREGs, règle 2).

Le viewer exige cette acceptation **à chaque session** (pas un simple bandeau).

## Ce que nous pouvons utiliser

| Source | Licence | Usage prévu |
|---|---|---|
| NOAA ENC (S-57 / S-101) | Domaine public (17 U.S.C. § 105 / CC0) | Première couverture vectorielle |
| IENC européennes (HVD) | Souvent CC-BY 4.0 ou CC0 | Fleuves et canaux |
| OpenStreetMap (`seamark:*`) | ODbL | Ports, amers, balisage communautaire |
| EMODnet Bathymetry | CC-BY 4.0 | Isobathes européennes |
| GEBCO | Usage libre avec citation | Continuité océanique |

Citation NOAA demandée par l’agence :

> Office of Coast Survey. (2001). NOAA Electronic Navigational Charts (ENC)
> [Dataset]. National Oceanic and Atmospheric Administration.
> https://doi.org/10.25923/jyyk-j845

## Ce que nous n’utiliserons jamais sans licence écrite

- Cellules S-57 / S-101 du **SHOM**, de l’**UKHO**, du **CHS**, de l’**AHO**
  ou de tout autre service hydrographique hors domaine public.
- Moissonnage, décompilation ou « copie d’écran » d’un traceur commercial
  (Garmin, Navionics, Orca, C-MAP…).
- Toute donnée présentée comme équivalente ECDIS / SOLAS.

Ces interdits ne sont pas des détails techniques : les réutiliser sans contrat
est une **contrefaçon**.

## Séparation SOLAS

NaviMap Charts est un **ECS récréatif** (aide à la situation). Seuls les
systèmes ECDIS certifiés (IEC 61174, directive MED) peuvent se substituer
aux cartes officielles. Nous ne viserons pas cette certification.
