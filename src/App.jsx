import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Plus,
  Zap,
  Bot,
  Settings2,
  Trash2,
  Menu,
  X,
  Sun,
  Moon,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const MODEL_OPTIONS = [
  {
    id: "Grok",
    label: "Grok-4.1",
    value: "x-ai/grok-4.1-fast",
    badge: "🧠 Reasoning",
  },
  {
    id: "glm",
    label: "GLM 4.5 Air (Free)",
    value: "z-ai/glm-4.5-air:free",
    badge: "✨ General",
  },
  {
    id: "deepseek",
    label: "DeepSeek Chat (Free)",
    value: "deepseek/deepseek-chat",
    badge: "⚡ Fast",
  },
];

// Copy button component with hover
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-slate-700/50 hover:bg-slate-600 text-slate-200 transition"
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check size={14} /> Copied!
        </>
      ) : (
        <>
          <Copy size={14} /> Copy
        </>
      )}
    </button>
  );
};

// Markdown renderer with copy button on code blocks
const MarkdownRenderer = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "");
        const text = String(children).replace(/\n$/, "");

        if (!inline && match) {
          return (
            <div className="relative group my-3 rounded-lg overflow-hidden">
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <CopyButton text={text} />
              </div>
              <SyntaxHighlighter
                language={match[1]}
                style={document.documentElement.classList.contains('dark') ? oneDark : oneLight}
                PreTag="div"
                {...props}
              >
                {text}
              </SyntaxHighlighter>
            </div>
          );
        }

        return (
          <code className="bg-slate-800/80 px-1.5 py-0.5 rounded text-[12px]">
            {children}
          </code>
        );
      },
      p({ children }) {
        return <p className="mb-1 last:mb-0 group relative">{children}</p>;
      },
      table({ children }) {
        return (
          <div className="overflow-x-auto my-3 group relative">
            <table className="w-full border-collapse border border-slate-600">
              {children}
            </table>
          </div>
        );
      },
      thead({ children }) {
        return <thead className="bg-slate-800">{children}</thead>;
      },
      th({ children }) {
        return (
          <th className="border border-slate-600 px-3 py-2 text-left text-slate-100 font-semibold">
            {children}
          </th>
        );
      },
      td({ children }) {
        return (
          <td className="border border-slate-600 px-3 py-2 text-slate-200">
            {children}
          </td>
        );
      },
      tr({ children }) {
        return (
          <tr className="hover:bg-slate-800/50 transition">{children}</tr>
        );
      },
    }}
  >
    {content}
  </ReactMarkdown>
);

