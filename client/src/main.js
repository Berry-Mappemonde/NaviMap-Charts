import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.css";
import { applyLang } from "./i18n.js";
import { bindDisclaimer } from "./disclaimer.js";
import { createMap, setPalette } from "./map.js";
import { bindLiveMap } from "./live.js";

const langSelect = document.getElementById("lang");
const palettes = document.getElementById("palettes");
const replay = document.getElementById("replay-live");
let map = null;

function bootMap() {
  if (map) return;
  document.getElementById("app").classList.add("is-ready");
  map = createMap("map");
  bindLiveMap(map);
}

applyLang(langSelect.value);
langSelect.addEventListener("change", () => applyLang(langSelect.value));

palettes.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-palette]");
  if (!btn) return;
  palettes.querySelectorAll("[data-palette]").forEach((el) => {
    el.classList.toggle("is-active", el === btn);
  });
  if (map) setPalette(map, btn.getAttribute("data-palette"));
});

if (new URLSearchParams(window.location.search).has("demo")) {
  replay.hidden = false;
  replay.addEventListener("click", async () => {
    replay.disabled = true;
    replay.textContent = "Flux en cours…";
    try {
      await fetch("/api/replay?interval=650", { method: "POST" });
    } finally {
      window.setTimeout(() => {
        replay.disabled = false;
        replay.textContent = "Rejouer l’arrivée des couches";
      }, 9_000);
    }
  });
}

bindDisclaimer({
  dialog: document.getElementById("disclaimer"),
  checkbox: document.getElementById("accept"),
  button: document.getElementById("enter"),
  onAccept: bootMap,
});
