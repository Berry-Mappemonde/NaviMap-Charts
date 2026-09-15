import { LiveState } from "./live-state.mjs";

const JSON_LIMIT = 12 * 1024 * 1024;

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
  });
  response.end(body);
}

async function readJson(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > JSON_LIMIT) {
      const error = new Error("corps JSON trop volumineux");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("JSON invalide");
    error.status = 400;
    throw error;
  }
}

function writeSse(response, event, payload, id = null) {
  if (id != null) response.write(`id: ${id}\n`);
  response.write(`event: ${event}\n`);
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export class LiveHub {
  constructor({ state = new LiveState(), heartbeatMs = 15_000 } = {}) {
    this.state = state;
    this.clients = new Set();
    this.replayTimers = new Set();
    this.heartbeat = setInterval(() => {
      for (const client of this.clients) client.write(": heartbeat\n\n");
    }, heartbeatMs);
    this.heartbeat.unref?.();
  }

  async handle(request, response) {
    const url = new URL(request.url, "http://localhost");
    if (!url.pathname.startsWith("/api/")) return false;

    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "content-type",
      });
      response.end();
      return true;
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        clients: this.clients.size,
        seq: this.state.seq,
      });
      return true;
    }

    if (request.method === "GET" && url.pathname === "/api/state") {
      sendJson(response, 200, this.state.snapshot());
      return true;
    }

    if (request.method === "GET" && url.pathname === "/api/events") {
      response.writeHead(200, {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
        "x-accel-buffering": "no",
        "access-control-allow-origin": "*",
      });
      response.flushHeaders?.();
      writeSse(response, "snapshot", this.state.snapshot(), this.state.seq);
      this.clients.add(response);
      request.on("close", () => this.clients.delete(response));
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/events") {
      try {
        const event = this.state.apply(await readJson(request));
        this.broadcast(event);
        sendJson(response, 202, { accepted: true, id: event.id });
      } catch (error) {
        sendJson(response, error.status || 422, { accepted: false, error: error.message });
      }
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/reset") {
      const event = this.state.apply({ type: "reset", pipeline: "charts" });
      this.broadcast(event);
      sendJson(response, 202, { accepted: true, id: event.id });
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/replay") {
      const requested = Number(url.searchParams.get("interval") || 650);
      const interval = Math.max(200, Math.min(3_000, Number.isFinite(requested) ? requested : 650));
      const count = this.replay(interval);
      sendJson(response, 202, { accepted: true, events: count, interval });
      return true;
    }

    sendJson(response, 404, { error: "route API inconnue" });
    return true;
  }

  broadcast(event) {
    for (const client of this.clients) writeSse(client, event.type, event, event.id);
  }

  replay(interval) {
    for (const timer of this.replayTimers) clearTimeout(timer);
    this.replayTimers.clear();
    const snapshot = this.state.snapshot();
    const queue = [];
    for (const pipeline of ["charts", "ground", "satellites"]) {
      const status = snapshot.statuses.find((item) => item.pipeline === pipeline);
      if (status) {
        queue.push({
          type: "status",
          pipeline,
          phase: status.phase,
          message: status.message,
          progress: status.progress,
        });
      }
      for (const layer of snapshot.layers.filter((item) => item.group === pipeline)) {
        queue.push({ type: "layer", action: "upsert", pipeline, layer });
      }
    }
    const reset = this.state.apply({ type: "reset", pipeline: "charts" });
    this.broadcast(reset);
    queue.forEach((raw, index) => {
      const timer = setTimeout(() => {
        this.replayTimers.delete(timer);
        const event = this.state.apply(raw);
        this.broadcast(event);
      }, 500 + index * interval);
      this.replayTimers.add(timer);
    });
    return queue.length;
  }

  close() {
    clearInterval(this.heartbeat);
    for (const timer of this.replayTimers) clearTimeout(timer);
    this.replayTimers.clear();
    for (const client of this.clients) client.end();
    this.clients.clear();
  }
}
