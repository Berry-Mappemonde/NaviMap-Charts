import maplibregl from "maplibre-gl";
import { NOAA_PLANNED_COVERAGE } from "./coverage.js";

const STYLES = {
  day: "https://tiles.openfreemap.org/styles/liberty",
  dusk: "https://tiles.openfreemap.org/styles/positron",
  night: "https://tiles.openfreemap.org/styles/dark",
};

const COVERAGE_SOURCE = "noaa-planned";

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
      "fill-opacity": 0.32,
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
    style: STYLES.day,
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
  const url = STYLES[name] || STYLES.day;
  map.setStyle(url);
  map.once("styledata", () => addCoverage(map));
}
