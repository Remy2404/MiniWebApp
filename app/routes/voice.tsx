import { useState, useRef } from "react";
import { Link } from "react-router";
import { 
  ArrowLeft, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw,
  Upload,
  FileAudio,
  Languages
} from "lucide-react";

import type { Route } from "./+types/voice";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Voice to Text - AI Assistant" },
    { name: "description", content: "Convert speech to text with AI transcription" },
  ];
}

type RecordingState = "idle" | "recording" | "recorded" | "processing";

const SUPPORTED_LANGUAGES = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
  { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
  { code: "fr-FR", name: "French", flag: "🇫🇷" },
  { code: "de-DE", name: "German", flag: "🇩🇪" },
  { code: "it-IT", name: "Italian", flag: "🇮🇹" },
  { code: "pt-BR", name: "Portuguese", flag: "🇧🇷" },
  { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
  { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
  { code: "zh-CN", name: "Chinese", flag: "🇨🇳" },
];

export default function VoiceToText() {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [transcription, setTranscription] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setRecordingState("recorded");
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingState("recording");
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const resetRecording = () => {
    setRecordingState("idle");
    setRecordingTime(0);
    setAudioBlob(null);
    setTranscription("");
    setIsPlaying(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const transcribeAudio = async () => {
    setRecordingState("processing");
    
    // Simulate API call - In production, this would send audio to your backend
    setTimeout(() => {
      setTranscription("This is a demo transcription. In the full implementation, your audio would be processed by the AI transcription service and the result would appear here.");
      setRecordingState("recorded");
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioBlob(file);
      setRecordingState("recorded");
      setRecordingTime(0);
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
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">Voice to Text</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered transcription</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        {/* Language Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Languages className="w-4 h-4" />
            Language
          </h3>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 dark:text-white"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Recording Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            {/* Recording Indicator */}
            <div className="mb-6">
              <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                recordingState === "recording" 
                  ? "bg-red-500 shadow-lg shadow-red-500/50 animate-pulse" 
                  : recordingState === "processing"
                  ? "bg-purple-500 animate-spin"
                  : "bg-purple-500 hover:bg-purple-600"
              }`}>
                {recordingState === "processing" ? (
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : recordingState === "recording" ? (
                  <Square className="w-12 h-12 text-white" />
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
              </div>
            </div>

            {/* Recording Time */}
            {(recordingState === "recording" || recordingTime > 0) && (
              <div className="mb-4">
                <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                  {formatTime(recordingTime)}
                </div>
                {recordingState === "recording" && (
                  <div className="text-sm text-red-500 flex items-center justify-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Recording...
                  </div>
                )}
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex justify-center gap-4">
              {recordingState === "idle" && (
                <button
                  onClick={startRecording}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Mic className="w-5 h-5" />
                  Start Recording
                </button>
              )}

              {recordingState === "recording" && (
                <button
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Square className="w-5 h-5" />
                  Stop Recording
                </button>
              )}

              {recordingState === "recorded" && (
                <>
                  <button
                    onClick={playRecording}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={transcribeAudio}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    Transcribe
                  </button>
                  
                  <button
                    onClick={resetRecording}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Status Text */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              {recordingState === "idle" && "Tap to start recording your voice"}
              {recordingState === "recording" && "Speak clearly into your microphone"}
              {recordingState === "recorded" && "Playback your recording or transcribe it"}
              {recordingState === "processing" && "AI is transcribing your voice..."}
            </p>
          </div>
        </div>

        {/* File Upload Option */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Audio File
          </h3>
          <label className="block">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors cursor-pointer">
              <FileAudio className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload an audio file
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Supports MP3, WAV, M4A, OGG
              </p>
            </div>
          </label>
        </div>

        {/* Transcription Result */}
        {transcription && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Transcription</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-gray-900 dark:text-white leading-relaxed">
                {transcription}
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigator.clipboard.writeText(transcription)}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-xl font-medium transition-colors"
              >
                Copy Text
              </button>
              <Link
                to="/chat"
                state={{ initialMessage: transcription }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-medium transition-colors text-center"
              >
                Send to Chat
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
