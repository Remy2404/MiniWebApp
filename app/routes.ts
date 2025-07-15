import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/chat.tsx"),
  route("/chat-enhanced", "routes/chat_enhanced.tsx"),
  route("/chat-modular", "routes/chat_modular.tsx"),
  route("/chat-new", "routes/chat_new.tsx"),
  route("/dashboard", "routes/dashboard.tsx"),
  route("/health", "routes/health.tsx"),
] satisfies RouteConfig;
