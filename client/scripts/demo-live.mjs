const base = (process.env.NAVIMAP_LIVE_MAP_URL || "http://localhost:5173").replace(/\/$/, "");
const delayIndex = process.argv.indexOf("--delay");
const delay = delayIndex >= 0 ? Number(process.argv[delayIndex + 1]) : 900;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function post(event) {
  const response = await fetch(`${base}/api/events`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event),
  });
  if (!response.ok) throw new Error(`hub live : HTTP ${response.status} ${await response.text()}`);
  await sleep(delay);
}

const geojson = (features) => ({ type: "FeatureCollection", features });
const polygon = (coordinates, properties = {}) => ({
  type: "Feature",
  properties,
  geometry: { type: "Polygon", coordinates: [coordinates] },
});
const line = (coordinates, properties = {}) => ({
  type: "Feature",
  properties,
  geometry: { type: "LineString", coordinates },
});

await fetch(`${base}/api/reset`, { method: "POST" });
await post({
  type: "status",
  pipeline: "charts",
  phase: "tiles",
  message: "Connexion au lot de tuiles nautiques…",
  progress: 0.12,
});
await post({
  type: "layer",
  pipeline: "charts",
  layer: {
    id: "charts-nautical-tiles",
    title: "Tuiles nautiques OpenSeaMap",
    group: "charts",
    kind: "raster",
    tiles: ["https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"],
    tileSize: 256,
    attribution: "© OpenSeaMap contributors · ODbL",
    style: { opacity: 0.95 },
  },
});
await post({
  type: "status",
  pipeline: "charts",
  phase: "enc",
  message: "Emprise ENC pilote indexée",
  progress: 0.35,
});
await post({
  type: "layer",
  pipeline: "charts",
  layer: {
    id: "charts-enc-extent",
    title: "Emprise ENC pilote",
    group: "charts",
    kind: "geojson",
    data: geojson([
      polygon([
        [8.69, 42.51], [8.83, 42.51], [8.83, 42.61],
        [8.69, 42.61], [8.69, 42.51],
      ], { cell: "NAVIMAP-DEMO-01", status: "prototype" }),
    ]),
    style: { color: "#ffd75e", fillColor: "#d7b738", opacity: 0.15, lineWidth: 2.5 },
    bounds: [8.69, 42.51, 8.83, 42.61],
  },
});
await post({
  type: "status",
  pipeline: "charts",
  phase: "bathymetry",
  message: "Courbes bathymétriques reçues",
  progress: 0.72,
});
await post({
  type: "layer",
  pipeline: "charts",
  layer: {
    id: "charts-bathymetry",
    title: "Bathymétrie · isobathes",
    group: "charts",
    kind: "geojson",
    data: geojson([
      line([[8.705, 42.55], [8.72, 42.535], [8.76, 42.53], [8.80, 42.545], [8.815, 42.565]], { depth: 5 }),
      line([[8.698, 42.542], [8.72, 42.522], [8.77, 42.518], [8.812, 42.54], [8.822, 42.58]], { depth: 10 }),
      line([[8.7, 42.59], [8.73, 42.602], [8.78, 42.604], [8.815, 42.59]], { depth: 15 }),
    ]),
    style: { color: "#48a9dc", opacity: 0.82, lineWidth: 1.7 },
  },
});
await post({
  type: "status",
  pipeline: "charts",
  phase: "ready",
  message: "Charts synchronisé · attente de Ground et Satellites",
  progress: 1,
});

console.log("Couches Charts publiées dans NaviMaps Live.");
