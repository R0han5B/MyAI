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
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import logo from "./assets/logo.png";

const MODEL_OPTIONS = [
  {
    id: "OpenAI",
    label: "OpenAI: gpt-oss-20b (free)",
    value: "openai/gpt-oss-20b:free",
    badge: "🐍 Best overall",
  },
  {
    id: "Tongyi DeepResearch",
    label: "Tongyi DeepResearch 30B A3B (free)",
    value: "alibaba/tongyi-deepresearch-30b-a3b:free",
    badge: "🤯 Deepresearch",
  },
  {
    id: "NVIDIA",
    label: "NVIDIA Nemotron Nano 12B 2 VL",
    value: "nvidia/nemotron-nano-12b-v2-vl:free",
    badge: "😁 General",
  },
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

const MarkdownRenderer = ({ content }) => {
  // Log to see what content we're getting
  console.log("Content received:", content);
  
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
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
            <code className="bg-gray-700/80 px-1.5 py-0.5 rounded text-[12px] text-gray-100 font-mono break-words">
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0 group relative text-gray-100 break-words overflow-x-auto">{children}</p>;
        },
        a({ href, children }) {
          return (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 underline transition"
            >
              {children}
            </a>
          );
        },
        img({ src, alt }) {
          return (
            <img 
              src={src} 
              alt={alt}
              className="max-w-full rounded-lg my-2 border border-gray-600/50"
            />
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3 group relative">
              <table className="w-full border-collapse border border-gray-600">
                {children}
              </table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="bg-gray-700">{children}</thead>;
        },
        th({ children }) {
          return (
            <th className="border border-gray-600 px-3 py-2 text-left text-gray-100 font-semibold">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="border border-gray-600 px-3 py-2 text-gray-200 overflow-x-auto">
              {children}
            </td>
          );
        },
        tr({ children }) {
          return (
            <tr className="hover:bg-gray-700/50 transition">{children}</tr>
          );
        },
        h1({ children }) {
          return <h1 className="text-2xl font-bold my-2 text-gray-100">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-xl font-bold my-2 text-gray-100">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-lg font-bold my-2 text-gray-100">{children}</h3>;
        },
        pre({ children }) {
          return <pre className="bg-gray-900/50 p-3 rounded-lg my-2 overflow-x-auto text-xs whitespace-pre-wrap break-words">{children}</pre>;
        },
        br() {
          return <br className="my-1" />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].id);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [abortController, setAbortController] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const currentModel = MODEL_OPTIONS.find((m) => m.id === selectedModel);

  // Load KaTeX CSS
  useEffect(() => {
    if (!document.querySelector('link[href*="katex"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0 || loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
        setShowScrollButton(!isNearBottom && scrollHeight > clientHeight);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const newHeight = Math.min(inputRef.current.scrollHeight, 240); // 10 lines ~= 240px
      inputRef.current.style.height = `${newHeight}px`;
    }
  };

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
    setEditingIndex(null);

    if (inputRef.current) {
      inputRef.current.style.height = "44px";
    }

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const messageContent = file
        ? file.type.startsWith('image/')
          ? `The user uploaded an image file.\n\nFile name: ${file.name}\n\nUser message: ${text || "(no extra message)"}`
          : `The user uploaded a file.\n\nFile name: ${file.name}\n\nFile content:\n${fileContent}\n\nUser message: ${text || "(no extra message)"}`
        : text;

      const conversationHistory = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

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
            ...conversationHistory,
            { role: "user", content: messageContent },
          ],
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg = errJson?.error?.message || `API error ${res.status}`;
        setMessages((p) => [...p, { sender: "ai", text: `Error: ${msg}` }]);
        setLoading(false);
        setAbortController(null);
        return;
      }

      const data = await res.json();
      const full = data?.choices?.[0]?.message?.content || "No response.";
      setMessages((p) => [...p, { sender: "ai", text: "" }]);
      streamReply(full);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setMessages((p) => [
          ...p,
          {
            sender: "ai",
            text: "Error: Provider returned an error or network issue.",
          },
        ]);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
      setAbortController(null);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`min-h-screen w-full flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
      <header className={`fixed top-0 left-0 right-0 h-14 border-b ${theme === 'dark' ? 'border-orange-600/50 bg-gray-800/90' : 'border-orange-300/50 bg-gray-100/90'} flex items-center justify-between px-4 md:px-6 glass z-50`}>
        <div className="flex items-center gap-3">
          <button
            className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-white/3' : 'hover:bg-slate-200'} transition-colors`}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          <div className="w-9 h-9 rounded-md flex items-center justify-center">
            <img src={logo} alt="logo" className="w-full h-full object-contain" />
          </div>

          <div>
            <div className="text-sm font-semibold leading-tight">My AI Studio</div>
            <div className={`text-[11px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Personal Study & Dev Copilot
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80">
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

      <div className="flex flex-1 relative">
        <div className={`fixed top-14 left-0 bottom-0 w-80 ${theme === 'dark' ? 'bg-gray-800 border-r border-orange-600/40' : 'bg-gray-100 border-r border-orange-300/40'} transform transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-orange-600/30' : 'border-orange-200/30'}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md flex items-center justify-center">
                <img src={logo} alt="logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                  My AI Studio
                </div>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-white/3' : 'hover:bg-slate-200'} transition-colors`}
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-80px)]">
            <div>
              <h3 className={`text-xs uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-3`}>Models</h3>
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition text-sm ${
                    theme === 'dark' 
                      ? "bg-white/4 border border-white/8 hover:bg-white/6" 
                      : "bg-slate-200/50 border border-slate-300/50 hover:bg-slate-200/70"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Bot size={14} />
                    <span className="truncate text-left">{currentModel?.label}</span>
                  </div>
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform flex-shrink-0 ${showModelDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {showModelDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowModelDropdown(false)}
                    />
                    <div className={`absolute top-full mt-2 w-full max-h-64 overflow-y-auto rounded-md border z-50 ${
                      theme === 'dark'
                        ? 'bg-slate-900/95 border-slate-700/80'
                        : 'bg-white/95 border-slate-300/80'
                    } shadow-lg`}>
                      {MODEL_OPTIONS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedModel(m.id);
                            setShowModelDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition first:rounded-t-md last:rounded-b-md ${
                            selectedModel === m.id
                              ? theme === 'dark' 
                                ? 'bg-blue-500/20 border-l-2 border-blue-500' 
                                : 'bg-blue-100/50 border-l-2 border-blue-500'
                              : theme === 'dark' ? 'hover:bg-slate-800/80' : 'hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Bot size={14} className="flex-shrink-0" />
                            <span className="truncate text-left">{m.label}</span>
                          </div>
                          <div className={`text-xs flex-shrink-0 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            {m.badge}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${theme === 'dark' ? 'border-orange-600/40 bg-gray-800' : 'border-orange-300/40 bg-gray-100'}`}>
            <div className="space-y-3">
              <div>
                <h3 className={`text-xs uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-2`}>Theme</h3>
                <div className="relative">
                  <button
                    onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition text-sm ${
                      theme === 'dark' 
                        ? "bg-white/4 border border-white/8 hover:bg-white/6" 
                        : "bg-slate-200/50 border border-slate-300/50 hover:bg-slate-200/70"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                      <span className="truncate text-left capitalize">{theme}</span>
                    </div>
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform flex-shrink-0 ${showThemeDropdown ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {showThemeDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowThemeDropdown(false)}
                      />
                      <div className={`absolute bottom-full mb-2 w-full rounded-md border z-50 ${
                        theme === 'dark'
                          ? 'bg-slate-900/95 border-slate-700/80'
                          : 'bg-white/95 border-slate-300/80'
                      } shadow-lg`}>
                        {[
                          { key: "dark", label: "Dark", icon: Moon },
                          { key: "light", label: "Light", icon: Sun }
                        ].map(({ key, label, icon: Icon }) => (
                          <button
                            key={key}
                            onClick={() => {
                              setTheme(key);
                              setShowThemeDropdown(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition first:rounded-t-md last:rounded-b-md ${
                              theme === key
                                ? theme === 'dark' 
                                  ? 'bg-blue-500/20 border-l-2 border-blue-500' 
                                  : 'bg-blue-100/50 border-l-2 border-blue-500'
                                : theme === 'dark' ? 'hover:bg-slate-800/80' : 'hover:bg-slate-100/80'
                            }`}
                          >
                            <Icon size={14} className="flex-shrink-0" />
                            <span className="truncate text-left">{label}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <button
                onClick={clearChat}
                className={`w-full px-3 py-2 rounded-md text-xs flex items-center justify-center gap-2 transition ${
                  theme === 'dark' 
                    ? 'text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20' 
                    : 'text-red-600 hover:text-red-500 bg-red-50 border border-red-200'
                }`}
              >
                <Trash2 size={14} /> Clear Chat
              </button>
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={closeSidebar}
          />
        )}
      </div>

      <main className={`flex-1 flex flex-col pt-14 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} transition-all duration-300 ${
        sidebarOpen ? 'md:ml-80' : ''
      } ${messages.length === 0 ? 'justify-center items-center pb-0' : 'justify-start pb-32'}`}>
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4" ref={messagesContainerRef}>
          {messages.length === 0 && !loading && (
            <div className="h-full flex items-center justify-center pb-40">
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
                    ? "bg-orange-600/90 text-white rounded-br-none"
                    : theme === 'dark'
                    ? "bg-gray-700/80 text-gray-50 border border-gray-600/80 rounded-bl-none"
                    : "bg-white/80 text-gray-900 border border-gray-200/80 rounded-bl-none"
                }`}
              >
                {m.isFile && m.fileName && (
                  <div className={`mb-2 text-[11px] ${m.sender === 'user' ? 'text-white/80' : (theme === 'dark' ? 'text-gray-200/80' : 'text-gray-700/80')} flex items-center gap-2`}>
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
                  <div className="flex items-end gap-2">
                    <p className="flex-1">{m.text}</p>
                    <button
                      onClick={() => {
                        setEditingIndex(editingIndex === i ? null : i);
                        setInput(m.text);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded text-xs bg-orange-500/50 hover:bg-orange-600 text-white whitespace-nowrap"
                    >
                      Edit
                    </button>
                  </div>
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
                    Replying...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {showScrollButton && (
          <button
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="fixed bottom-40 right-6 p-3 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg transition animate-bounce z-20"
            title="Scroll to bottom"
          >
            <ChevronDown size={20} />
          </button>
        )}

        <div className={`${messages.length === 0 ? 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' : 'fixed bottom-0 left-0 right-0'} border-t ${theme === 'dark' ? 'border-orange-600/40 bg-gray-800' : 'border-orange-300/40 bg-gray-100'} backdrop-blur-xl px-4 md:px-6 py-4 transition-all duration-300 ${
          messages.length === 0 ? 'w-11/12 max-w-2xl' : sidebarOpen ? 'w-[calc(100%-320px)] md:left-80' : 'w-full md:left-0'
        }`}>
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
              className={`px-3 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 transition flex items-center justify-center gap-2 text-white text-xs`}
              title="Attach file"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,text/*,.pdf,.doc,.docx,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.xml,.yaml,.yml,.md,.txt,.csv,.xlsx,.xls,.pptx,.ppt"
            />

            <textarea
              ref={inputRef}
              id="chat-input"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Message your AI…"
              className={`flex-1 resize-none ${theme === 'dark' ? 'bg-slate-900/50 border border-white/20 focus:border-white/40 placeholder:text-slate-400 text-white' : 'bg-white/80 border border-slate-200/80 focus:border-blue-500/50 placeholder:text-slate-400'} rounded-2xl px-4 py-3 text-sm outline-none max-h-[240px] min-h-[44px]`}
              style={{ height: messages.length === 0 ? "44px" : "auto", overflow: "hidden" }}
            />

            <button
              onClick={() => {
                if (loading) {
                  stopGeneration();
                } else if (editingIndex !== null) {
                  const editedMsg = messages[editingIndex];
                  const updatedMessages = messages.slice(0, editingIndex);
                  setMessages(updatedMessages);
                  setEditingIndex(null);
                  sendMessage(input);
                } else {
                  sendMessage(input);
                }
              }}
              disabled={!loading && !input.trim() && !file}
              className={`px-5 py-3 rounded-2xl flex items-center gap-2 text-white text-sm font-medium active:scale-95 transition whitespace-nowrap ${
                loading 
                  ? 'bg-red-600 hover:bg-red-700 cursor-pointer' 
                  : 'bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <X size={16} />
                  <span className="hidden sm:inline">Stop</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span className="hidden sm:inline">{editingIndex !== null ? "Resend" : "Send"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}