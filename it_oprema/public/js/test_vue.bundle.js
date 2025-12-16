import { createApp } from "vue";
import TestVue from "./TestVue.vue";

export function setup_vue(wrapper) {
  const app = createApp(TestVue);
  app.mount(wrapper.get(0));
  return app;
}

frappe.ui.setup_vue = setup_vue;