export default function App() {
  const [messages, setMessages] = useState(() => {
    try {
      const s = localStorage.getItem("chat-history");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].id);

  // Theme state - only light and dark
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    return savedTheme === "light" ? "light" : "dark";
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  const currentModel = MODEL_OPTIONS.find((m) => m.id === selectedModel);

  // Apply theme on mount & when changes
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove all theme classes first
    root.classList.remove("dark", "light");
    
    if (theme === "light") {
      root.classList.add("light");
      body.style.background = "";
    } else {
      root.classList.add("dark");
      body.style.background = "";
    }
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem("chat-history", JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const streamReply = (fullText) => {
    let idx = 0;
    const id = setInterval(() => {
      setMessages((prev) => {
        const out = [...prev];
        const last = out[out.length - 1];
        if (!last || last.sender !== "ai") return prev;
        out[out.length - 1] = { ...last, text: fullText.slice(0, idx) };
        return out;
      });
      idx++;
      if (idx > fullText.length) clearInterval(id);
    }, 10);
  };

  const sendMessage = async (text) => {
    if (!text.trim() && !file) return;

    let fileContent = null;
    let fileDataUrl = null;
    
    if (file) {
      try {
        // Check if file is an image
        if (file.type.startsWith('image/')) {
          fileDataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        } else {
          fileContent = await file.text();
        }
      } catch {
        setMessages((p) => [...p, { sender: "ai", text: "File read error." }]);
        setFile(null);
        return;
      }
    }

    const userMsg = {
      sender: "user",
      text: text || (file ? `📎 ${file.name}` : ""),
      isFile: !!file,
      fileName: file?.name,
      isImage: file?.type.startsWith('image/'),
      imagePreview: fileDataUrl,
    };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setFile(null);
    setLoading(true);

    try {
      const messageContent = file
        ? file.type.startsWith('image/')
          ? `The user uploaded an image file.\n\nFile name: ${file.name}\n\nUser message: ${text || "(no extra message)"}`
          : `The user uploaded a file.\n\nFile name: ${file.name}\n\nFile content:\n${fileContent}\n\nUser message: ${text || "(no extra message)"}`
        : text;

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: currentModel.value,
          messages: [
            {
              role: "system",
              content:
                "You are a professional, concise AI assistant. Prefer clear structure, markdown formatting.",
            },
            { role: "user", content: messageContent },
          ],
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg = errJson?.error?.message || `API error ${res.status}`;
        setMessages((p) => [...p, { sender: "ai", text: `Error: ${msg}` }]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const full = data?.choices?.[0]?.message?.content || "No response.";
      setMessages((p) => [...p, { sender: "ai", text: "" }]);
      streamReply(full);
    } catch (err) {
      console.error(err);
      setMessages((p) => [
        ...p,
        {
          sender: "ai",
          text: "Error: Provider returned an error or network issue.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    try {
      localStorage.removeItem("chat-history");
    } catch {}
    setMessages([]);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`min-h-screen w-full flex flex-col ${theme === 'dark' ? 'bg-[radial-gradient(circle_at_top,_#0f1724,_#020617)]' : 'bg-[radial-gradient(circle_at_top,_#f6f8fb,_#ffffff)]'} ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* TOP NAV - Adjusts with sidebar */}
      <header className={`h-14 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between px-4 md:px-6 glass relative z-40 transition-all duration-300 ${
        sidebarOpen ? 'md:ml-80' : ''
      }`}>
        <div className="flex items-center gap-3">
          <button
            className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-white/3' : 'hover:bg-slate-200'} transition-colors`}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#0ea5e9] to-[#7c3aed] flex items-center justify-center shadow-[0_10px_30px_rgba(99,102,241,0.12)]">
            <Zap size={16} className="text-white" />
          </div>

          <div>
            <div className="text-sm font-semibold leading-tight">My AI Studio</div>
            <div className={`text-[11px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Personal Study & Dev Copilot
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full ${theme === 'dark' ? 'bg-slate-900/80 border border-slate-700/80' : 'bg-white/80 border border-slate-300/80'}`}>
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
              {currentModel?.label || "No model"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className={`text-[11px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} flex items-center gap-2`}>
              <Settings2 size={14} className="opacity-70" />
              <span>Made for Studies</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CHAT - Adjusts based on sidebar */}
      <main className={`flex-1 flex flex-col ${theme === 'dark' ? 'bg-[radial-gradient(circle_at_top,_#1f2937,_#020617)]' : 'bg-[radial-gradient(circle_at_top,_#f8fafc,_#ffffff]'} transition-all duration-300 ${
        sidebarOpen ? 'md:ml-80' : ''
      }`}>
        <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-slate-800/80 bg-slate-950/60' : 'border-slate-200/80 bg-white/60'} backdrop-blur-lg glass flex items-center justify-between`}>
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <span className="inline-flex h-5 w-5 rounded-md bg-blue-500/20 border border-blue-500/50 items-center justify-center">
                <Zap size={12} className="text-blue-300" />
              </span>
              Study & Dev AI
            </h2>
            <p className={`text-[11px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
              Ask questions, paste code, or attach files. I'll help you learn,
              debug, and build.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-slate-900/60 border border-slate-800' : 'bg-white/60 border border-slate-300'} text-xs`}>
              <span className={`text-[11px] ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Model</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className={`bg-transparent outline-none text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}
              >
                {MODEL_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={`sm:hidden flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <Smartphone size={14} /> Mobile
            </div>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md animate-fadeUp">
                <div className="text-6xl mb-3 opacity-30">✨</div>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                  Welcome to your AI workspace.
                </p>
                <p className={`text-[11px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mt-2`}>
                  Try: <span className="font-mono">"Explain backprop in simplest way"</span> or upload a note
                  and ask for a summary.
                </p>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.sender === "user" ? "justify-end" : "justify-start"
              } animate-fadeUp group`}
            >
              <div
                className={`dynamic-bubble px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.sender === "user"
                    ? "bg-blue-600/90 text-white rounded-br-none"
                    : theme === 'dark'
                    ? "bg-slate-900/80 text-slate-50 border border-slate-700/80 rounded-bl-none"
                    : "bg-white/80 text-slate-900 border border-slate-200/80 rounded-bl-none"
                }`}
              >
                {m.isFile && m.fileName && (
                  <div className={`mb-2 text-[11px] ${m.sender === 'user' ? 'text-white/80' : (theme === 'dark' ? 'text-slate-200/80' : 'text-slate-700/80')} flex items-center gap-2`}>
                    <span>📎</span>
                    <span className="truncate">{m.fileName}</span>
                  </div>
                )}
                {m.isImage && m.imagePreview && (
                  <div className="mb-2">
                    <img 
                      src={m.imagePreview} 
                      alt={m.fileName} 
                      className="max-w-full rounded-lg"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                )}
                {m.sender === "ai" ? (
                  <div className="prose prose-invert prose-sm max-w-none relative group">
                    <MarkdownRenderer content={m.text} />
                    <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={m.text} />
                    </div>
                  </div>
                ) : (
                  <p>{m.text}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className={`${theme === 'dark' ? 'bg-slate-900/80 border border-slate-700/80' : 'bg-white/80 border border-slate-200/80'} px-4 py-3 rounded-2xl rounded-bl-none dynamic-bubble`}>
                <div className="flex gap-2 items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-pulse" />
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-slate-400 animate-pulse"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-slate-500 animate-pulse"
                    style={{ animationDelay: "0.3s" }}
                  />
                  <span className={`text-[11px] ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} ml-2`}>
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Small Chat Input Button - z.ai style */}
        {messages.length === 0 && !loading && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <button
              onClick={() => document.getElementById('chat-input')?.focus()}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium"
            >
              <Send size={16} />
              <span>Start Chatting</span>
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className={`border-t ${theme === 'dark' ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/80'} backdrop-blur-xl px-4 md:px-6 py-3`}>
          {file && (
            <div className={`mb-2 flex items-center gap-3 ${theme === 'dark' ? 'bg-slate-900/80 border border-slate-700/80' : 'bg-white/80 border border-slate-200/80'} rounded-2xl px-4 py-2 text-[11px]`}>
              <span>📎</span>
              <div className="flex-1 min-w-0">
                <p className={`truncate ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{file.name}</p>
                <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                  {(file.size / 1024).toFixed(1)} KB selected
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className={`text-[11px] ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'}`}
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex gap-3 items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800' : 'bg-white/80 border border-slate-200/80 hover:bg-slate-100'} active:scale-95 transition flex items-center justify-center`}
              title="Attach file"
            >
              <Plus size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,text/*,.pdf,.doc,.docx,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.xml,.yaml,.yml,.md,.txt,.csv,.xlsx,.xls,.pptx,.ppt"
            />

            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Message your AI…"
              className={`flex-1 ${theme === 'dark' ? 'bg-slate-900/80 border border-slate-700/80 focus:border-blue-500/70 placeholder:text-slate-500' : 'bg-white/80 border border-slate-200/80 focus:border-blue-500/50 placeholder:text-slate-400'} rounded-2xl px-4 py-3 text-sm outline-none`}
            />

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() && !file}
              className="px-5 py-3 rounded-2xl bg-gradient-to-br from-[#60a5fa] to-[#7c3aed] flex items-center gap-2 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </main>

      {/* Sidebar - Fixed Position */}
      <div className={`fixed top-0 left-0 h-full w-80 ${theme === 'dark' ? 'bg-slate-950/98 border-r border-white/6' : 'bg-white/98 border-r border-slate-300/6'} transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'border-b border-white/6' : 'border-b border-slate-300/6'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#0ea5e9] to-[#7c3aed] flex items-center justify-center shadow-[0_10px_30px_rgba(99,102,241,0.12)]">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                My AI Studio
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>VisionPro Edition</div>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-white/3' : 'hover:bg-slate-200'} transition-colors`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
          <div>
            <h3 className={`text-xs uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-3`}>Models</h3>
            <div className="space-y-2">
              {MODEL_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedModel(m.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition text-sm ${
                    selectedModel === m.id
                      ? theme === 'dark' ? "bg-white/4 border border-white/8" : "bg-slate-200/50 border border-slate-300/50"
                      : theme === 'dark' ? "hover:bg-white/3" : "hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bot size={14} />
                    <span>{m.label}</span>
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{m.badge}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className={`text-xs uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-2`}>
              Session
            </h3>
            <div className={`${theme === 'dark' ? 'bg-white/2 border border-white/6' : 'bg-slate-100/50 border border-slate-300/50'} rounded-md px-3 py-2 text-sm`}>
              <div className="flex justify-between">
                <span>Messages</span>
                <span className="font-mono">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Model</span>
                <span className="font-mono">
                  {currentModel?.label || "-"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-xs uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-2`}>Theme</h3>
            <div className="space-y-2">
              {[
                { key: "dark", label: "Dark", icon: Moon },
                { key: "light", label: "Light", icon: Sun }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setTheme(key);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition text-sm ${
                    theme === key
                      ? theme === 'dark' ? "bg-white/4 border border-white/8" : "bg-slate-200/50 border border-slate-300/50"
                      : theme === 'dark' ? "hover:bg-white/3" : "hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={14} />
                    <span>{label}</span>
                  </div>
                  {theme === key && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              clearChat();
            }}
            className={`w-full px-3 py-2 rounded-md text-xs flex items-center justify-center gap-2 transition ${
              theme === 'dark' 
                ? 'text-red-400 hover:text-red-300 bg-red-500/5 border border-red-500/30' 
                : 'text-red-600 hover:text-red-500 bg-red-50/50 border border-red-200/50'
            }`}
          >
            <Trash2 size={14} /> Clear Chat
          </button>

          <div className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-2`}>
            <Settings2 size={14} /> Powered by OpenRouter
          </div>
        </div>
      </div>

      {/* Sidebar Backdrop - Only on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}