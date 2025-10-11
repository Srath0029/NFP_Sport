import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { initAuth } from "./composables/auth";
import './assets/global.css';






import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";






(async () => {
  await initAuth();
  createApp(App).use(router).mount("#app");
})();

