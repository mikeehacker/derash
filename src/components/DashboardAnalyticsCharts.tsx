import React from "react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart,
  Area
} from "recharts";
import { AnalyticsResponse } from "../types";
import { CreditCard, TrendingUp } from "lucide-react";
import { Language, translations } from "../utils/translations";

interface DashboardAnalyticsChartsProps {
  data: AnalyticsResponse | null;
  loading?: boolean;
  lang: Language;
}

export default function DashboardAnalyticsCharts({ data, loading = false, lang }: DashboardAnalyticsChartsProps) {
  const t = translations[lang];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 bg-zinc-50 rounded-3xl animate-pulse border border-zinc-100" />
        <div className="h-80 bg-zinc-50 rounded-3xl animate-pulse border border-zinc-100" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-zinc-400 bg-zinc-50/50 rounded-3xl border border-zinc-100 text-xs font-semibold uppercase tracking-wider">
        {lang === "am" 
          ? "ምንም መረጃ የለም። ገበታዎችን ለማየት እባክዎ አስቀድመው የተወሰኑ ዕቃዎችን ይቅረጹ።" 
          : "Data unavailable. Record some items to populate charts."}
      </div>
    );
  }

  // Formatting currency numbers
  const formatCurrency = (val: number) => `ETB ${val.toLocaleString()}`;

  // Build Payment Breakdown dataset
  const paymentBreakdownData = [
    { name: "CBE Birr", value: data.payment.cbe, qty: data.payment.cbe_qty, color: "#18181b" }, // dark zinc
    { name: "Telebirr", value: data.payment.telebirr, qty: data.payment.telebirr_qty, color: "#10b981" }, // emerald
    { name: "Cash", value: data.payment.cash, qty: data.payment.cash_qty, color: "#f59e0b" } // amber
  ];

  // Custom tooltip for Piechart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-white/95 p-3 px-4 border border-zinc-100 shadow-xl rounded-2xl text-[11px] font-semibold text-zinc-700 font-sans">
          <p className="font-extrabold text-zinc-900 mb-1">{p.name}</p>
          <p className="flex justify-between gap-4 mt-1">
            <span>{lang === "am" ? "የገንዘብ ድምር፦" : "Value:"}</span>
            <span className="font-bold text-zinc-950 font-mono">{formatCurrency(p.value)}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span>{lang === "am" ? "የዕቃዎች ብዛት፦" : "Volume:"}</span>
            <span className="font-bold text-zinc-950 font-mono">{p.qty} {t.units}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for charts
  const CustomTrendTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-white/95 p-3 px-4 border border-zinc-100 shadow-xl rounded-2xl text-[11px] font-semibold text-zinc-700 font-sans">
          <p className="font-extrabold text-zinc-900 mb-1">{p.month}</p>
          <p className="flex justify-between gap-4 mt-1">
            <span className="text-emerald-700">{lang === "am" ? "የዛሬ ግዢ ፍሰት፦" : "Value Flow:"}</span>
            <span className="font-bold text-emerald-800 font-mono">{formatCurrency(p.value)}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span>{lang === "am" ? "የገባ ዕቃ ብዛት፦" : "Stock Ingestion:"}</span>
            <span className="font-bold text-zinc-950 font-mono">{p.qty} {t.units}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      {/* 1. Value Ingestion Growth trends chart */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-5 sm:p-6 shadow-[0_4px_25px_rgb(0,0,0,0.01)] flex flex-col justify-between">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm sm:text-base font-extrabold text-zinc-805 font-sans">{t.valuationTrendTitle}</h3>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">{t.paymentTrendsSubtitle}</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 9, fill: '#a1a1aa', fontWeight: 'bold' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                tickFormatter={(val) => `${val / 1000}k`}
                tick={{ fontSize: 9, fill: '#a1a1aa', fontWeight: 'bold' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip content={<CustomTrendTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorVal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Payment channels pie chart distribution */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-5 sm:p-6 shadow-[0_4px_25px_rgb(0,0,0,0.01)] flex flex-col justify-between">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-zinc-700" />
            <h3 className="text-sm sm:text-base font-extrabold text-zinc-805 font-sans">{t.paymentShareSummary}</h3>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">{t.financialReportsDesc}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner center text */}
            <div className="absolute text-center flex flex-col justify-center pointer-events-none leading-none">
              <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                {lang === "am" ? "ጠቅላላ እሴት" : "Total Asset"}
              </span>
              <span className="text-xs sm:text-sm font-black text-zinc-800 mt-1.5 font-sans">
                ETB {(data.totals.totalValue).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Side custom legend indicators */}
          <div className="space-y-3">
            {paymentBreakdownData.map((p, idx) => {
              const totalVal = data.totals.totalValue || 1;
              const percent = ((p.value / totalVal) * 100).toFixed(1);
              return (
                <div key={idx} className="flex justify-between items-center border-b border-zinc-50 pb-2.5 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <div className="leading-none">
                      <span className="text-xs font-bold text-zinc-750 block">{p.name}</span>
                      <span className="text-[9px] text-zinc-400 font-semibold font-mono mt-0.5 block">{p.qty} {t.units}</span>
                    </div>
                  </div>
                  <div className="text-right leading-none">
                    <span className="text-xs font-black text-zinc-800 block">{formatCurrency(p.value)}</span>
                    <span className="text-[9px] font-extrabold text-zinc-400 mt-0.5 block">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
