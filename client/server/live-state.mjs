const GROUPS = new Set(["charts", "ground", "satellites"]);
const KINDS = new Set(["geojson", "image", "raster", "vector"]);
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;

function requiredText(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} doit être une chaîne non vide`);
  }
  return value.trim();
}

function normalizeProgress(value) {
  if (value == null) return null;
  const progress = Number(value);
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) {
    throw new TypeError("progress doit être compris entre 0 et 1");
  }
  return progress;
}

function normalizeLayer(raw, pipeline) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new TypeError("layer doit être un objet");
  }
  const id = requiredText(raw.id, "layer.id");
  if (!ID_PATTERN.test(id)) {
    throw new TypeError("layer.id doit contenir uniquement a-z, 0-9, _ ou -");
  }
  const kind = requiredText(raw.kind, "layer.kind");
  if (!KINDS.has(kind)) throw new TypeError(`layer.kind inconnu : ${kind}`);
  const group = raw.group || pipeline;
  if (!GROUPS.has(group)) throw new TypeError(`layer.group inconnu : ${group}`);

  if (kind === "geojson" && (!raw.data || raw.data.type !== "FeatureCollection")) {
    throw new TypeError("une couche geojson exige une FeatureCollection dans layer.data");
  }
  if (kind === "image") {
    if (typeof raw.url !== "string" || !Array.isArray(raw.coordinates) || raw.coordinates.length !== 4) {
      throw new TypeError("une couche image exige layer.url et quatre coordonnées");
    }
  }
  if ((kind === "raster" || kind === "vector") && !raw.url && !Array.isArray(raw.tiles)) {
    throw new TypeError(`une couche ${kind} exige layer.url ou layer.tiles`);
  }

  return {
    ...raw,
    id,
    title: requiredText(raw.title || id, "layer.title"),
    kind,
    group,
    visible: raw.visible !== false,
    style: raw.style && typeof raw.style === "object" ? raw.style : {},
  };
}

export class LiveState {
  constructor({ activityLimit = 40 } = {}) {
    this.activityLimit = activityLimit;
    this.seq = 0;
    this.layers = new Map();
    this.statuses = new Map();
    this.activity = [];
  }

  apply(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new TypeError("l’événement doit être un objet JSON");
    }
    const type = requiredText(raw.type, "type");
    const pipeline = requiredText(raw.pipeline || "charts", "pipeline");
    if (!GROUPS.has(pipeline)) throw new TypeError(`pipeline inconnu : ${pipeline}`);
    const base = {
      id: ++this.seq,
      type,
      pipeline,
      at: new Date().toISOString(),
    };

    if (type === "status") {
      const event = {
        ...base,
        phase: requiredText(raw.phase || "working", "phase"),
        message: requiredText(raw.message, "message"),
        progress: normalizeProgress(raw.progress),
      };
      this.statuses.set(pipeline, event);
      this.#remember(event);
      return event;
    }

    if (type === "layer") {
      const action = raw.action || "upsert";
      if (!["upsert", "remove"].includes(action)) {
        throw new TypeError(`action de couche inconnue : ${action}`);
      }
      const layerId = requiredText(raw.layer?.id, "layer.id");
      if (!ID_PATTERN.test(layerId)) throw new TypeError("layer.id invalide");
      if (action === "remove") {
        this.layers.delete(layerId);
        const event = { ...base, action, layer: { id: layerId } };
        this.#remember(event);
        return event;
      }
      const layer = normalizeLayer(raw.layer, pipeline);
      const event = { ...base, action, layer: { ...layer, updatedAt: base.at } };
      this.layers.set(layer.id, event.layer);
      this.#remember(event);
      return event;
    }

    if (type === "reset") {
      this.layers.clear();
      this.statuses.clear();
      const event = { ...base };
      this.activity = [];
      this.#remember(event);
      return event;
    }

    throw new TypeError(`type d’événement inconnu : ${type}`);
  }

  snapshot() {
    return {
      seq: this.seq,
      layers: [...this.layers.values()],
      statuses: [...this.statuses.values()],
      activity: [...this.activity],
    };
  }

  #remember(event) {
    this.activity.unshift(event);
    this.activity.length = Math.min(this.activity.length, this.activityLimit);
  }
}
