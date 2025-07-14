import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const baseUrl =
    mode === "production"
      ? env.PRODUCTION?.replace(/['"]/g, "")
      : env.DEVELOPMENT?.replace(/['"]/g, "");

  if (!baseUrl) {
    throw new Error(
      `Base URL is not defined for mode "${mode}". Please set the appropriate environment variable.`
    );
  }

  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
      proxy: {
        "/api": {
          target: baseUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
