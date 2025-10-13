// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { initAuth } from "./composables/auth";
import 'mapbox-gl/dist/mapbox-gl.css';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// optional: comment out if you added it earlier and prefer not to use it
// import "./assets/global.css";

(async () => {
  try {
    await initAuth();
  } catch (e) {
    console.error("[initAuth] failed, mounting anyway:", e);
  }
  const app = createApp(App);
  app.use(router);
  app.mount("#app");
})();
