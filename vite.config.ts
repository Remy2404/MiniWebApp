import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  
  // Securely get backend URL from environment variables
  const backendUrl = env.VITE_BACKEND_URL || env.REACT_APP_BACKEND_URL;
  
  // Default fallback for development only
  const defaultDevUrl = "http://localhost:8000";
  
  const baseUrl = mode === "production" 
    ? backendUrl 
    : (backendUrl || defaultDevUrl);

  // Only show warning in development, don't expose URLs in production logs
  if (!backendUrl && mode === "development") {
    console.warn("⚠️  Backend URL not set. Using default localhost:8000");
    console.warn("   Set VITE_BACKEND_URL environment variable for custom backend");
  }

  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
      proxy: {
        "/api": {
          target: baseUrl,
          changeOrigin: true,
          secure: mode === "production",
          // Add additional security headers
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Add security headers for API requests
              proxyReq.setHeader('X-Forwarded-For', req.socket.remoteAddress || 'unknown');
            });
          }
        },
      },
      // Additional security configurations
      host: mode === "development" ? "localhost" : false,
    },
    // Environment variable configuration
    define: {
      // Only expose safe environment variables to the client
      __DEV__: mode === "development",
    },
    // Production build optimizations
    build: {
      // Enable minification for production
      minify: mode === "production" ? "terser" : "esbuild",
      terserOptions: mode === "production" ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        mangle: {
          safari10: true,
        },
      } : undefined,
      // Increase chunk size warning limit to handle larger bundles
      chunkSizeWarningLimit: 1000,
    },
  };
});
