import { createApp, nextTick } from "vue";
import App from "./App.vue";
import "../style.css";
import "./legacy/installLegacy.js";
import { boot } from "./boot.js";

const CACHE_VERSION = "20260505-1";

function ensureVersionedUrl() {
  try {
    var u = new URL(window.location.href);
    if (!u.searchParams.get("v")) {
      u.searchParams.set("v", CACHE_VERSION);
      window.history.replaceState({}, "", u.toString());
    }
  } catch (e) {
    // ignore invalid URL state
  }
}

ensureVersionedUrl();

const app = createApp(App);
app.mount("#app");

nextTick(function () {
  if (window.APP && typeof window.APP.bindAppDom === "function") {
    window.APP.bindAppDom(document);
  }
  boot();
});
