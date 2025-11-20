import React from "react";
import { Bot, Settings2, Trash2 } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

/* example models can be the same as before */
const MODELS = [
  { id: "sherlock", label: "Sherlock Think Alpha", badge: "🧠" },
  { id: "glm", label: "GLM 4.5 Air (Free)", badge: "✨" },
  { id: "qwen", label: "Qwen 2.5 Coder (Free)", badge: "💻" },
  { id: "deepseek", label: "DeepSeek Chat (Free)", badge: "⚡" },
];

export default function Sidebar({ selectedModel, setSelectedModel, onClear, isOpen }) {
  return (
    <aside className={`${isOpen ? 'flex' : 'hidden'} md:flex w-72 flex-col glass border-r border-white/6`}>
      <div className="px-4 py-4 border-b border-white/4 flex items-center gap-3">
        <img src="/mnt/data/cd83f518-fe03-46b5-9e4c-ae72fba84153.png" alt="preview" className="w-9 h-9 rounded-md object-cover shadow-md" />
        <div>
          <div className="text-xs font-semibold text-slate-100">My AI Studio</div>
          <div className="text-[11px] text-slate-400">VisionPro Edition</div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 overflow-auto flex-1">
        <div>
          <div className="text-xs uppercase text-slate-400 mb-3">Models</div>
          <div className="space-y-2">
            {MODELS.map(m => (
              <button key={m.id} onClick={() => setSelectedModel(m.id)} className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition text-sm ${selectedModel===m.id ? "bg-white/4 border border-white/8" : "hover:bg-white/3"}`}>
                <div className="flex items-center gap-2"><Bot size={14}/> <span>{m.label}</span></div>
                <div className="text-xs text-slate-300">{m.badge}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase text-slate-400 mb-2">Session</div>
          <div className="bg-white/2 border border-white/6 rounded-md px-3 py-2 text-sm">
            <div className="flex justify-between"><span>Messages</span><span className="font-mono">0</span></div>
            <div className="flex justify-between"><span>Model</span><span className="font-mono">{selectedModel}</span></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-t border-white/6 flex items-center justify-between">
        <div className="text-xs text-slate-300 flex items-center gap-2"><Settings2 size={14} /> Powered by OpenRouter</div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <button onClick={onClear} className="text-red-400 hover:text-red-300 px-2 py-1 rounded-md"><Trash2 size={14}/></button>
        </div>
      </div>
    </aside>
  );
}