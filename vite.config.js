import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import process from "node:process";

// Menyisipkan CSS utama langsung ke index.html agar tidak menjadi render-blocking request.
function inlineCriticalCss() {
  return {
    name: "inline-critical-css",
    apply: "build",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const bundle = ctx.bundle || {};
        return html.replace(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/g, (tag, file) => {
          const asset = bundle[file];
          if (asset?.type !== "asset") return tag;
          const css = String(asset.source);
          delete bundle[file];
          return `<style>${css}</style>`;
        });
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [vue(), tailwindcss(), inlineCriticalCss()],
    server: { port: Number(env.APP_PORT || env.PORT) || 3000 },
    preview: {
      host: "0.0.0.0",
      port: Number(env.APP_PORT || env.PORT) || 3000,
      allowedHosts: true,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1"
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,vue}"],
        exclude: ["src/main.js", "src/setupTests.js", "src/test-utils.js", "**/*.test.{js,jsx}", "node_modules/**", ".docs/**"],
        thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
      },
    },
  };
});