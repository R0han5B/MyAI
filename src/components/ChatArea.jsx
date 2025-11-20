import React, { useEffect, useRef, useState } from "react";
import { Send, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function ChatArea({ currentModelValue }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const endRef = useRef(null);

  useEffect(()=> endRef.current?.scrollIntoView({behavior:"smooth"}), [messages, loading]);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const send = async (txt) => {
    if (!txt.trim() && !file) return;
    
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
      } catch (err) {
        setMessages(prev=>[...prev, { sender:"ai", text:"⚠️ File read error." }]);
        return;
      }
    }
    
    const userMsg = { 
      sender: "user", 
      text: txt || (file? `📎 ${file.name}` : ""), 
      isFile: !!file, 
      fileName: file?.name,
      isImage: file?.type.startsWith('image/'),
      imagePreview: fileDataUrl,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput(""); 
    setFile(null); 
    setLoading(true);

    try {
      const prompt = file
        ? file.type.startsWith('image/')
          ? `The user uploaded an image file.\n\nFile name: ${file.name}\n\nUser message: ${txt || "(no extra message)"}`
          : `File: ${file.name}\n\n${fileContent}\n\nUser: ${txt}`
        : txt;

      // call serverless route (safer for keys). If you prefer direct call, replace with your OpenRouter fetch.
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ model: currentModelValue, prompt })
      });
      const data = await res.json();
      const aiResp = data?.answer || "No response";
      setMessages(prev => [...prev, { sender:"ai", text: aiResp }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender:"ai", text: "Error: API failed." }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (content) => (
    <ReactMarkdown components={{
      code({ inline, className, children }) {
        const m = /language-(\w+)/.exec(className || "");
        return !inline && m ? <SyntaxHighlighter language={m[1]} style={oneDark} PreTag="div">{String(children).replace(/\n$/,"")}</SyntaxHighlighter>
                             : <code className="bg-white/5 px-1 py-0.5 rounded text-sm">{children}</code>;
      }
    }}>{content}</ReactMarkdown>
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="px-6 py-6 border-b border-white/4 glass">
        <h2 className="text-lg font-semibold flex items-center gap-3"><span className="inline-flex h-6 w-6 rounded-md bg-gradient-to-br from-[#60a5fa] to-[#7c3aed] items-center justify-center text-white">⚡</span> Study & Dev AI</h2>
        <p className="text-xs text-slate-300 mt-1">Ask questions, paste code, or attach files. I'll help you learn, debug & build.</p>
      </div>

      <div className={`flex-1 overflow-y-auto px-6 py-8 space-y-6 ${messages.length === 0 && !loading ? 'flex items-center justify-center' : ''}`}>
        {messages.length === 0 && !loading && (
          <div className="text-center text-slate-400">
            <div className="text-6xl mb-3 opacity-30">✨</div>
            <div className="text-sm">Welcome to your AI workspace.</div>
          </div>
        )}

        {messages.map((m,i)=>(
          <div key={i} className={`flex ${m.sender==="user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-2xl px-5 py-4 text-sm ${m.sender==="user" ? "user-bubble" : "ai-bubble"}`}>
              {m.isFile && m.fileName && <div className="mb-2 text-xs opacity-80">📎 {m.fileName}</div>}
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
              {m.sender==="ai" ? renderMarkdown(m.text) : <div>{m.text}</div>}
            </div>
          </div>
        ))}

        {loading && <div className="text-slate-400">Thinking...</div>}
        <div ref={endRef} />
      </div>

      <div className={`border-t border-white/6 p-4 glass ${messages.length === 0 && !loading ? 'absolute inset-x-0 top-1/2 -translate-y-1/2 max-w-2xl mx-auto' : ''}`}>
        {file && <div className="mb-3 flex items-center gap-3 bg-white/3 p-3 rounded-md"><span>📎</span><div className="flex-1"><div className="truncate">{file.name}</div><div className="text-xs text-slate-300">{(file.size/1024).toFixed(1)} KB</div></div><button onClick={()=>setFile(null)} className="text-xs text-slate-200">Remove</button></div>}
        <div className="flex gap-3">
          <button onClick={()=> fileRef.current?.click()} className="p-3 rounded-lg glass"><Plus size={18}/></button>
          <input type="file" ref={fileRef} onChange={handleFile} className="hidden" accept="image/*,text/*,.pdf,.doc,.docx,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.xml,.yaml,.yml,.md,.txt" />
          <textarea 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            onKeyDown={e=>{
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }} 
            placeholder="Message your AI…" 
            rows={messages.length === 0 && !loading ? 8 : 3}
            className="flex-1 rounded-xl px-4 py-3 bg-white/3 placeholder:text-slate-400 outline-none resize-none"
            style={{ minHeight: messages.length === 0 && !loading ? '200px' : 'auto' }}
          />
          <button onClick={()=>send(input)} className="px-5 py-3 rounded-xl bg-gradient-to-br from-[#60a5fa] to-[#7c3aed] flex items-center gap-2 text-white"><Send size={16}/> <span className="hidden sm:inline">Send</span></button>
        </div>
      </div>
    </div>
  );
}