import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [
    react(),
    {
      // preview proxies can serve stale HTML/module copies; never let them
      name: "preview-no-cache",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // force our Cache-Control even when inner middlewares set their own afterwards
          const setH = res.setHeader.bind(res);
          res.setHeader = (name, value) => (name.toLowerCase() === "cache-control" ? setH(name, "no-store") : setH(name, value));
          next();
        });
      },
    },
  ],
  base: "./",
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || "0.0.0.0",
    allowedHosts: true, // sandbox/preview + LAN dev hosts (dev server only)
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },
  build: { outDir: "dist", emptyOutDir: true },
});
