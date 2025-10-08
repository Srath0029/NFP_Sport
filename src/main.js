import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { initAuth } from "./composables/auth";






import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

import $ from "jquery";
import dt from "datatables.net-bs5";
dt(window, $);

(async () => {
  await initAuth();
  createApp(App).use(router).mount("#app");
})();

