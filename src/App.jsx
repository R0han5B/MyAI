import { useState, useRef, useEffect } from "react";
import { Send, Plus, Zap, Bot, Settings2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

// --- MODELS CONFIG ---
const MODEL_OPTIONS = [
  {
    id: "sherlock",
    label: "Sherlock Think Alpha",
    value: "openrouter/sherlock-think-alpha",
    badge: "🧠 Reasoning",
  },
  {
    id: "glm",
    label: "GLM 4.5 Air (Free)",
    value: "z-ai/glm-4.5-air:free",
    badge: "✨ General",
  },
  {
    id: "qwenCoder",
    label: "Qwen 2.5 Coder (Free)",
    value: "qwen/qwen-2.5-coder:free",
    badge: "💻 Coding",
  },
  {
    id: "deepseek",
    label: "DeepSeek Chat (Free)",
    value: "deepseek/deepseek-chat",
    badge: "⚡ Fast",
  },
];

export default function App() {
  // restore chat from localStorage
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat-history");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].id);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentModel = MODEL_OPTIONS.find((m) => m.id === selectedModel);

  // persist history
  useEffect(() => {
    localStorage.setItem("chat-history", JSON.stringify(messages));
  }, [messages]);

  // auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  // simple typewriter animation for assistant message
  const streamReply = (fullText) => {
    let index = 0;
    const interval = setInterval(() => {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (!last || last.sender !== "ai") return prev;
        updated[updated.length - 1] = { ...last, text: fullText.slice(0, index) };
        return updated;
      });
      index++;
      if (index > fullText.length) clearInterval(interval);
    }, 10);
  };

  const sendMessage = async (text) => {
    if (!text.trim() && !file) return;

    let fileContent = null;
    if (file) {
      try {
        fileContent = await file.text();
      } catch {
        setMessages((p) => [...p, { sender: "ai", text: "File read error." }]);
        return;
      }
    }

    const userMsg = {
      sender: "user",
      text: text || (file ? `📎 ${file.name}` : ""),
      isFile: !!file,
      fileName: file?.name,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setFile(null);
    setLoading(true);

    try {
      const messageContent = file
        ? `The user uploaded a file.\n\nFile name: ${file.name}\n\nFile content:\n${fileContent}\n\nUser message: ${
            text || "(no extra message)"
          }`
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
                "You are a professional, concise AI assistant. Prefer clear structure, markdown formatting, and high-quality explanations.",
            },
            { role: "user", content: messageContent },
          ],
        }),
      });

      const data = await res.json();
      const full = data?.choices?.[0]?.message?.content || "No response.";

      // add empty ai message, then animate it in
      setMessages((prev) => [...prev, { sender: "ai", text: "" }]);
      streamReply(full);
    } catch (err) {
      console.error(err);
      setMessages((p) => [
        ...p,
        { sender: "ai", text: "Error: Provider returned an error or network issue." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    localStorage.removeItem("chat-history");
    setMessages([]);
  };

  const renderMarkdown = (content) => (
    <ReactMarkdown
      components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-slate-800/80 px-1.5 py-0.5 rounded text-[12px]">
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="mb-1 last:mb-0">{children}</p>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-50 flex flex-col">
      {/* TOP NAV / SaaS BAR */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">My AI Studio</h1>
            <p className="text-[11px] text-slate-400">
              Personal Study & Dev Copilot
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">
              {currentModel?.label || "No model"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Settings2 size={14} className="opacity-70" />
            <span>Made for Studies</span>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950/90 backdrop-blur-xl">
          <div className="px-4 py-4">
            <p className="text-[11px] font-semibold text-slate-400 tracking-[0.16em] mb-2">
              MODELS
            </p>
            <div className="space-y-2">
              {MODEL_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] transition hover:-translate-y-[1px] ${
                    selectedModel === m.id
                      ? "bg-slate-800 border border-slate-600 shadow-sm"
                      : "bg-slate-900 border border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Bot size={14} className="text-slate-200" />
                    <span className="text-slate-100">{m.label}</span>
                  </span>
                  <span className="text-[10px] text-slate-300 opacity-80">
                    {m.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 mt-2">
            <p className="text-[11px] font-semibold text-slate-400 tracking-[0.16em] mb-2">
              SESSION
            </p>
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 px-3 py-2 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Messages</span>
                <span className="font-mono text-slate-100">
                  {messages.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Model</span>
                <span className="font-mono text-slate-100">
                  {currentModel?.label || "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto px-4 pb-4">
            <button
              onClick={clearChat}
              className="w-full flex items-center justify-center gap-2 text-[11px] text-red-400 hover:text-red-300 bg-red-500/5 border border-red-500/40 rounded-xl py-2 transition"
            >
              <Trash2 size={14} />
              <span>Clear conversation</span>
            </button>
          </div>
        </aside>

        {/* MAIN / CHAT */}
        <main className="flex-1 flex flex-col bg-[radial-gradient(circle_at_top,_#1f2937,_#020617)]">
          {/* Sub-header */}
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60 backdrop-blur-lg">
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <span className="inline-flex h-5 w-5 rounded-md bg-blue-500/20 border border-blue-500/50 items-center justify-center">
                  <Zap size={12} className="text-blue-300" />
                </span>
                Study & Dev AI
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Ask questions, paste code, or attach files. I’ll help you learn,
                debug, and build.
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 && !loading && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md animate-fadeIn">
                  <div className="text-6xl mb-2 opacity-30">✨</div>
                  <p className="text-sm text-slate-200">
                    Welcome to your personal AI dashboard.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Try:{" "}
                    <span className="font-mono">
                      Explain backprop simply and then give a 10-line Python example
                    </span>
                    , or paste an error stacktrace.
                  </p>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                } animate-fadeIn`}
              >
                <div
                  className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.sender === "user"
                      ? "bg-blue-600/90 text-white rounded-br-none"
                      : "bg-slate-900/80 text-slate-50 border border-slate-700/80 rounded-bl-none"
                  }`}
                >
                  {m.isFile && m.fileName && (
                    <div className="mb-2 text-[11px] text-slate-200/80 flex items-center gap-2">
                      <span>📎</span>
                      <span className="truncate">{m.fileName}</span>
                    </div>
                  )}

                  {m.sender === "ai" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      {renderMarkdown(m.text)}
                    </div>
                  ) : (
                    <p>{m.text}</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-900/80 border border-slate-700/80 px-4 py-3 rounded-2xl rounded-bl-none">
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
                    <span className="text-[11px] text-slate-300 ml-2">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR */}
          <div className="border-t border-slate-800 bg-slate-950/80 backdrop-blur-xl px-6 py-3">
            {file && (
              <div className="mb-2 flex items-center gap-3 bg-slate-900/80 border border-slate-700/80 rounded-2xl px-4 py-2 text-[11px]">
                <span>📎</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-slate-100">{file.name}</p>
                  <p className="text-slate-400 text-[10px]">
                    {(file.size / 1024).toFixed(1)} KB selected
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-slate-400 hover:text-slate-200 text-[11px]"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="flex gap-3 items-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 active:scale-95 transition flex items-center justify-center"
                title="Attach file"
              >
                <Plus size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Message your AI…"
                className="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500/70 placeholder:text-slate-500"
              />

              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() && !file}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 transition text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
