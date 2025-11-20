import React, { useEffect, useState } from "react";

const THEMES = [
  { key: "system", label: "System" },
  { key: "dark", label: "Dark" },
  { key: "light", label: "Light" },
  { key: "amoled", label: "AMOLED" }
];

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("ui-theme") || "dark");

  useEffect(() => {
    localStorage.setItem("ui-theme", theme);
    document.documentElement.dataset.theme = theme;
    if (theme === "light") document.documentElement.classList.remove("dark");
    else document.documentElement.classList.add("dark");

    if (theme === "amoled") document.body.style.background = "#000"; else document.body.style.background = "";
  }, [theme]);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="px-3 py-1.5 rounded-full glass text-sm">Theme</button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-slate-900/95 glass border border-white/6 rounded-md p-2 z-50">
          {THEMES.map(t => (
            <button key={t.key} onClick={() => { setTheme(t.key); setOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md hover:bg-white/3 ${theme===t.key ? "bg-white/6" : ""}`}>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}