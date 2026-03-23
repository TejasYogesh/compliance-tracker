import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const serverPort = Number(env.SERVER_PORT || process.env.SERVER_PORT) || 3007;
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET ||
    env.API_PROXY_TARGET ||
    `http://127.0.0.1:${serverPort}`;

  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_DEV_PORT || process.env.VITE_DEV_PORT) || 5174,
      strictPort: true,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
