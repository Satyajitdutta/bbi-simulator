import React from "react";
import {
  Globe2, TrendingUp, Compass, Network, Link2, Building2,
  Zap, Heart, Wrench, BarChart3, Layers, Bot, Rocket,
  Landmark, Lock, FileText, DollarSign, ShieldAlert, GitBranch,
  Settings2, Brain, RefreshCw, ClipboardList, Users,
  Activity, FileCheck, Microscope, Pill, Smartphone,
  Target, LineChart, Key, Gem,
  Globe, ShieldCheck, Database, Cloud,
  Sprout, RefreshCcw, Scale, Sparkles, Mic, Users2,
  Swords, HeartHandshake, Telescope, AlertOctagon,
  LucideIcon,
} from "lucide-react";
import { CAT_META } from "../data/bbi_metadata";

const ICON_MAP: Record<string, LucideIcon> = {
  Globe2, TrendingUp, Compass, Network, Link2, Building2,
  Zap, Heart, Wrench, BarChart3, Layers, Bot, Rocket,
  Landmark, Lock, FileText, DollarSign, ShieldAlert, GitBranch,
  Settings2, Brain, RefreshCw, ClipboardList, Users,
  Activity, FileCheck, Microscope, Pill, Smartphone,
  Target, LineChart, Key, Gem,
  Globe, ShieldCheck, Database, Cloud,
  Sprout, RefreshCcw, Scale, Sparkles, Mic, Users2,
  Swords, HeartHandshake, Telescope, AlertOctagon,
};

interface CompIconProps {
  iconName: string;
  category: string;
  size?: number;
}

export default function CompIcon({ iconName, category, size = 16 }: CompIconProps) {
  const Icon = ICON_MAP[iconName] || Globe2;
  const meta = CAT_META[category] || { accent: "#c9953a", bg: "rgba(201,149,58,0.08)" };
  const accent = meta.accent;

  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);

  return (
    <div
      style={{
        width: size + 16,
        height: size + 16,
        borderRadius: 8,
        background: `linear-gradient(145deg, rgba(${r},${g},${b},0.28) 0%, rgba(${r},${g},${b},0.12) 60%, rgba(${r},${g},${b},0.22) 100%)`,
        border: `1px solid rgba(${r},${g},${b},0.35)`,
        boxShadow: `0 2px 8px rgba(${r},${g},${b},0.22), inset 0 1px 0 rgba(255,255,255,0.08)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={size} color={accent} strokeWidth={1.75} />
    </div>
  );
}
