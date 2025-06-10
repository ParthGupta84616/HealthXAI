"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Brain,
  Send,
  Upload,
  User,
  Bot,
  Zap,
  Star,
  FileText,
  Cpu,
  Command,
  Cross,
} from "lucide-react";

const modelOptions = [
  { id: "OussamaELALLAM/MedExpert", name: "Medical Expert" },
  { id: "llama3.2", name: "LLaMA 3.2" },
  { id: "deepseek-r1:8b", name: "DeepSeek R1:8B" },
  { id: "deepseek-r1:1.5b", name: "DeepSeek R1:1.5B" },
];

const MarkdownRenderer = ({ content }: { content: string }) => (
  <ReactMarkdown
    className="prose prose-slate max-w-none"
    remarkPlugins={[remarkGfm]}
    components={{
      code({ node, inline, className, children, ...props }: { node: any; inline?: boolean; className?: string; children: React.ReactNode }) {
        const match = /language-(\w+)/.exec(className || "");
        return !inline && match ? (
          <SyntaxHighlighter
            style={oneLight}
            language={match[1]}
            PreTag="div"
            className="rounded-lg bg-gray-50"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        ) : (
          <code className={`bg-blue-50 rounded px-1 ${className}`} {...props}>
            {children}
          </code>
        );
      },
    }}
  >
    {content}
  </ReactMarkdown>
);

function extractValidInformation(text) {
    // Find the position of the "<|end_of_text|>" marker
    const endOfTextIndex = text.indexOf('<|end_of_text|>');
    
    // If the marker is found, extract the content before it
    if (endOfTextIndex !== -1) {
        const validInformation = text.slice(0, endOfTextIndex).trim();

        // Optionally clean up any URLs or other unnecessary parts
        const cleanedText = validInformation.replace(/https?:\/\/[^\s]+/g, '').trim();
        
        return cleanedText;
    }

    // If the end marker is not found, return the entire content
    return text.trim();
}


function extractMessage(response) {
  console.log("Raw Response:", response);
  const responseStr =
    typeof response === "string" ? response : JSON.stringify(response);
  console.log("Formatted Response String:", responseStr);
  const cleanResponse = responseStr.replace(/<think>.*?<\/think>/g, "").trim();
  console.log("Cleaned Response:", cleanResponse);
  return cleanResponse;
}

export default function NexusAI() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(modelOptions[0].id);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      console.log("PDF file selected:", selectedFile.name);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result?.split(",")[1] || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const startChat = async (question: string) => {
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");

    try {
      const pdfBase64 = file ? await convertFileToBase64(file) : null;

      const response = await fetch("/api/ragchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          modelSelected: model,
          pdf: pdfBase64,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const { text } = result;

      setMessages((prev) => [...prev, { role: "ai", content: extractValidInformation(extractMessage(text)) }]);
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        { role: "error", content: "An error occurred while processing your request." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      startChat(input);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-gray-100 to-purple-100 text-gray-800">
      <div className="container mx-auto px-4 py-8 flex gap-6 h-screen">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-1/4 space-y-6"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-blue-100 shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-shadow">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                <Cross className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700">
                HealthXAI
              </h1>
            </motion.div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-blue-800">Select Model</label>
                <div className="relative">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-blue-50 rounded-xl border border-blue-200 p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {modelOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <Command className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-blue-800">Upload Context</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFileButtonClick}
                  className="w-full bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border border-blue-200 p-4 flex items-center justify-center gap-3 hover:from-blue-200 hover:to-purple-200 transition-all"
                >
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800">{file ? file.name : "Choose PDF"}</span>
                </motion.button>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-blue-100 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-semibold text-gray-800">Features</h2>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Advanced AI Models
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Document Analysis
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-600" />
                Real-time Processing
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Main Chat Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 bg-white/70 backdrop-blur-sm rounded-3xl border border-blue-100 flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.05)]"
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start gap-3 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-200 to-purple-200"
                        : "bg-gray-100"
                    } rounded-2xl p-4 border ${message.role === "user" ? "border-blue-200" : "border-gray-200"}`}
                  >
                    <div className={`p-2 rounded-full ${
                      message.role === "user" ? "bg-blue-300" : "bg-purple-300"
                    }`}>
                      {message.role === "user" ? (
                        <User className="w-5 h-5 text-blue-700" />
                      ) : (
                        <Bot className="w-5 h-5 text-purple-700" />
                      )}
                    </div>
                    <div className="flex-1 prose prose-slate">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <div className="flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onSubmit={handleSubmit}
            className="border-t border-blue-100 p-4 bg-blue-50/60 backdrop-blur-sm"
          >
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 bg-white/90 rounded-xl border border-blue-200 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl px-6 flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 text-white"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}