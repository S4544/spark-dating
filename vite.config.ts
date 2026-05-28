import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

<<<<<<< HEAD
export default defineConfig({
=======
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
>>>>>>> 32f654e9db67216fc8116647f377357d85be97d1
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": "http://localhost:3000",
      "/uploads": "http://localhost:3000",
    },
<<<<<<< HEAD
=======
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
>>>>>>> 32f654e9db67216fc8116647f377357d85be97d1
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
<<<<<<< HEAD
});
=======
}));
>>>>>>> 32f654e9db67216fc8116647f377357d85be97d1
