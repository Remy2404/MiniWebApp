import { useState } from "react";
import { Link } from "react-router";
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Upload, 
  Wand2, 
  Download, 
  Share2,
  Eye,
  Palette,
  Camera,
  Sparkles
} from "lucide-react";

import type { Route } from "./+types/image";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Image Generation - AI Assistant" },
    { name: "description", content: "Generate and analyze images with AI" },
  ];
}

const IMAGE_STYLES = [
  { id: "realistic", name: "Realistic", emoji: "📸" },
  { id: "artistic", name: "Artistic", emoji: "🎨" },
  { id: "cartoon", name: "Cartoon", emoji: "🎭" },
  { id: "anime", name: "Anime", emoji: "🌸" },
  { id: "abstract", name: "Abstract", emoji: "🌀" },
  { id: "watercolor", name: "Watercolor", emoji: "🖌️" },
];

const PROMPT_EXAMPLES = [
  "A serene mountain landscape at sunset",
  "A futuristic city with flying cars",
  "A cute robot playing with a cat",
  "Abstract art with vibrant colors",
  "A cozy coffee shop in autumn",
  "A magical forest with glowing trees"
];

export default function ImageGeneration() {
  const [mode, setMode] = useState<"generate" | "analyze">("generate");
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>("");

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    
    // Simulate image generation - In production, this would call your backend
    setTimeout(() => {
      // Using a placeholder image service for demo
      const imageUrl = `https://picsum.photos/400/400?random=${Date.now()}`;
      setGeneratedImage(imageUrl);
      setIsLoading(false);
    }, 3000);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setAnalysisResult("");
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!uploadedImage || isLoading) return;
    
    setIsLoading(true);
    
    // Simulate image analysis - In production, this would call your backend
    setTimeout(() => {
      setAnalysisResult("This is a demo analysis. In the full implementation, AI would analyze your image and provide detailed insights about its contents, objects, people, emotions, colors, composition, and more.");
      setIsLoading(false);
    }, 2000);
  };

  const downloadImage = async () => {
    if (generatedImage) {
      try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-generated-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading image:', error);
      }
    }
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
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">Image AI</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate & analyze images</p>
            </div>
          </div>
        </div>
      </header>

      {/* Mode Toggle */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-1 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setMode("generate")}
              className={`p-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                mode === "generate"
                  ? "bg-pink-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Wand2 className="w-4 h-4" />
              Generate
            </button>
            <button
              onClick={() => setMode("analyze")}
              className={`p-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                mode === "analyze"
                  ? "bg-pink-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Eye className="w-4 h-4" />
              Analyze
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 pb-6 space-y-6">
        
        {mode === "generate" ? (
          <>
            {/* Style Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Art Style
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {IMAGE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-xl text-sm transition-colors ${
                      selectedStyle === style.id
                        ? "bg-pink-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="text-lg mb-1">{style.emoji}</div>
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Examples */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Inspiration
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {PROMPT_EXAMPLES.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Describe Your Image</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                rows={4}
                className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 resize-none focus:ring-2 focus:ring-pink-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isLoading}
                className="w-full mt-4 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Image
                  </>
                )}
              </button>
            </div>

            {/* Generated Image */}
            {generatedImage && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Generated Image</h3>
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={downloadImage}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'AI Generated Image',
                          url: generatedImage
                        });
                      }
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Image Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Image
              </h3>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-pink-500 dark:hover:border-pink-400 transition-colors cursor-pointer">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Click to upload an image for AI analysis
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Supports JPG, PNG, GIF, WebP
                  </p>
                </div>
              </label>
            </div>

            {/* Uploaded Image */}
            {uploadedImage && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Image</h3>
                <div className="rounded-xl overflow-hidden mb-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-auto max-h-64 object-cover"
                  />
                </div>
                <button
                  onClick={analyzeImage}
                  disabled={isLoading}
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      Analyze Image
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Analysis Result */}
            {analysisResult && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">AI Analysis</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-gray-900 dark:text-white leading-relaxed">
                    {analysisResult}
                  </p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(analysisResult)}
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-medium transition-colors"
                >
                  Copy Analysis
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
