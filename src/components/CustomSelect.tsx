import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Search, Check } from "lucide-react";

interface CustomSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  accent?: string;
  accentAlpha?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  accent = "var(--gold)",
  accentAlpha = "rgba(201,149,58,0.08)",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.99 }}
        className="finput w-full flex items-center justify-between cursor-pointer"
        style={{
          background: "#0a0d14",
          textAlign: "left",
          borderColor: open ? accent : undefined,
          boxShadow: open ? `0 0 0 3px ${accentAlpha}` : undefined,
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        <span style={{ color: value ? "var(--text)" : "var(--dim)", fontSize: 12 }}>
          {value || placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-2"
        >
          <ChevronDown size={14} color="var(--dim)" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scaleY: 0.92 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.92 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ transformOrigin: "top", zIndex: 200 }}
            className="absolute left-0 right-0 top-full mt-1 bg-[var(--s2)] border border-[var(--br2)] rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Search bar */}
            <div className="p-2 border-b border-[var(--br)]">
              <div className="flex items-center gap-2 bg-[var(--bg)] rounded-lg px-3 py-2 border border-[var(--br)]">
                <Search size={11} color="var(--dim)" />
                <input
                  autoFocus
                  className="bg-transparent flex-1 text-[11px] text-[var(--text)] outline-none placeholder:text-[var(--dim)]"
                  placeholder="Search industries..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} className="text-[var(--dim)] hover:text-[var(--muted)] text-xs">✕</button>
                )}
              </div>
            </div>

            {/* Options list */}
            <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
              {filtered.length === 0 ? (
                <p className="text-center text-[var(--dim)] text-[11px] py-5">No match for "{query}"</p>
              ) : filtered.map(opt => {
                const selected = opt === value;
                return (
                  <motion.button
                    key={opt}
                    type="button"
                    onClick={() => { onChange(opt); setOpen(false); setQuery(""); }}
                    whileHover={{ x: 3, backgroundColor: "rgba(42,49,71,0.6)" }}
                    className="w-full text-left px-4 py-2.5 flex items-center justify-between gap-2 transition-colors"
                    style={selected
                      ? { color: accent, background: accentAlpha }
                      : { color: "var(--muted)" }}
                  >
                    <span className="text-[11px] leading-snug">{opt}</span>
                    {selected && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                        <Check size={12} color={accent} strokeWidth={2.5} />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
