import React from "react";
import { Zap, Menu, X } from "lucide-react";

export default function Header({ onOpenMobileSidebar, selectedModelLabel, onToggleSidebar, sidebarOpen }) {
  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 glass glow">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded-md hover:bg-white/3" onClick={onOpenMobileSidebar}>
          <Menu size={18} />
        </button>
        
        <button className="hidden md:block p-2 rounded-md hover:bg-white/3" onClick={onToggleSidebar}>
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#0ea5e9] to-[#7c3aed] flex items-center justify-center shadow-[0_10px_30px_rgba(99,102,241,0.12)]">
            <Zap size={16} className="text-white"/>
          </div>
          <div>
            <div className="text-sm font-semibold">My AI Studio</div>
            <div className="text-[11px] text-slate-300">Personal Study & Dev Copilot</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3 px-3 py-1 rounded-full bg-white/3 border border-white/6 text-xs">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 mr-2" />
          <span className="text-slate-200">{selectedModelLabel}</span>
        </div>
        <div className="text-xs text-slate-300 hidden sm:block">Made for Studies</div>
      </div>
    </header>
  );
}