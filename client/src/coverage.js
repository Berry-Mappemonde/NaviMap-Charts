/**
 * Emprises approximatives des eaux NOAA — calque de *prévision*, pas une ENC.
 * Géométries volontairement grossières (quelques degrés).
 */
export const NOAA_PLANNED_COVERAGE = {
  type: "FeatureCollection",
  name: "navimap-noaa-planned",
  features: [
    {
      type: "Feature",
      properties: { name: "Côte Est & Golfe" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-98.5, 24.2], [-80.0, 24.2], [-66.8, 43.5],
          [-71.0, 45.3], [-84.0, 30.5], [-97.5, 28.0], [-98.5, 24.2],
        ]],
      },
    },
    {
      type: "Feature",
      properties: { name: "Côte Ouest" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-125.2, 32.4], [-116.8, 32.4], [-122.2, 49.1],
          [-125.8, 48.5], [-125.2, 32.4],
        ]],
      },
    },
    {
      type: "Feature",
      properties: { name: "Alaska (sud)" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-168.0, 53.0], [-130.0, 53.0], [-130.0, 61.5],
          [-168.0, 61.5], [-168.0, 53.0],
        ]],
      },
    },
    {
      type: "Feature",
      properties: { name: "Hawaï" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-160.6, 18.7], [-154.6, 18.7], [-154.6, 22.4],
          [-160.6, 22.4], [-160.6, 18.7],
        ]],
      },
    },
    {
      type: "Feature",
      properties: { name: "Porto Rico & Îles Vierges" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-68.2, 17.6], [-64.4, 17.6], [-64.4, 18.8],
          [-68.2, 18.8], [-68.2, 17.6],
        ]],
      },
    },
  ],
};
