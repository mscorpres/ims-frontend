import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(),
    sentryVitePlugin({
      org: "mscorpres-automation-pvt-ltd",
      project: "oakter",
      authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
    }),],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
  },
  server: {
    port: 3000,
    host: true,
  },
});
