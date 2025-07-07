import { useState } from "react";
import { Link } from "react-router";
import { 
  ArrowLeft, 
  FileType, 
  Upload, 
  Eye, 
  MessageSquare, 
  Download,
  Search,
  BarChart3,
  FileText,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy
} from "lucide-react";
import api from "~/lib/api";

import type { Route } from "./+types/pdf";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "PDF Analysis - AI Assistant" },
    { name: "description", content: "Analyze and extract insights from PDF documents" },
  ];
}

const ANALYSIS_TYPES = [
  {
    id: "summary",
    name: "Summary",
    icon: <FileText className="w-4 h-4" />,
    description: "Get a concise overview of the document"
  },
  {
    id: "qa",
    name: "Q&A",
    icon: <MessageSquare className="w-4 h-4" />,
    description: "Ask specific questions about the content"
  },
  {
    id: "insights",
    name: "Key Insights",
    icon: <Zap className="w-4 h-4" />,
    description: "Extract important points and insights"
  },
  {
    id: "data",
    name: "Data Analysis",
    icon: <BarChart3 className="w-4 h-4" />,
    description: "Analyze charts, tables, and numerical data"
  }
];

const QUICK_QUESTIONS = [
  "What is the main topic of this document?",
  "Summarize the key findings",
  "What are the main conclusions?",
  "Extract all important dates and numbers",
  "What recommendations are made?",
  "Identify any risks or concerns mentioned"
];

export default function PDFAnalysis() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisType, setAnalysisType] = useState("summary");
  const [question, setQuestion] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [documentInfo, setDocumentInfo] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setAnalysisResult("");
      setKeyPoints([]);
      setError(null);
      
      setDocumentInfo({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: "PDF Document"
      });
    } else {
      setError("Please select a valid PDF file");
    }
  };

  const handleAnalysis = async () => {
    if (!uploadedFile || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult("");
    setKeyPoints([]);
    
    try {
      // Use the specialized PDF analysis endpoint
      const response = await api.analyzePDF(uploadedFile);
      
      setAnalysisResult(response.summary);
      setKeyPoints(response.key_points);
    } catch (err) {
      console.error('PDF analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze PDF');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuestionAnalysis = async () => {
    if (!uploadedFile || !question.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult("");
    setKeyPoints([]);
    
    try {
      // Use the general document analysis with a custom prompt
      const response = await api.analyzeDocument(uploadedFile);
      
      // For Q&A, we would ideally have a specialized endpoint that takes the question
      // For now, we'll use the general analysis and show it as an answer
      setAnalysisResult(`Based on the document analysis: ${response.summary}`);
      setKeyPoints(response.key_points);
    } catch (err) {
      console.error('PDF Q&A error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze PDF');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyResult = async () => {
    if (analysisResult) {
      try {
        await navigator.clipboard.writeText(analysisResult);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  const exportAnalysis = () => {
    const content = `PDF Analysis Report\n==================\n\nDocument: ${documentInfo?.name}\nAnalysis Type: ${analysisType.toUpperCase()}\nDate: ${new Date().toLocaleDateString()}\n\n${analysisResult}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdf-analysis-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <FileType className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">PDF Analysis</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Extract insights from documents</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        {/* File Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload PDF Document
          </h3>
          
          {!uploadedFile ? (
            <label className="block">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-red-500 dark:hover:border-red-400 transition-colors cursor-pointer">
                <FileType className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Click to upload a PDF document
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Maximum file size: 50MB
                </p>
              </div>
            </label>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <FileType className="w-8 h-8 text-red-500" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {documentInfo?.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {documentInfo?.size} • PDF Document
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setDocumentInfo(null);
                  setAnalysisResult("");
                }}
                className="text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                Remove file
              </button>
            </div>
          )}
        </div>

        {uploadedFile && (
          <>
            {/* Analysis Type Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Analysis Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {ANALYSIS_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setAnalysisType(type.id)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      analysisType === type.id
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-600"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        analysisType === type.id
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}>
                        {type.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {type.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Input for Q&A */}
            {analysisType === "qa" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ask a Question</h3>
                
                {/* Quick Questions */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick questions:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {QUICK_QUESTIONS.slice(0, 3).map((q, index) => (
                      <button
                        key={index}
                        onClick={() => setQuestion(q)}
                        className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What specific question do you have about this document?"
                  rows={3}
                  className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 resize-none focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            )}

            {/* Analyze Button */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
              <button
                onClick={handleAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing PDF...
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5" />
                    Analyze Document
                  </>
                )}
              </button>
            </div>

            {/* Analysis Result */}
            {analysisResult && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Analysis Result</h3>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {analysisResult}
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => navigator.clipboard.writeText(analysisResult)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-medium transition-colors"
                  >
                    Copy Result
                  </button>
                  <button
                    onClick={exportAnalysis}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                
                {/* Continue Analysis */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <Link
                    to="/chat"
                    state={{ 
                      initialMessage: `Continue analyzing this PDF: ${documentInfo?.name}\n\nPrevious analysis:\n${analysisResult.slice(0, 200)}...`,
                      context: "pdf-analysis"
                    }}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Continue in Chat
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* Tips */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-red-200 dark:border-red-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-red-500" />
            Analysis Tips
          </h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>• Use high-quality PDFs for better text extraction</li>
            <li>• Ask specific questions for more targeted insights</li>
            <li>• Try different analysis types for comprehensive understanding</li>
            <li>• Export results for future reference and sharing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
