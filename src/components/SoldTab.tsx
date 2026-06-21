import React from "react";
import { Product, User, Sale } from "../types";
import { Language } from "../utils/translations";
import {
  ShoppingBag, HandCoins, Clock, Eye, Sparkles, Edit, Trash2, Calendar, RefreshCcw, Cloud, TrendingUp, BarChart2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import {
  toEthiopian, ETHIOPIAN_MONTHS_AM, ETHIOPIAN_MONTHS_EN, formatDoubleDate
} from "../utils/ethiopianCalendar";
import { generateSoldUnitsPDF } from "../utils/pdfGenerator";

interface SoldTabProps {
  products: Product[];
  sales: Sale[];
  computedMetrics: {
    totalSoldQty: number;
    totalSoldWorth: number;
    sellThroughRate: number;
  };
  lang: Language;
  setIsSoldFormOpen: (val: boolean) => void;
  setViewingProduct: (p: Product) => void;
  formatEthiopianDate: (d: string) => string;
  onEditClick: (p: Product) => void;
  onDeleteClick: (id: string) => void;
  user?: User;
  isCloudActive?: boolean;
}

export default function SoldTab({
  products,
  sales,
  computedMetrics,
  lang,
  setIsSoldFormOpen,
  setViewingProduct,
  formatEthiopianDate,
  onEditClick,
  onDeleteClick,
  user,
  isCloudActive,
}: SoldTabProps) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [zoomedImage, setZoomedImage] = React.useState<string | null>(null);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await generateSoldUnitsPDF(sales, products, lang, user?.name || "Cashier");
    } catch (e) {
      console.error("Failed to generate sold units PDF report", e);
    } finally {
      setIsExporting(false);
    }
  };

  // Ethiopian date active filters state
  const [filterEtYear, setFilterEtYear] = React.useState<string>("all");
  const [filterEtMonth, setFilterEtMonth] = React.useState<string>("all");
  const [filterEtDay, setFilterEtDay] = React.useState<string>("all");

  const monthsList = React.useMemo(() => {
    return lang === "am" ? ETHIOPIAN_MONTHS_AM : ETHIOPIAN_MONTHS_EN;
  }, [lang]);

  // Extract all available Ethiopian years from sale dates safely
  const availableYears = React.useMemo(() => {
    const yearsSet = new Set<number>();
    sales.forEach((s) => {
      try {
        const et = toEthiopian(s.sale_date);
        yearsSet.add(et.year);
      } catch (e) {
        // ignore date error
      }
    });
    // fallback if no sales are logged
    if (yearsSet.size === 0) {
      yearsSet.add(2018);
      yearsSet.add(2017);
      yearsSet.add(2016);
    }
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [sales]);

  // Filter sales using the Ethiopian calendar sale date filters
  const filteredSales = React.useMemo(() => {
    return sales.filter((s) => {
      try {
        const et = toEthiopian(s.sale_date);
        if (filterEtYear !== "all" && et.year !== Number(filterEtYear)) return false;
        if (filterEtMonth !== "all" && et.month !== Number(filterEtMonth)) return false;
        if (filterEtDay !== "all" && et.day !== Number(filterEtDay)) return false;
        return true;
      } catch {
        return true;
      }
    });
  }, [sales, filterEtYear, filterEtMonth, filterEtDay]);

  // Filter-responsive dynamic calculations
  const filteredMetrics = React.useMemo(() => {
    let qty = 0;
    let worth = 0;
    filteredSales.forEach((s) => {
      qty += s.quantity;
      worth += s.total_price;
    });
    return { qty, worth };
  }, [filteredSales]);

  const isFilterActive = filterEtYear !== "all" || filterEtMonth !== "all" || filterEtDay !== "all";

  // --- Bar chart: sold vs remaining per product ---
  const chartData = React.useMemo(() => {
    const activeSales = isFilterActive ? filteredSales : sales;
    const agg: Record<string, { sold: number; remaining: number }> = {};
    products.forEach((p) => {
      agg[p.product_name] = { sold: 0, remaining: Math.max(0, p.quantity - (p.sold_quantity ?? 0)) };
    });
    activeSales.forEach((s) => {
      if (agg[s.product_name]) {
        agg[s.product_name].sold += s.quantity;
      } else {
        agg[s.product_name] = { sold: s.quantity, remaining: 0 };
      }
    });
    return Object.entries(agg)
      .filter(([, d]) => d.sold > 0 || d.remaining > 0)
      .map(([name, d]) => ({
        name: name.length > 12 ? name.substring(0, 12) + "…" : name,
        [lang === "am" ? "የተሸጠ" : "Sold"]: d.sold,
        [lang === "am" ? "ቀሪ" : "Remaining"]: d.remaining,
      }));
  }, [products, sales, filteredSales, isFilterActive, lang]);

  // --- Donut chart: payment method breakdown ---
  const paymentPieData = React.useMemo(() => {
    const activeSales = isFilterActive ? filteredSales : sales;
    const breakdown: Record<string, number> = {};
    activeSales.forEach((s) => {
      const m = s.payment_method || "Other";
      breakdown[m] = (breakdown[m] || 0) + s.total_price;
    });
    return Object.entries(breakdown).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [sales, filteredSales, isFilterActive]);

  const PIE_COLORS = ["#009b3a", "#6366f1", "#f59e0b", "#06b6d4", "#ec4899"];

  // --- Area chart: sales revenue trend by Ethiopian month ---
  const trendData = React.useMemo(() => {
    const activeSales = isFilterActive ? filteredSales : sales;
    const monthly: Record<string, number> = {};
    activeSales.forEach((s) => {
      try {
        const et = toEthiopian(s.sale_date);
        const key = `${et.year}/${String(et.month).padStart(2,'0')}`;
        monthly[key] = (monthly[key] || 0) + s.total_price;
      } catch { /* ignore */ }
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([key, value]) => {
        const [yr, mo] = key.split("/");
        const mIdx = parseInt(mo, 10) - 1;
        const mName = lang === "am" ? ETHIOPIAN_MONTHS_AM[mIdx] : ETHIOPIAN_MONTHS_EN[mIdx];
        return { name: `${mName} ${yr}`, value: Math.round(value) };
      });
  }, [sales, filteredSales, isFilterActive, lang]);

  // Custom tooltip for the area chart
  const AreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 14, padding: "10px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          <p style={{ fontSize: 10, color: "#71717a", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
          <p style={{ fontSize: 14, fontWeight: 900, color: "#009b3a" }}>ETB {payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 14, padding: "10px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          <p style={{ fontSize: 10, color: "#71717a", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ fontSize: 12, fontWeight: 800, color: p.fill }}>{ p.name}: <span style={{ color: "#18181b" }}>{p.value}</span></p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Pie tooltip
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 14, padding: "10px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: payload[0].payload.fill || "#18181b", marginBottom: 3 }}>{payload[0].name}</p>
          <p style={{ fontSize: 13, fontWeight: 900, color: "#18181b" }}>ETB {payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Tab headers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <span>{lang === "am" ? "የተሸጡ ዕቃዎች" : "Sold Items Database"}</span>
            </h3>
            {isCloudActive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-extrabold uppercase rounded-full tracking-wider shadow-3xs select-none">
                <Cloud className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{lang === "am" ? "ደመና-የተመሳሰለ" : "Synced"}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-50 border border-zinc-200 text-zinc-505 text-[9px] font-extrabold uppercase rounded-full tracking-wider select-none">
                <Cloud className="w-3 h-3 text-zinc-400 shrink-0" />
                <span>{lang === "am" ? "አከባቢ" : "Offline"}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-450 mt-1 font-medium">
            {lang === "am" 
              ? "የተሸጡ እቃዎችን ዝርዝር ሁኔታ ከተዛማጅ የክምችት ንፅፅር ገበታ ጋር ይከታተሉ" 
              : "Detailed lists of sold products with interactive sales tracking charts."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 select-none shrink-0">
          <button
            onClick={handleExportPDF}
            disabled={isExporting || sales.length === 0}
            className="min-h-[48px] px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all duration-150 cursor-pointer"
          >
            {isExporting ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin" />
                <span>{lang === "am" ? "በማዘጋጀት ላይ..." : "Exporting..."}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{lang === "am" ? "የተሸጡ እቃዎች PDF ሪፖርት አውርድ" : "Download Sold Units PDF"}</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsSoldFormOpen(true)}
            className="min-h-[48px] px-6 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2.5 shadow-md active:scale-95 transition-transform duration-150 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-4.5 h-4.5 shrink-0" />
            <span>{lang === "am" ? "የተሸጡ ዕቃዎች መሙያ ፎርም" : "Sold Items Form"}</span>
          </button>
        </div>
      </div>

      {/* Numerical Indicators - Dynamic based on active Ethiopian Calendar filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-zinc-100 rounded-3xl flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
              {lang === "am" ? "የተሸጡ ዕቃዎች ብዛት" : "Total Sold Qty"}
            </span>
            <span className="text-lg font-black text-zinc-900">
              {isFilterActive ? filteredMetrics.qty.toLocaleString() : computedMetrics.totalSoldQty.toLocaleString()} units
            </span>
            {isFilterActive && (
              <span className="text-[9px] font-extrabold text-[#009b3a] bg-emerald-50 border border-emerald-100/30 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                {lang === "am" ? "ተጣርቶ የተገኘ" : "Filtered result"}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-100 rounded-3xl flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <HandCoins className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
              {lang === "am" ? "ጠቅላላ የሽያጭ ገቢ" : "Total Sold Value"}
            </span>
            <span className="text-lg font-black text-[#009b3a]">
              ETB {isFilterActive ? filteredMetrics.worth.toLocaleString() : computedMetrics.totalSoldWorth.toLocaleString()}
            </span>
            {isFilterActive && (
              <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100/30 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                {lang === "am" ? "ተጣርቶ የተገኘ" : "Filtered result"}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-100 rounded-3xl flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
              {lang === "am" ? "የሽያጭ ፍጥነት ድርሻ" : "Liquidated Margin"}
            </span>
            <span className="text-lg font-black text-amber-700">{computedMetrics.sellThroughRate}%</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
           PREMIUM ANALYTICS CHARTS — 3-Panel Modern Visualization Suite
      ════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-5">

        {/* Chart Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-black text-zinc-900">
                {lang === "am" ? "የሽያጭ ትንታኔ ገበታዎች" : "Sales Analytics Charts"}
              </h4>
              <p className="text-[10px] text-zinc-400 font-semibold">
                {lang === "am" ? "ይህ ወር ሙሉ የሽያጭ ትንታኔ" : "Full analytics from your sales transactions"}
              </p>
            </div>
          </div>
          {isFilterActive && (
            <span className="text-[9.5px] font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              {lang === "am" ? "ማጣሪያ በርቷል" : "Filtered View"}
            </span>
          )}
        </div>

        {/* Row 1: Revenue Trend Area Chart (full width) */}
        <div style={{ background: "#fff", borderRadius: 24, padding: "24px 24px 16px", border: "1px solid #e4e4e7", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div>
                <p style={{ color: "#18181b", fontSize: 12, fontWeight: 900, margin: 0 }}>
                  {lang === "am" ? "ወርሃዊ የሽያጭ ገቢ ትሬንድ" : "Monthly Revenue Trend"}
                </p>
                <p style={{ color: "#a1a1aa", fontSize: 10, fontWeight: 600, margin: 0 }}>
                  {lang === "am" ? "በኢትዮጵያ ዘመን አቆጣጠር" : "By Ethiopian calendar month"}
                </p>
              </div>
            </div>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "4px 12px" }}>
              <span style={{ color: "#009b3a", fontSize: 10, fontWeight: 900, letterSpacing: "0.05em" }}>
                ETB {(isFilterActive ? filteredMetrics.worth : computedMetrics.totalSoldWorth).toLocaleString()}
              </span>
            </div>
          </div>
          {trendData.length === 0 ? (
            <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "#a1a1aa", fontSize: 11, fontWeight: 700 }}>
                {lang === "am" ? "የሽያጭ ዳታ የለም" : "No sales data available yet"}
              </p>
            </div>
          ) : (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#009b3a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#009b3a" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="#f4f4f5" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9, fill: "#a1a1aa", fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#d4d4d8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v/1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<AreaTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={lang === "am" ? "ገቢ" : "Revenue"}
                    stroke="#009b3a"
                    strokeWidth={2.5}
                    fill="url(#revenueGrad)"
                    dot={{ r: 3.5, fill: "#009b3a", stroke: "#fff", strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: "#009b3a", stroke: "rgba(0,155,58,0.2)", strokeWidth: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Row 2: Bar Chart + Donut side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Bar Chart: Sold vs Remaining (3/5 width) */}
          <div className="lg:col-span-3" style={{ background: "linear-gradient(135deg, #fafafa 0%, #ffffff 100%)", borderRadius: 24, padding: "22px 22px 14px", border: "1px solid #e4e4e7", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div>
                <p className="text-xs font-black text-zinc-800">
                  {lang === "am" ? "የዕቃዎች ሽያጭ vs ቀሪ ክምችት" : "Sold vs Remaining per Product"}
                </p>
                <p className="text-[10px] text-zinc-400 font-semibold">
                  {lang === "am" ? "ከሚሸጡ ምርቶች ሁሉ" : "Across all tracked products"}
                </p>
              </div>
            </div>
            {chartData.length === 0 ? (
              <div className="h-44 flex items-center justify-center">
                <p className="text-xs text-zinc-400 font-bold">{lang === "am" ? "ምንም ዕቃዎች የሉም" : "No data yet"}</p>
              </div>
            ) : (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                    <defs>
                      <linearGradient id="soldBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#009b3a" stopOpacity={1} />
                        <stop offset="100%" stopColor="#007a2e" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="remainBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#52525b", fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<BarTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingTop: 8 }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Bar dataKey={lang === "am" ? "የተሸጠ" : "Sold"} fill="url(#soldBarGrad)" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    <Bar dataKey={lang === "am" ? "ቀሪ" : "Remaining"} fill="url(#remainBarGrad)" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Donut Chart: Payment Method Breakdown (2/5 width) */}
          <div className="lg:col-span-2" style={{ background: "#fff", borderRadius: 24, padding: "22px", border: "1px solid #e4e4e7", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#ede9fe" }}>
                <span style={{ fontSize: 13 }}>💳</span>
              </div>
              <div>
                <p style={{ color: "#18181b", fontSize: 12, fontWeight: 900, margin: 0 }}>
                  {lang === "am" ? "በክፍያ መንገድ ምድብ" : "By Payment Channel"}
                </p>
                <p style={{ color: "#a1a1aa", fontSize: 10, fontWeight: 600, margin: 0 }}>
                  {lang === "am" ? "የሽያጭ ድርሻ" : "Revenue distribution"}
                </p>
              </div>
            </div>
            {paymentPieData.length === 0 ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "#a1a1aa", fontSize: 11, fontWeight: 700 }}>{lang === "am" ? "ዳታ የለም" : "No data yet"}</p>
              </div>
            ) : (
              <>
                <div style={{ height: 170 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {paymentPieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="space-y-2 mt-1">
                  {paymentPieData.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                        <span style={{ color: "#71717a", fontSize: 10, fontWeight: 700 }}>{item.name}</span>
                      </div>
                      <span style={{ color: "#18181b", fontSize: 10, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>ETB {item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sold items tables rendering */}
      <div className="bg-white border border-zinc-100 rounded-3xl shadow-xs overflow-hidden">
        
        {/* Table Title Bar */}
        <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center flex-wrap gap-2.5">
          <h4 className="text-[10px] font-black tracking-widest text-[#009b3a] uppercase font-sans">
            {lang === "am" ? "የተሸጡ ዕቃዎች ሰንጠረዥ" : "Sold Products Registry"}
          </h4>
          <span className="text-[11px] font-black text-indigo-800 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            {lang === "am" 
              ? `ድምር- ${filteredSales.length} ከ ${sales.length} ሪኮርዶች` 
              : `Matched: ${filteredSales.length} of ${sales.length} records`}
          </span>
        </div>

        {/* Ethiopian Calendar Filter Panel */}
        <div className="px-6 py-5 bg-zinc-50/25 border-b border-zinc-100 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          
          {/* Year Select dropdown */}
          <div>
            <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 pl-0.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{lang === "am" ? "የሽያጭ የኢትዮጵያ ዓመት" : "Ethiopian Sale Year"}</span>
            </label>
            <select
              value={filterEtYear}
              onChange={(e) => setFilterEtYear(e.target.value)}
              className="w-full min-h-[40px] px-3.5 text-xs bg-white border-2 border-zinc-100 focus:border-[#009b3a] rounded-xl focus:ring-1 focus:ring-[#009b3a] focus:outline-none transition duration-150 font-bold text-zinc-805 cursor-pointer shadow-xs"
            >
              <option value="all">{lang === "am" ? "ሁሉም ዓመታት (All)" : "All Years"}</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y} {lang === "am" ? "ዓ.ም" : "EC"}</option>
              ))}
            </select>
          </div>

          {/* Month Select dropdown */}
          <div>
            <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 pl-0.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{lang === "am" ? "የሽያጭ የኢትዮጵያ ወር" : "Ethiopian Sale Month"}</span>
            </label>
            <select
              value={filterEtMonth}
              onChange={(e) => setFilterEtMonth(e.target.value)}
              className="w-full min-h-[40px] px-3.5 text-xs bg-white border-2 border-zinc-100 focus:border-[#009b3a] rounded-xl focus:ring-1 focus:ring-[#009b3a] focus:outline-none transition duration-150 font-bold text-zinc-805 cursor-pointer shadow-xs"
            >
              <option value="all">{lang === "am" ? "ሁሉም ወራት (All)" : "All Months"}</option>
              {monthsList.map((m, idx) => (
                <option key={idx} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>

          {/* Day Select dropdown */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#009b3a] uppercase tracking-wider mb-2 flex items-center gap-1.5 pl-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#009b3a] shrink-0 animate-pulse" />
              <span>{lang === "am" ? "የሽያጭ የኢትዮጵያ ቀን" : "Ethiopian Sale Day"}</span>
            </label>
            <select
              value={filterEtDay}
              onChange={(e) => setFilterEtDay(e.target.value)}
              className="w-full min-h-[40px] px-3.5 text-xs bg-white border-2 border-zinc-100 focus:border-[#009b3a] rounded-xl focus:ring-1 focus:ring-[#009b3a] focus:outline-none transition duration-150 font-bold text-zinc-850 cursor-pointer shadow-xs"
            >
              <option value="all">{lang === "am" ? "ሁሉም ቀናት (All)" : "All Days"}</option>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Clean filters reset trigger */}
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => {
                setFilterEtYear("all");
                setFilterEtMonth("all");
                setFilterEtDay("all");
              }}
              disabled={!isFilterActive}
              className="w-full min-h-[40px] px-4 py-2 bg-white hover:bg-zinc-100 active:bg-zinc-150 text-zinc-505 hover:text-zinc-800 rounded-xl text-xs font-bold border border-zinc-200.5 dynamic-shadow transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
            >
              🔄 {lang === "am" ? "ማጣሪያውን አፅዳ" : "Reset Filter"}
            </button>
          </div>

        </div>

        {/* Filter dynamic description ribbon */}
        {isFilterActive && (
          <div className="px-6 py-4.5 bg-emerald-50/50 border-b border-zinc-100 text-emerald-800 text-xs font-bold flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#009b3a] animate-pulse shrink-0"></span>
              <p className="leading-snug">
                {lang === "am" 
                  ? `ንቁ የኢትዮጵያ የዘመን አቆጣጠር ማጣሪያ ተተግብሯል፦ ` 
                  : `Active Ethiopian Date filter applied: `}
                <span className="text-emerald-990 font-black">
                  {filterEtYear !== "all" ? `${filterEtYear} ${lang === "am" ? "ዓ.ም " : "EC "}` : ""}
                  {filterEtMonth !== "all" ? `${monthsList[Number(filterEtMonth) - 1]} ` : ""}
                  {filterEtDay !== "all" ? `${lang === "am" ? "ቀን " : "day "}${filterEtDay}` : ""}
                </span>
              </p>
            </div>
            <div className="bg-emerald-100/50 text-emerald-900 border border-emerald-250/20 rounded-xl px-3 py-1 text-[11px] font-black font-mono">
              ⛳️ {lang === "am" ? `የተጣራ የሽያጭ መጠን፦ ` : `Filtered Output: `} {filteredMetrics.qty} units | ETB {filteredMetrics.worth.toLocaleString()}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {/* Desktop and Tablet table */}
          <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest select-none">
                  <th className="py-4.5 px-4">{lang === "am" ? "የዕቃው ስም" : "Product Name"}</th>
                  <th className="py-4.5 px-4 text-center">{lang === "am" ? "የዕቃው ፎቶ" : "Product Photo"}</th>
                  <th className="py-4.5 px-4 text-center">{lang === "am" ? "የተገዛበት ቀን" : "Sale Date"}</th>
                  <th className="py-4.5 px-4 text-right">{lang === "am" ? "የአንዱ ዕቃ ዋጋ" : "Unit Price"}</th>
                  <th className="py-4.5 px-4 text-center">{lang === "am" ? "የዕቃው ብዛት" : "Quantity"}</th>
                  <th className="py-4.5 px-4 text-right">{lang === "am" ? "የዕቃው ሙሉ ዋጋ" : "Total Price"}</th>
                  <th className="py-4.5 px-4 text-center">{lang === "am" ? "የክፍያ መንገድ" : "Payment Method"}</th>
                  <th className="py-4.5 px-4 text-center">{lang === "am" ? "የዕቃው የተገዛበት ደረሰኝ ፎቶ" : "Receipt Photo"}</th>
                  <th className="py-4.5 px-6 text-center">{lang === "am" ? "ማስተካከያ" : "Adjustment"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 text-zinc-705 text-xs">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center bg-white">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-150 text-zinc-400 flex items-center justify-center mx-auto">
                          <ShoppingBag className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-zinc-850">
                            {lang === "am" ? "በተመረጠው ቀን ምንም የተሸጡ ዕቃዎች የሉም" : "No sold items match this date"}
                          </h5>
                          <p className="text-xs text-zinc-450 mt-1 max-w-xs mx-auto font-medium">
                            {lang === "am" 
                              ? "ማጣሪያውን በመቀየር ወይም በማጽዳት ሌላ መረጃ መፈለግ ይችላሉ::" 
                              : "Try resetting the Ethiopian Calendar filter panel above to find other logs."}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((s) => {
                    const product = products.find((p) => p.id === s.product_id);
                    const productImg = product?.product_image;
                    
                    return (
                      <tr key={s.id} className="hover:bg-zinc-50/20 transition duration-100 group">
                        {/* 1. የዕቃው ስም */}
                        <td className="py-4 px-4 font-bold text-zinc-800">
                          {s.product_name}
                        </td>

                        {/* 2. የዕቃው ፎቶ */}
                        <td className="py-4 px-4 text-center">
                          {productImg ? (
                            <img
                              src={productImg}
                              alt={s.product_name}
                              onClick={() => setZoomedImage(productImg)}
                              className="w-10 h-10 rounded-lg object-cover border border-zinc-200 cursor-zoom-in hover:scale-105 transition shadow-sm mx-auto"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 text-[10px] uppercase font-mono mx-auto border border-zinc-200/50">
                              {s.product_name.substring(0, 2)}
                            </div>
                          )}
                        </td>

                        {/* 3. የተገዛበት ቀን */}
                        <td className="py-4 px-4 text-center font-bold text-zinc-500 text-[10px] font-mono">
                          {s.sale_date ? formatEthiopianDate(s.sale_date) : "—"}
                        </td>

                        {/* 4. የአንዱ ዕቃ ዋጋ */}
                        <td className="py-4 px-4 text-right font-bold text-zinc-700">
                          ETB {s.unit_price.toLocaleString()}
                        </td>

                        {/* 5. የዕቃው ብዛት */}
                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-50 text-[#009b3a] font-mono">
                            {s.quantity} units
                          </span>
                        </td>

                        {/* 6. የዕቃው ሙሉ ዋጋ */}
                        <td className="py-4 px-4 text-right font-black text-[#009b3a] text-sm">
                          ETB {s.total_price.toLocaleString()}
                        </td>

                        {/* 7. የክፍያ መንገድ */}
                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-1 text-[9px] font-black rounded-lg bg-emerald-100 text-emerald-800">
                            {s.payment_method}
                          </span>
                        </td>

                        {/* 8. የዕቃው የተገዛበት ደረሰኝ ፎቶ */}
                        <td className="py-4 px-4 text-center">
                          {s.receipt_image ? (
                            <img
                              src={s.receipt_image}
                              alt="Receipt"
                              onClick={() => setZoomedImage(s.receipt_image || null)}
                              className="w-10 h-10 rounded-lg object-cover border border-zinc-200 cursor-zoom-in hover:scale-105 transition shadow-sm mx-auto"
                            />
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-bold italic">
                              {lang === "am" ? "የለም" : "No photo"}
                            </span>
                          )}
                        </td>

                        {/* Adjustment action controls */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => product && setViewingProduct(product)}
                              disabled={!product}
                              title={lang === "am" ? "ሁኔታውን ተመልከት" : "Expand specs"}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 hover:text-zinc-700 text-zinc-400 transition cursor-pointer active:scale-95 disabled:opacity-30"
                            >
                              <Eye className="w-4 h-4 mx-auto" />
                            </button>
                            <button
                              onClick={() => product && onEditClick(product)}
                              disabled={!product}
                              title={lang === "am" ? "የዕቃ ምዝገባ ማሻሻያ ቅጽ" : "Edit Intake Spec"}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 hover:text-[#009b3a] text-zinc-400 transition cursor-pointer active:scale-95 disabled:opacity-30"
                            >
                              <Edit className="w-4 h-4 mx-auto" />
                            </button>
                            <button
                              onClick={() => onDeleteClick(s.id)}
                              title={lang === "am" ? "የሽያጭ መዝገብ ሰርዝ" : "Permanently Delete Sales Entry"}
                              className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-zinc-400 transition cursor-pointer active:scale-95"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Mobile layout list display cards */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {filteredSales.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-150 text-zinc-400 flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-zinc-850">
                        {lang === "am" ? "በተመረጠው ቀን ምንም የተሸጡ ዕቃዎች የሉም" : "No sold items match this date"}
                      </h5>
                      <p className="text-[10px] text-zinc-450 mt-1 max-w-xs mx-auto font-medium">
                        {lang === "am" 
                          ? "ማጣሪያውን በመቀየር ወይም በማጽዳት ሌላ መረጃ መፈለግ ይችላሉ::" 
                          : "Try resetting the Ethiopian Calendar filter panel above."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                filteredSales.map((s) => {
                  const product = products.find((p) => p.id === s.product_id);
                  const productImg = product?.product_image;
                  
                  return (
                    <div key={s.id} className="bg-zinc-50/50 border border-zinc-100 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          {productImg ? (
                            <img
                              src={productImg}
                              alt={s.product_name}
                              onClick={() => setZoomedImage(productImg)}
                              className="w-10 h-10 rounded-lg object-cover border border-zinc-200 cursor-zoom-in"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-zinc-200 text-zinc-505 rounded-lg font-bold flex items-center justify-center uppercase text-xs">
                              {s.product_name.substring(0, 2)}
                            </div>
                          )}
                          <div>
                            <h5 className="font-extrabold text-zinc-800 text-xs">{s.product_name}</h5>
                            <span className="text-[9px] text-zinc-400 font-bold block">
                              {lang === "am" ? `የሽያጭ ቀን፦ ` : `Sold: `} {s.sale_date ? formatEthiopianDate(s.sale_date) : "—"}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black font-mono">
                          {s.payment_method}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-white/70 border border-zinc-100 p-2.5 rounded-xl text-xs font-bold text-zinc-700">
                        <div>
                          <span className="text-[9px] text-zinc-400 uppercase block">{lang === "am" ? "የተሸጡ ብዛት" : "Sold qty"}</span>
                          <span className="text-[#009b3a] font-sans font-black">{s.quantity} units</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-405 uppercase block">{lang === "am" ? "የአንዱ ዋጋ" : "Unit price"}</span>
                          <span>ETB {s.unit_price.toLocaleString()}</span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-zinc-100 mt-1 flex justify-between items-center bg-zinc-50/50 px-2 py-1 rounded-lg">
                          <span className="text-[10px] text-zinc-400">{lang === "am" ? "ጠቅላላ ዋጋ፦" : "Total Price:"}</span>
                          <span className="text-[#009b3a] font-black text-sm">ETB {s.total_price.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Receipt Image Thumbnail preview in mobile view */}
                      <div className="bg-white/50 border border-zinc-100 p-2.5 rounded-xl text-xs font-bold text-zinc-700 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400">{lang === "am" ? "የዕቃው የተገዛበት ደረሰኝ ፎቶ" : "Receipt Photo"}</span>
                        {s.receipt_image ? (
                          <img
                            src={s.receipt_image}
                            alt="Receipt Preview"
                            onClick={() => setZoomedImage(s.receipt_image || null)}
                            className="w-10 h-10 rounded-lg object-cover border border-zinc-200 cursor-zoom-in hover:scale-105 transition shadow-sm"
                          />
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-medium italic">{lang === "am" ? "የለም" : "No receipt"}</span>
                        )}
                      </div>

                      {/* Fully responsive mobile Adjustment Controls */}
                      <div className="flex justify-end gap-1.5 pt-1.5 border-t border-zinc-200/55 mt-1">
                        <button
                          onClick={() => product && setViewingProduct(product)}
                          disabled={!product}
                          className="px-3 py-1.5 bg-white hover:bg-zinc-100 active:bg-zinc-150 border border-zinc-200 text-zinc-650 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-30"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{lang === "am" ? "ተመልከት" : "View"}</span>
                        </button>
                        <button
                          onClick={() => product && onEditClick(product)}
                          disabled={!product}
                          className="px-3 py-1.5 bg-white hover:bg-zinc-100 active:bg-zinc-150 border border-zinc-200 text-[#009b3a] rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-30"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{lang === "am" ? "ማስተካከያ" : "Edit"}</span>
                        </button>
                        <button
                          onClick={() => onDeleteClick(s.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-150 border border-rose-100 text-rose-600 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{lang === "am" ? "ሰርዝ" : "Delete"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      {/* Zoom Modal overlay */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 cursor-zoom-out"
        >
          <img
            src={zoomedImage}
            alt="Zoomed preview"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-zinc-800"
          />
        </div>
      )}
    </div>
  );
}
