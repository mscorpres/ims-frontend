import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": "/src",
      // find: "@",
      // replacement: path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
