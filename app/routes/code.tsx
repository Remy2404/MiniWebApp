import { useState } from "react";
import { Link } from "react-router";
import { 
  ArrowLeft, 
  Code, 
  Send, 
  Copy, 
  Check,
  FileCode,
  Terminal,
  Lightbulb
} from "lucide-react";

import type { Route } from "./+types/code";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Code Assistant - AI Assistant" },
    { name: "description", content: "Get help with programming and code review" },
  ];
}

const PROGRAMMING_LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby"
];

const CODE_EXAMPLES = [
  {
    title: "Debug this React component",
    description: "Help me find what's wrong with my component",
    icon: <Code className="w-4 h-4" />,
    prompt: "Can you help me debug this React component? Here's my code:\n\n```jsx\n// Paste your code here\n```"
  },
  {
    title: "Code review",
    description: "Review my code for best practices",
    icon: <FileCode className="w-4 h-4" />,
    prompt: "Please review this code and suggest improvements:\n\n```\n// Paste your code here\n```"
  },
  {
    title: "Explain algorithm",
    description: "Help me understand how this works",
    icon: <Lightbulb className="w-4 h-4" />,
    prompt: "Can you explain how this algorithm works step by step?\n\n```\n// Paste your algorithm here\n```"
  },
  {
    title: "Terminal command help",
    description: "Get help with command line tools",
    icon: <Terminal className="w-4 h-4" />,
    prompt: "I need help with terminal commands. What I'm trying to do:"
  }
];

export default function CodeAssistant() {
  const [input, setInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    // Simulate API call - In production, this would redirect to chat with the code question
    setTimeout(() => {
      setIsLoading(false);
      // In the real implementation, this would send the user to the chat with the code question pre-filled
      alert("In the full implementation, this would send your code question to the AI chat!");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link 
            to="/"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">Code Assistant</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Programming help & review</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        {/* Language Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Programming Language</h3>
          <div className="grid grid-cols-2 gap-2">
            {PROGRAMMING_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`p-2 rounded-lg text-sm transition-colors ${
                  selectedLanguage === lang
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            {CODE_EXAMPLES.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example.prompt)}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  {example.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {example.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {example.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Code Input */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Your Code Question</h3>
            {input && (
              <button
                onClick={() => handleCopy(input, 0)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {copiedIndex === 0 ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Describe your ${selectedLanguage} question or paste your code here...`}
            rows={8}
            className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 resize-none focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm"
          />
          
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {isLoading ? "Processing..." : "Get AI Help"}
          </button>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Tips for Better Results
          </h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>• Include your complete code with proper formatting</li>
            <li>• Describe what you expected vs. what's happening</li>
            <li>• Mention any error messages you're seeing</li>
            <li>• Specify the programming language and version</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
