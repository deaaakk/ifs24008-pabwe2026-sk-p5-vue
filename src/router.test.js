import { describe, it, expect, beforeEach } from "vitest";
import { createMemoryHistory } from "vue-router";
import router, { createAppRouter, routes } from "./router";
import { putAccessToken } from "./helpers/apiHelper";

const flatten = (list) => list.flatMap((r) => [r, ...(r.children ? flatten(r.children) : [])]);

describe("router", () => {
  beforeEach(() => localStorage.clear());

  it("tamu diarahkan ke login", async () => {
    const r = createAppRouter(createMemoryHistory());
    await r.push("/");
    expect(r.currentRoute.value.path).toBe("/auth/login");
  });

  it("user login diarahkan keluar dari halaman auth", async () => {
    putAccessToken("t");
    const r = createAppRouter(createMemoryHistory());
    await r.push("/auth/login");
    expect(r.currentRoute.value.path).toBe("/");
  });

  it("/auth diarahkan ke /auth/login dan rute tak dikenal ke 404", async () => {
    const r = createAppRouter(createMemoryHistory());
    await r.push("/auth");
    expect(r.currentRoute.value.path).toBe("/auth/login");
    await r.push("/tidak-ada");
    expect(r.currentRoute.value.matched.length).toBe(1);
    expect(router).toBeDefined();
  });

  it("semua komponen rute dapat dimuat (lazy import)", async () => {
    for (const route of flatten(routes)) {
      if (typeof route.component === "function") {
        expect((await route.component()).default).toBeDefined();
      }
    }
  });
});