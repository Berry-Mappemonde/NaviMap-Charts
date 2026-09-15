import * as maplibregl from "maplibre-gl";

const GROUPS = {
  charts: { title: "Charts", color: "#e8c547" },
  ground: { title: "Ground", color: "#ff8a65" },
  satellites: { title: "Satellites", color: "#35d0ba" },
};

const safeId = (id) => `live-${id}`;
const renderIds = (id) => ["fill", "line", "point", "label", "render"].map((part) => `${safeId(id)}-${part}`);

function paint(layer, key, fallback) {
  const aliases = {
    color: ["line-color", "circle-color", "fill-color"],
    fillColor: ["fill-color"],
    opacity: ["fill-opacity", "line-opacity", "circle-opacity", "raster-opacity"],
    lineWidth: ["line-width"],
    radius: ["circle-radius"],
  };
  const style = layer.style || {};
  if (style[key] != null) return style[key];
  for (const alias of aliases[key] || []) {
    if (style[alias] != null) return style[alias];
  }
  return fallback;
}

function boundsFromGeoJSON(data) {
  const bounds = new maplibregl.LngLatBounds();
  let count = 0;
  const visit = (value) => {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && Number.isFinite(value[0]) && Number.isFinite(value[1])) {
      bounds.extend([value[0], value[1]]);
      count += 1;
      return;
    }
    value.forEach(visit);
  };
  for (const feature of data?.features || []) visit(feature.geometry?.coordinates);
  return count ? bounds : null;
}

export class LiveMap {
  constructor(map, elements) {
    this.map = map;
    this.elements = elements;
    this.layers = new Map();
    this.source = null;
    this.hasFocused = false;
    this.map.on("style.load", () => this.restore());
  }

  connect() {
    this.source?.close();
    this.source = new EventSource("/api/events");
    this.source.onopen = () => this.setConnection(true);
    this.source.onerror = () => this.setConnection(false);
    this.source.addEventListener("snapshot", (event) => this.applySnapshot(JSON.parse(event.data)));
    this.source.addEventListener("status", (event) => this.applyStatus(JSON.parse(event.data)));
    this.source.addEventListener("layer", (event) => this.applyLayer(JSON.parse(event.data)));
    this.source.addEventListener("reset", () => this.reset());
  }

  setConnection(connected) {
    this.elements.connection.classList.toggle("is-live", connected);
    this.elements.connectionText.textContent = connected ? "Flux direct connecté" : "Reconnexion au flux…";
  }

  applySnapshot(snapshot) {
    this.reset(false);
    for (const layer of snapshot.layers || []) this.layers.set(layer.id, layer);
    this.restore();
    const latest = [...(snapshot.statuses || [])].sort((a, b) => b.id - a.id)[0];
    if (latest) this.applyStatus(latest);
    this.renderActivity(snapshot.activity || []);
  }

  applyStatus(event) {
    const group = GROUPS[event.pipeline] || GROUPS.charts;
    this.elements.statusPipeline.textContent = group.title;
    this.elements.statusPipeline.style.setProperty("--pipeline-color", group.color);
    this.elements.statusMessage.textContent = event.message;
    const value = event.progress == null ? 0 : Math.round(event.progress * 100);
    this.elements.progress.value = value;
    this.elements.progress.hidden = event.progress == null;
    this.prependActivity(event);
  }

  applyLayer(event) {
    if (event.action === "remove") {
      this.removeLayer(event.layer.id);
      this.layers.delete(event.layer.id);
    } else {
      this.layers.set(event.layer.id, event.layer);
      this.install(event.layer);
      this.focus(event.layer);
    }
    this.renderControls();
    this.prependActivity(event);
  }

  install(layer) {
    if (!this.map.isStyleLoaded()) return;
    this.removeLayer(layer.id);
    const sourceId = safeId(layer.id);
    const color = GROUPS[layer.group]?.color || GROUPS.charts.color;

    if (layer.kind === "geojson") {
      this.map.addSource(sourceId, { type: "geojson", data: layer.data });
      const visibility = layer.visible === false ? "none" : "visible";
      const layout = { visibility };
      this.map.addLayer({
        id: `${sourceId}-fill`,
        type: "fill",
        source: sourceId,
        filter: ["==", ["geometry-type"], "Polygon"],
        layout,
        paint: {
          "fill-color": paint(layer, "fillColor", color),
          "fill-opacity": paint(layer, "opacity", 0.22),
          "fill-outline-color": paint(layer, "color", color),
        },
      });
      this.map.addLayer({
        id: `${sourceId}-line`,
        type: "line",
        source: sourceId,
        filter: ["==", ["geometry-type"], "LineString"],
        layout,
        paint: {
          "line-color": paint(layer, "color", color),
          "line-opacity": paint(layer, "opacity", 0.9),
          "line-width": paint(layer, "lineWidth", 2.2),
        },
      });
      this.map.addLayer({
        id: `${sourceId}-point`,
        type: "circle",
        source: sourceId,
        filter: ["==", ["geometry-type"], "Point"],
        layout,
        paint: {
          "circle-color": paint(layer, "color", color),
          "circle-opacity": paint(layer, "opacity", 0.92),
          "circle-radius": paint(layer, "radius", 4),
          "circle-stroke-color": "#071521",
          "circle-stroke-width": 1,
        },
      });
      if (layer.style?.labelProperty) {
        this.map.addLayer({
          id: `${sourceId}-label`,
          type: "symbol",
          source: sourceId,
          filter: ["==", ["geometry-type"], "Point"],
          layout: {
            visibility,
            "text-field": ["to-string", ["get", layer.style.labelProperty]],
            "text-size": 10,
            "text-offset": [0, 1.15],
          },
          paint: {
            "text-color": paint(layer, "color", color),
            "text-halo-color": "#071521",
            "text-halo-width": 1,
          },
        });
      }
    } else if (layer.kind === "image") {
      this.map.addSource(sourceId, {
        type: "image",
        url: layer.url,
        coordinates: layer.coordinates,
      });
      this.map.addLayer({
        id: `${sourceId}-render`,
        type: "raster",
        source: sourceId,
        layout: { visibility: layer.visible === false ? "none" : "visible" },
        paint: { "raster-opacity": paint(layer, "opacity", 0.72) },
      });
    } else if (layer.kind === "raster") {
      this.map.addSource(sourceId, {
        type: "raster",
        ...(layer.url ? { url: layer.url } : { tiles: layer.tiles }),
        tileSize: layer.tileSize || 256,
        attribution: layer.attribution || "",
      });
      this.map.addLayer({
        id: `${sourceId}-render`,
        type: "raster",
        source: sourceId,
        layout: { visibility: layer.visible === false ? "none" : "visible" },
        paint: { "raster-opacity": paint(layer, "opacity", 0.75) },
      });
    } else if (layer.kind === "vector" && layer.sourceLayer) {
      this.map.addSource(sourceId, {
        type: "vector",
        ...(layer.url ? { url: layer.url } : { tiles: layer.tiles }),
      });
      const type = layer.style?.type || "line";
      this.map.addLayer({
        id: `${sourceId}-render`,
        type,
        source: sourceId,
        "source-layer": layer.sourceLayer,
        layout: { visibility: layer.visible === false ? "none" : "visible" },
        paint: type === "fill"
          ? { "fill-color": paint(layer, "fillColor", color), "fill-opacity": paint(layer, "opacity", 0.25) }
          : { "line-color": paint(layer, "color", color), "line-width": paint(layer, "lineWidth", 1.5) },
      });
    }
  }

