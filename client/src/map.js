import * as maplibregl from "maplibre-gl";
import { NOAA_PLANNED_COVERAGE } from "./coverage.js";

const PALETTES = {
  day: {
    background: "#d7e5eb",
    raster: { "raster-saturation": -0.2, "raster-contrast": 0.05 },
  },
  dusk: {
    background: "#253c4d",
    raster: {
      "raster-saturation": -0.55,
      "raster-contrast": 0.2,
      "raster-brightness-min": 0.18,
      "raster-brightness-max": 0.72,
    },
  },
  night: {
    background: "#071521",
    raster: {
      "raster-saturation": -0.8,
      "raster-contrast": 0.3,
      "raster-brightness-min": 0.04,
      "raster-brightness-max": 0.38,
    },
  },
};

const COVERAGE_SOURCE = "noaa-planned";

function styleFor(name) {
  const palette = PALETTES[name] || PALETTES.day;
  return {
    version: 8,
    sources: {
      "osm-basemap": {
        type: "raster",
        tiles: [
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": palette.background },
      },
      {
        id: "osm-basemap",
        type: "raster",
        source: "osm-basemap",
        paint: palette.raster,
      },
    ],
  };
}

function addCoverage(map) {
  if (map.getSource(COVERAGE_SOURCE)) return;
  map.addSource(COVERAGE_SOURCE, {
    type: "geojson",
    data: NOAA_PLANNED_COVERAGE,
  });
  map.addLayer({
    id: "noaa-planned-fill",
    type: "fill",
    source: COVERAGE_SOURCE,
    paint: {
      "fill-color": "#c9a227",
      "fill-opacity": 0.12,
    },
  });
  map.addLayer({
    id: "noaa-planned-line",
    type: "line",
    source: COVERAGE_SOURCE,
    paint: {
      "line-color": "#e8c547",
      "line-width": 1.6,
      "line-dasharray": [2, 2],
    },
  });
}

export function createMap(container) {
  const map = new maplibregl.Map({
    container,
    style: styleFor("day"),
    center: [-76.3, 37.6],
    zoom: 6.2,
    attributionControl: false,
    cooperativeGestures: false,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");
  map.addControl(new maplibregl.ScaleControl({ unit: "nautical" }));
  map.on("load", () => addCoverage(map));
  return map;
}

export function setPalette(map, name) {
  map.setStyle(styleFor(name));
  map.once("styledata", () => addCoverage(map));
}
