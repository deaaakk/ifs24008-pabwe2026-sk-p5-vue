import { h } from "vue";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import { routes } from "./router";

export function createMockPinia() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

/** Komponen sederhana untuk menggantikan halaman pada rute pengujian. */
export const stubPage = (text = "stub") => ({ render: () => h("div", text) });

export async function renderWithProviders(
  component,
  { props = {}, route = "/", pinia = createMockPinia(), global = {}, routes: customRoutes = routes } = {}
) {
  const router = createRouter({ history: createMemoryHistory(), routes: customRoutes });
  router.push(route);
  await router.isReady();
  const wrapper = mount(component, { props, global: { plugins: [pinia, router], ...global } });
  return { wrapper, router, pinia };
}