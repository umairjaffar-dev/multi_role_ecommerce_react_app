import { fileURLToPath, URL } from "node:url";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // React Compiler auto-memoizes components, so manual useMemo/useCallback is rarely needed.
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Separate long-lived vendor chunks: deploying app code doesn't bust the cached libraries.
        codeSplitting: {
          groups: [
            { name: "vendor-react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: "vendor-router", test: /node_modules[\\/]react-router[\\/]/ },
            { name: "vendor-query", test: /node_modules[\\/]@tanstack[\\/]/ },
            { name: "vendor-zod", test: /node_modules[\\/]zod[\\/]/ },
            // Only the camera pages import hls.js (dynamically), so keep it out of the shared
            // vendor chunk that every page downloads.
            { name: "vendor-hls", test: /node_modules[\\/]hls\.js[\\/]/ },
            { name: "vendor", test: /node_modules[\\/]/ },
          ],
        },
      },
    },
  },
  server: {
    port: 5173,
    // Proxy API calls to the backend so the refresh-token cookie stays same-origin in development.
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
