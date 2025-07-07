import { useState } from "react";
import { Link } from "react-router";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  FileType2, 
  Wand2,
  BookOpen,
  Briefcase,
  GraduationCap,
  Heart,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy
} from "lucide-react";
import api, { type DocumentGenerationRequest } from "~/lib/api";

import type { Route } from "./+types/document";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Document Generator - AI Assistant" },
    { name: "description", content: "Generate professional documents with AI" },
  ];
}

const DOCUMENT_TYPES = [
  {
    id: "article",
    name: "Article/Blog Post",
    icon: <BookOpen className="w-5 h-5" />,
    description: "Engaging articles and blog posts",
    placeholder: "Write an article about sustainable living practices"
  },
  {
    id: "report",
    name: "Business Report",
    icon: <Briefcase className="w-5 h-5" />,
    description: "Professional business reports",
    placeholder: "Generate a quarterly sales analysis report"
  },
  {
    id: "essay",
    name: "Academic Essay",
    icon: <GraduationCap className="w-5 h-5" />,
    description: "Well-structured academic essays",
    placeholder: "Write an essay on the impact of artificial intelligence"
  },
  {
    id: "letter",
    name: "Formal Letter",
    icon: <Heart className="w-5 h-5" />,
    description: "Professional correspondence",
    placeholder: "Write a cover letter for a software engineer position"
  },
  {
    id: "proposal",
    name: "Project Proposal",
    icon: <FileText className="w-5 h-5" />,
    description: "Detailed project proposals",
    placeholder: "Create a proposal for a mobile app development project"
  },
  {
    id: "summary",
    name: "Executive Summary",
    icon: <Sparkles className="w-5 h-5" />,
    description: "Concise executive summaries",
    placeholder: "Summarize our company's annual performance"
  }
];

const OUTPUT_FORMATS = [
  { id: "pdf", name: "PDF", ext: ".pdf", icon: <FileType2 className="w-4 h-4" /> },
  { id: "docx", name: "Word Document", ext: ".docx", icon: <FileText className="w-4 h-4" /> },
  { id: "txt", name: "Plain Text", ext: ".txt", icon: <FileType2 className="w-4 h-4" /> }
];

export default function DocumentGenerator() {
  const [selectedType, setSelectedType] = useState<"article" | "report" | "essay" | "letter" | "memo">("article");
  const [prompt, setPrompt] = useState("");
  const [outputFormat, setOutputFormat] = useState<"pdf" | "docx" | "txt">("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [generatedFilename, setGeneratedFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(500);

  const selectedDocType = DOCUMENT_TYPES.find(type => type.id === selectedType);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedContent("");
    setGeneratedDocument(null);
    
    try {
      const request: DocumentGenerationRequest = {
        prompt: prompt.trim(),
        doc_type: selectedType,
        format: outputFormat,
        model: "gemini"
      };

      const response = await api.generateDocument(request);
      
      setGeneratedDocument(response.document_data);
      setGeneratedFilename(response.filename);
      
      // If it's a text format, also set the content for preview
      if (outputFormat === "txt") {
        const decodedContent = atob(response.document_data);
        setGeneratedContent(decodedContent);
      } else {
        setGeneratedContent(`Document generated successfully as ${response.filename}`);
      }
    } catch (err) {
      console.error('Document generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadDocument = () => {
    if (!generatedDocument || !generatedFilename) return;
    
    try {
      // Convert base64 to blob
      const byteCharacters = atob(generatedDocument);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      // Determine MIME type
      const mimeTypes = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        txt: 'text/plain'
      };
      const mimeType = mimeTypes[outputFormat] || 'application/octet-stream';
      
      const blob = new Blob([byteArray], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = generatedFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document');
    }
  };

  const copyContent = async () => {
    if (generatedContent) {
      try {
        await navigator.clipboard.writeText(generatedContent);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  const getWordCountFromContent = (content: string) => {
    return content.split(/\s+/).filter(word => word.length > 0).length;
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
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">Document Generator</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered content creation</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        {/* Document Type Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Document Type</h3>
          <div className="grid grid-cols-1 gap-3">
            {DOCUMENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id as "article" | "report" | "essay" | "letter" | "memo");
                  setPrompt(type.placeholder);
                }}
                className={`p-4 rounded-xl border transition-all text-left ${
                  selectedType === type.id
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedType === type.id
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}>
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {type.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Document Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
          
          {/* Word Count */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Word Count: {wordCount}
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>100</span>
              <span>2000</span>
            </div>
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Output Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {OUTPUT_FORMATS.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setOutputFormat(format.id as "pdf" | "docx" | "txt")}
                  className={`p-3 rounded-xl text-sm transition-colors flex flex-col items-center gap-1 ${
                    outputFormat === format.id
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {format.icon}
                  {format.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Prompt */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Content Description</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={selectedDocType?.placeholder}
            rows={4}
            className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 resize-none focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Document...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Document
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-r-xl mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Generated Content */}
        {generatedContent && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Generated Document
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {outputFormat.toUpperCase()}
                </span>
                <button
                  onClick={copyContent}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            {outputFormat === "txt" ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 max-h-64 overflow-y-auto mb-4">
                <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-sans">
                  {generatedContent}
                </pre>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Document Generated Successfully
                  </span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your {selectedDocType?.name.toLowerCase()} has been generated as a {outputFormat.toUpperCase()} file.
                  {generatedFilename && ` Filename: ${generatedFilename}`}
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              {outputFormat === "txt" && (
                <button
                  onClick={copyContent}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Text
                </button>
              )}
              <button
                onClick={downloadDocument}
                disabled={!generatedDocument}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download {outputFormat.toUpperCase()}
              </button>
            </div>
          </div>
        )}

        {/* Processing indicator */}
        {isGenerating && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-r-xl">
            <div className="flex items-center">
              <Loader2 className="w-5 h-5 text-blue-400 mr-2 animate-spin" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Generating your {selectedDocType?.name.toLowerCase()} with AI...
              </p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-4 border border-orange-200 dark:border-orange-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Tips for Better Documents
          </h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>• Be specific about your topic and target audience</li>
            <li>• Include key points or requirements you want covered</li>
            <li>• Mention the tone (formal, casual, technical, etc.)</li>
            <li>• Specify any industry or domain-specific requirements</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
