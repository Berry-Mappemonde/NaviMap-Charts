export const STRINGS = {
  fr: {
    tagline: "Charts · Ground · Satellites en direct",
    palette: "Palette",
    coverageTitle: "Première couverture prévue",
    coverageLead: "ENC NOAA · eaux des États-Unis",
    coverageBody:
      "Les tuiles nautiques NaviMap ne sont pas encore compilées. Le fond actuel est une carte terrestre ouverte. Le calque jaune montre où les cellules NOAA (domaine public) seront assemblées en premier.",
    srcNoaa: "NOAA ENC — domaine public",
    srcOsm: "OpenStreetMap seamark:* — ODbL",
    srcBathy: "EMODnet / GEBCO — plus tard",
    srcForbidden:
      "Aucune cellule SHOM, UKHO ou autre service payant n’est utilisée.",
    watermark: "NOT FOR NAVIGATION",
    attrib:
      "Fond et données © OpenStreetMap contributors · couches reçues : sources et licences des pipelines",
    discTitle: "Non destiné à la navigation officielle",
    discBody:
      "NaviMap Charts est un outil informatif. Ce n’est pas un ECDIS, ni une carte officielle. Vérifiez toujours les documents nautiques exigés par votre pavillon. Vous restez seul responsable de la conduite du navire.",
    discAccept:
      "Je comprends : cet outil ne remplace pas une carte marine officielle.",
    discEnter: "Entrer dans le viewer",
    day: "Jour",
    dusk: "Crépuscule",
    night: "Nuit",
  },
  en: {
    tagline: "Live Charts · Ground · Satellites",
    palette: "Palette",
    coverageTitle: "First planned coverage",
    coverageLead: "NOAA ENC · United States waters",
    coverageBody:
      "NaviMap nautical tiles are not compiled yet. The current basemap is an open land map. The yellow overlay shows where public-domain NOAA cells will be assembled first.",
    srcNoaa: "NOAA ENC — public domain",
    srcOsm: "OpenStreetMap seamark:* — ODbL",
    srcBathy: "EMODnet / GEBCO — later",
    srcForbidden:
      "No SHOM, UKHO, or other paywalled hydrographic cells are used.",
    watermark: "NOT FOR NAVIGATION",
    attrib:
      "Basemap and data © OpenStreetMap contributors · live layers: pipeline sources and licences",
    discTitle: "Not for official navigation",
    discBody:
      "NaviMap Charts is an informational tool. It is not an ECDIS and not an official chart. Always carry the nautical documents required by your flag state. You remain solely responsible for the conduct of the vessel.",
    discAccept:
      "I understand: this tool does not replace an official nautical chart.",
    discEnter: "Enter the viewer",
    day: "Day",
    dusk: "Dusk",
    night: "Night",
  },
};

export function applyLang(lang) {
  const dict = STRINGS[lang] || STRINGS.fr;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll("[data-palette]").forEach((btn) => {
    const key = btn.getAttribute("data-palette");
    if (dict[key]) btn.textContent = dict[key];
  });
}
