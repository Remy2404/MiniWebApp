import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("chat", "routes/chat.tsx"),
  route("code", "routes/code.tsx"),
  route("voice", "routes/voice.tsx"),
  route("image", "routes/image.tsx"),
  route("document", "routes/document.tsx"),
  route("pdf", "routes/pdf.tsx"),
] satisfies RouteConfig;
