import { createApp, nextTick } from "vue";
import App from "./App.vue";
import "../style.css";
import "./legacy/installLegacy.js";
import { boot } from "./boot.js";

const app = createApp(App);
app.mount("#app");

nextTick(function () {
  if (window.APP && typeof window.APP.bindAppDom === "function") {
    window.APP.bindAppDom(document);
  }
  boot();
});
