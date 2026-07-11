import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { codeInspectorPlugin } from "code-inspector-plugin";

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ["dev.critical-art.arpa"],
  },
  plugins: [
    codeInspectorPlugin({
      bundler: "vite",
      hotKeys: ["altKey"],
    }),
    react(),
    {
      name: "disable-umami-in-development",

      // 只在 vite dev / npm run dev 时启用
      apply: "serve",

      transformIndexHtml(html) {
        return html.replace(
          /<script\b[^>]*src=["'][^"']*umami\.zhydada\.com[^"']*["'][^>]*>\s*<\/script>/gi,
          "",
        );
      },
    },
  ],
});
