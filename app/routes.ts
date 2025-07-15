import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/chat.tsx"),
  route("/health", "routes/health.tsx"),
] satisfies RouteConfig;