  removeLayer(id) {
    for (const renderId of renderIds(id)) {
      if (this.map.getLayer(renderId)) this.map.removeLayer(renderId);
    }
    const sourceId = safeId(id);
    if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);
  }

  restore() {
    this.renderControls();
    if (!this.map.isStyleLoaded()) return;
    for (const layer of this.layers.values()) this.install(layer);
  }

  focus(layer) {
    if (layer.focus === false || (this.hasFocused && layer.focus !== true)) return;
    let bounds = null;
    if (layer.bounds?.length === 4) {
      bounds = new maplibregl.LngLatBounds(
        [layer.bounds[0], layer.bounds[1]],
        [layer.bounds[2], layer.bounds[3]],
      );
    } else if (layer.kind === "image") {
      bounds = new maplibregl.LngLatBounds();
      layer.coordinates.forEach((coordinate) => bounds.extend(coordinate));
    } else if (layer.kind === "geojson") {
      bounds = boundsFromGeoJSON(layer.data);
    }
    if (bounds && !bounds.isEmpty()) {
      this.map.fitBounds(bounds, { padding: 80, maxZoom: 12, duration: 1000 });
      this.hasFocused = true;
    }
  }

  toggle(id, visible) {
    const layer = this.layers.get(id);
    if (!layer) return;
    layer.visible = visible;
    for (const renderId of renderIds(id)) {
      if (this.map.getLayer(renderId)) {
        this.map.setLayoutProperty(renderId, "visibility", visible ? "visible" : "none");
      }
    }
  }

  renderControls() {
    const root = this.elements.layers;
    root.replaceChildren();
    for (const [groupId, group] of Object.entries(GROUPS)) {
      const layers = [...this.layers.values()].filter((layer) => layer.group === groupId);
      const section = document.createElement("section");
      section.className = "layer-group";
      const heading = document.createElement("h3");
      heading.innerHTML = `<span style="--layer-color:${group.color}"></span>${group.title}`;
      section.append(heading);
      if (!layers.length) {
        const empty = document.createElement("p");
        empty.className = "layer-empty";
        empty.textContent = "En attente…";
        section.append(empty);
      }
      for (const layer of layers) {
        const label = document.createElement("label");
        label.className = "layer-toggle";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = layer.visible !== false;
        input.addEventListener("change", () => this.toggle(layer.id, input.checked));
        const title = document.createElement("span");
        title.textContent = layer.title;
        label.append(input, title);
        section.append(label);
      }
      root.append(section);
    }
  }

  renderActivity(activity) {
    this.elements.activity.replaceChildren();
    [...activity].reverse().forEach((event) => this.prependActivity(event));
  }

  prependActivity(event) {
    const item = document.createElement("li");
    const group = GROUPS[event.pipeline] || GROUPS.charts;
    const message = event.type === "layer"
      ? `${event.action === "remove" ? "Retiré" : "Arrivé"} · ${event.layer.title || event.layer.id}`
      : event.message;
    item.innerHTML = `<span style="--activity-color:${group.color}"></span>`;
    item.append(document.createTextNode(message));
    this.elements.activity.prepend(item);
    while (this.elements.activity.children.length > 8) this.elements.activity.lastElementChild.remove();
  }

  reset(render = true) {
    for (const id of this.layers.keys()) this.removeLayer(id);
    this.layers.clear();
    this.hasFocused = false;
    if (render) {
      this.renderControls();
      this.elements.activity.replaceChildren();
    }
  }
}

export function bindLiveMap(map) {
  const live = new LiveMap(map, {
    connection: document.getElementById("connection"),
    connectionText: document.getElementById("connection-text"),
    statusPipeline: document.getElementById("status-pipeline"),
    statusMessage: document.getElementById("status-message"),
    progress: document.getElementById("status-progress"),
    layers: document.getElementById("live-layers"),
    activity: document.getElementById("activity"),
  });
  live.connect();
  return live;
}
