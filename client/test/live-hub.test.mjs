import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { LiveHub } from "../server/live-hub.mjs";

async function withHub(run) {
  const hub = new LiveHub({ heartbeatMs: 60_000 });
  const server = createServer(async (request, response) => {
    if (!(await hub.handle(request, response))) {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    hub.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

test("accepte un événement et l'expose dans l'état", async () => {
  await withHub(async (base) => {
    const accepted = await fetch(`${base}/api/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "status",
        pipeline: "charts",
        phase: "tiles",
        message: "Tuiles prêtes",
        progress: 0.8,
      }),
    });
    assert.equal(accepted.status, 202);
    const state = await (await fetch(`${base}/api/state`)).json();
    assert.equal(state.seq, 1);
    assert.equal(state.statuses[0].message, "Tuiles prêtes");
  });
});

test("ouvre un flux SSE avec un instantané", async () => {
  await withHub(async (base) => {
    const controller = new AbortController();
    const response = await fetch(`${base}/api/events`, { signal: controller.signal });
    assert.equal(response.headers.get("content-type"), "text/event-stream; charset=utf-8");
    const { value } = await response.body.getReader().read();
    const frame = new TextDecoder().decode(value);
    assert.match(frame, /event: snapshot/);
    assert.match(frame, /"layers":\[\]/);
    controller.abort();
  });
});

test("rejoue l'état courant comme une suite d'événements", async () => {
  const hub = new LiveHub({ heartbeatMs: 60_000 });
  hub.state.apply({
    type: "status",
    pipeline: "ground",
    phase: "complete",
    message: "Ground prêt",
    progress: 1,
  });
  hub.state.apply({
    type: "layer",
    pipeline: "ground",
    layer: {
      id: "ground-demo",
      title: "Ground",
      kind: "geojson",
      data: { type: "FeatureCollection", features: [] },
    },
  });
  assert.equal(hub.replay(5), 2);
  assert.equal(hub.state.snapshot().layers.length, 0);
  await new Promise((resolve) => setTimeout(resolve, 530));
  assert.equal(hub.state.snapshot().statuses[0].message, "Ground prêt");
  assert.equal(hub.state.snapshot().layers[0].id, "ground-demo");
  hub.close();
});
