import assert from "node:assert/strict";
import test from "node:test";
import { LiveState } from "../server/live-state.mjs";

const collection = {
  type: "FeatureCollection",
  features: [],
};

test("conserve la dernière couche et le statut par pipeline", () => {
  const state = new LiveState();
  const status = state.apply({
    type: "status",
    pipeline: "ground",
    phase: "georeferencing",
    message: "Calage de 8 entités",
    progress: 0.4,
  });
  const layer = state.apply({
    type: "layer",
    pipeline: "ground",
    layer: {
      id: "ground-features",
      title: "Objets Ground",
      group: "ground",
      kind: "geojson",
      data: collection,
    },
  });

  assert.equal(status.id, 1);
  assert.equal(layer.id, 2);
  assert.equal(state.snapshot().statuses[0].progress, 0.4);
  assert.equal(state.snapshot().layers[0].title, "Objets Ground");
});

test("remplace puis retire une couche par identifiant", () => {
  const state = new LiveState();
  const event = {
    type: "layer",
    pipeline: "satellites",
    layer: {
      id: "satellite-coastline",
      title: "Trait de côte",
      kind: "geojson",
      data: collection,
    },
  };
  state.apply(event);
  state.apply({ ...event, layer: { ...event.layer, title: "Trait actualisé" } });
  assert.equal(state.snapshot().layers.length, 1);
  assert.equal(state.snapshot().layers[0].title, "Trait actualisé");
  state.apply({
    type: "layer",
    pipeline: "satellites",
    action: "remove",
    layer: { id: "satellite-coastline" },
  });
  assert.equal(state.snapshot().layers.length, 0);
});

test("refuse une couche ou une progression invalide", () => {
  const state = new LiveState();
  assert.throws(
    () => state.apply({ type: "status", pipeline: "ground", message: "x", progress: 2 }),
    /progress/,
  );
  assert.throws(
    () => state.apply({
      type: "layer",
      pipeline: "ground",
      layer: { id: "../bad", title: "x", kind: "geojson", data: collection },
    }),
    /layer.id/,
  );
});
