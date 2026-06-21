import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  bgColor?: string;
  iconColor?: string;
  id?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  bgColor = "bg-white",
  iconColor = "text-zinc-600",
  id
}: MetricCardProps) {
  return (
    <div id={id} className={`p-6 bg-white border border-zinc-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{title}</p>
          <h3 className="text-3xl font-bold font-sans tracking-tight text-zinc-900 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${bgColor} ${iconColor} flex items-center justify-center`}>
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>
      </div>
      {subtitle && (
        <span className="text-[11px] font-mono text-zinc-400 mt-4 block border-t border-zinc-50 pt-2.5">
          {subtitle}
        </span>
      )}
    </div>
  );
}
