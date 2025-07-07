import { Link } from "react-router";
import { 
  MessageCircle, 
  Code, 
  Mic, 
  Image, 
  FileText, 
  FileType,
  Bot,
  Sparkles
} from "lucide-react";

import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Assistant - Telegram Mini App" },
    { name: "description", content: "Your intelligent AI assistant for chat, code, voice, images, and documents" },
  ];
}

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
}

const features: FeatureCard[] = [
  {
    title: "General Chat",
    description: "Intelligent conversations and Q&A",
    icon: <MessageCircle className="w-6 h-6" />,
    href: "/chat",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    title: "Code Assistant",
    description: "Programming help and code review",
    icon: <Code className="w-6 h-6" />,
    href: "/code",
    gradient: "from-green-500 to-green-600"
  },
  {
    title: "Voice to Text",
    description: "Convert speech to text instantly",
    icon: <Mic className="w-6 h-6" />,
    href: "/voice",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    title: "Image Generation",
    description: "Create and analyze images with AI",
    icon: <Image className="w-6 h-6" />,
    href: "/image",
    gradient: "from-pink-500 to-pink-600"
  },
  {
    title: "Document Generator",
    description: "AI-powered document creation",
    icon: <FileText className="w-6 h-6" />,
    href: "/document",
    gradient: "from-orange-500 to-orange-600"
  },
  {
    title: "PDF Analysis",
    description: "Extract insights from PDF files",
    icon: <FileType className="w-6 h-6" />,
    href: "/pdf",
    gradient: "from-red-500 to-red-600"
  },
];

export default function Dashboard() {
  // For development, we'll use a placeholder name
  // In production, this would be retrieved from Telegram WebApp API
  const firstName = "User";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Assistant
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {firstName}!
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-yellow-500 ml-auto" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Choose Your AI Tool
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Select a feature to get started with AI assistance
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature) => (
              <Link
                key={feature.href}
                to={feature.href}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                <div className="relative p-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-center">
              Quick Start
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/chat"
                className="flex items-center gap-2 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Start Chat</span>
              </Link>
              <Link
                to="/voice"
                className="flex items-center gap-2 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                <Mic className="w-4 h-4" />
                <span className="text-sm font-medium">Voice Note</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto px-4 py-6 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Powered by advanced AI • Made with ❤️ for Telegram
        </p>
      </footer>
    </div>
  );
}
