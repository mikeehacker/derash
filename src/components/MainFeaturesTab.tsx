import React from "react";
import { Product, User } from "../types";
import { Language } from "../utils/translations";
import MetricCard from "./MetricCard";
import { 
  Compass, 
  Layers, 
  Sparkles, 
  BookMarked, 
  Clock, 
  Plus, 
  ShoppingBag, 
  AlertCircle,
  Eye,
  Calendar,
  Search,
  ArrowUpDown,
  Filter,
  CheckCircle,
  Coins,
  TrendingUp,
  TrendingDown,
  Layers3,
  Tags,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Database,
  Copy,
  Check,
  Server
} from "lucide-react";
import { formatEthiopianDate, toEthiopian } from "../utils/ethiopianCalendar";
import { generateInventoryPDF } from "../utils/pdfGenerator";
import { api } from "../services/api";

interface MainFeaturesTabProps {
  user: User;
  products: Product[];
  computedMetrics: {
    totalInflowQty: number;
    totalInflowWorth: number;
    totalSoldQty: number;
    totalSoldWorth: number;
    totalUnsoldQty: number;
    totalUnsoldWorth: number;
    sellThroughRate: number;
  };
  lang: Language;
  etTodayStr: string;
  etTimeStr?: string;
  activeClock?: string;
  onOpenIntake: () => void;
  onOpenSold: () => void;
  onViewProduct: (p: Product) => void;
  onEditProduct?: (p: Product) => void;
  onTabChange: (tabId: "dashboard" | "inventory" | "finance" | "sold" | "unsold") => void;
  onSyncSuccess?: () => void;
}

export default function MainFeaturesTab({
  user,
  products,
  computedMetrics,
  lang,
  etTodayStr,
  etTimeStr = "",
  activeClock = "",
  onOpenIntake,
  onOpenSold,
  onViewProduct,
  onEditProduct,
  onTabChange,
  onSyncSuccess,
}: MainFeaturesTabProps) {
  // Supabase states
  const [supabaseLoading, setSupabaseLoading] = React.useState(false);
  const [supabaseStatus, setSupabaseStatus] = React.useState<any>(null);
  const [syncLoading, setSyncLoading] = React.useState(false);
  const [syncResponse, setSyncResponse] = React.useState<any>(null);
  const [showSqlInstructions, setShowSqlInstructions] = React.useState(false);
  const [copiedSql, setCopiedSql] = React.useState(false);

  const sqlSchemaStr = `-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'User')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  purchase_date TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  total_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  product_image TEXT,
  created_by TEXT,
  created_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable Row Level Security (RLS) to allow public read/write access via the API/Anon-Key client
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;`;

  const fetchSupabaseStatus = async () => {
    setSupabaseLoading(true);
    try {
      const status = await api.getSupabaseStatus();
      setSupabaseStatus(status);
    } catch (err: any) {
      console.error("Failed to fetch Supabase status:", err);
    } finally {
      setSupabaseLoading(false);
    }
  };

  const handleSyncSupabase = async () => {
    setSyncLoading(true);
    setSyncResponse(null);
    try {
      const response = await api.syncSupabase();
      setSyncResponse(response);
      await fetchSupabaseStatus();
      if (response && response.success) {
        onSyncSuccess?.();
      }
    } catch (err: any) {
      setSyncResponse({
        success: false,
        message: err.message || "Failed to synchronize database rows."
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaStr);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  React.useEffect(() => {
    fetchSupabaseStatus();
  }, []);

  // Synchronous critical stock filters
  const criticalLines = React.useMemo(() => {
    return products.filter((p) => {
      const remaining = p.quantity - (p.sold_quantity ?? 0);
      return remaining <= 3;
    });
  }, [products]);

  // Unified mastermind states
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedPayment, setSelectedPayment] = React.useState<string>("All");
  const [stockStatus, setStockStatus] = React.useState<string>("All");
  const [sortBy, setSortBy] = React.useState<string>("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  // Reset page when filtering or sorting changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedPayment, sortBy]);

  // Dynamic deep metrics across the 4 key structural domains
  const statsDetail = React.useMemo(() => {
    let totalInflowQty = 0;
    let totalInflowWorth = 0;
    
    let totalSoldQty = 0;
    let totalSoldWorth = 0;
    
    let cbeWorth = 0;
    let teleWorth = 0;
    let cashWorth = 0;
    
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let healthyStockCount = 0;

    products.forEach((p) => {
      totalInflowQty += p.quantity;
      totalInflowWorth += p.total_price;
      
      const sq = p.sold_quantity ?? 0;
      totalSoldQty += sq;
      
      const unitCost = p.quantity > 0 ? (p.total_price / p.quantity) : 0;
      totalSoldWorth += sq * unitCost;

      const rem = p.quantity - sq;
      if (p.quantity > 0) {
        if (rem === 0) {
          outOfStockCount++;
        } else if (rem <= 3) {
          lowStockCount++;
        } else {
          healthyStockCount++;
        }
      }

      const segmentSoldPrice = sq * unitCost;
      if (p.payment_method === "CBE Birr") {
        cbeWorth += segmentSoldPrice;
      } else if (p.payment_method === "Telebirr") {
        teleWorth += segmentSoldPrice;
      } else {
        cashWorth += segmentSoldPrice;
      }
    });

    const averageUnitCost = totalInflowQty > 0 ? Math.round(totalInflowWorth / totalInflowQty) : 0;
    const remainingQty = totalInflowQty - totalSoldQty;
    const remainingWorth = Math.max(0, totalInflowWorth - totalSoldWorth);

    return {
      totalInflowQty,
      totalInflowWorth,
      averageUnitCost,
      totalSoldQty,
      totalSoldWorth,
      cbeWorth,
      teleWorth,
      cashWorth,
      remainingQty,
      remainingWorth,
      lowStockCount,
      outOfStockCount,
      healthyStockCount,
    };
  }, [products]);

  // Selected sub-feature active detail tab for explanatory cockpit
  const [activeExplainTab, setActiveExplainTab] = React.useState<"intake" | "soldForm" | "editProduct" | "unsold" | "editSold">("intake");
  const [selectedEditProductId, setSelectedEditProductId] = React.useState<string>("");
  const [selectedEditSoldProductId, setSelectedEditSoldProductId] = React.useState<string>("");

  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      let pdfProducts = products;
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase().trim();
        pdfProducts = products.filter((p) => p.product_name.toLowerCase().includes(term));
      }
      await generateInventoryPDF(
        pdfProducts,
        lang,
        user.name || "Operator"
      );
    } catch (e) {
      console.error("Failed to export consolidated PDF report", e);
    } finally {
      setIsExporting(false);
    }
  };


  // Filtered and sorted products for master info matrix
  const filteredAndSortedProducts = React.useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter((p) => p.product_name.toLowerCase().includes(term));
    }

    // Payment gateway filter
    if (selectedPayment !== "All") {
      result = result.filter((p) => p.payment_method === selectedPayment);
    }

    // Stock Status filter
    if (stockStatus !== "All") {
      result = result.filter((p) => {
        const remaining = p.quantity - (p.sold_quantity ?? 0);
        if (stockStatus === "Sold") return (p.sold_quantity ?? 0) > 0;
        if (stockStatus === "Unsold") return remaining > 0;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      const remA = a.quantity - (a.sold_quantity ?? 0);
      const remB = b.quantity - (b.sold_quantity ?? 0);
      const soldA = a.sold_quantity ?? 0;
      const soldB = b.sold_quantity ?? 0;
      const unitPriceA = a.quantity > 0 ? (a.total_price / a.quantity) : 0;
      const unitPriceB = b.quantity > 0 ? (b.total_price / b.quantity) : 0;

      if (sortBy === "name") {
        valA = a.product_name.toLowerCase();
        valB = b.product_name.toLowerCase();
      } else if (sortBy === "date") {
        valA = a.purchase_date;
        valB = b.purchase_date;
      } else if (sortBy === "total_price") {
        valA = a.total_price;
        valB = b.total_price;
      } else if (sortBy === "remaining") {
        valA = remA;
        valB = remB;
      } else if (sortBy === "sold") {
        valA = soldA;
        valB = soldB;
      } else if (sortBy === "remaining_worth") {
        valA = remA * unitPriceA;
        valB = remB * unitPriceB;
      } else if (sortBy === "sold_worth") {
        valA = soldA * unitPriceA;
        valB = soldB * unitPriceB;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchTerm, selectedPayment, stockStatus, sortBy, sortOrder]);

  const paginatedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* 1. Greeting header bar */}
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8 rounded-[2rem] text-white shadow-2xl overflow-hidden group">
        {/* Dynamic Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#009b3a] via-emerald-600 to-teal-700"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-700 ease-out"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#00ff55]/20 rounded-full blur-[60px] pointer-events-none group-hover:translate-x-10 transition-transform duration-700 ease-out"></div>
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-[10px] font-black tracking-widest uppercase text-white/90">
              {lang === "am" ? "የቁጥጥር ማዕከል" : "Central Control"}
            </span>
          </div>
          <h3 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm mt-2 flex items-center">
            {lang === "am" ? `ሰላም፣ ` : `Welcome, `}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200 ml-1">
              {user.name || (lang === "am" ? "ኦፕሬተር" : "Operator")}
            </span>
            <span className="inline-block origin-bottom hover:-rotate-12 hover:scale-110 transition-transform duration-300 ml-2 cursor-default">👋</span>
          </h3>
          <p className="text-sm text-emerald-50 font-medium max-w-lg leading-relaxed opacity-90">
            {lang === "am" 
              ? "ወደ ደራሽ የዕቃዎች ቁጥጥርና የክምችት አስተዳደር እንኳን ደህና መጡ! ዋና ዋና መለኪያዎችን ከታች ይመልከቱ።" 
              : "Access real-time indicators and administer business operations instantly. Monitor stock levels and sales performance below."}
          </p>
        </div>
        
        {/* Time Widget */}
        <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-3xl flex flex-col shrink-0 min-w-[280px] shadow-xl hover:bg-white/15 transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase font-black tracking-widest text-emerald-200 flex items-center gap-1.5 select-none">
              <Clock className="w-4 h-4 shrink-0 text-emerald-300 animate-pulse" />
              <span>{lang === "am" ? "የኢትዮጵያ ሰዓት" : "Ethiopian Time"}</span>
            </div>
            <div className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="text-lg font-black text-white block tracking-tight flex items-center gap-2">
              <span className="text-xl">🇪🇹</span> {etTodayStr}
            </span>
            <span className="text-2xl font-extrabold text-[#e4ffd7] block font-mono tracking-wider drop-shadow-sm">
              {etTimeStr || "..."}
            </span>
          </div>
          
          <div className="mt-4 pt-3 border-t border-white/15 flex flex-col">
            <span className="text-[9px] uppercase font-black text-white/50 tracking-widest mb-1">
              {lang === "am" ? "የፈረንጆች ቀንና ሰዓት" : "Gregorian Datetime"}
            </span>
            <span className="text-xs font-semibold text-white/90 font-mono">
              {activeClock || "..."}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Bento Grid metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title={lang === "am" ? "ጠቅላላ የገቡ ዕቃዎች" : "Total Logged Inflow"}
          value={`${computedMetrics.totalInflowQty.toLocaleString()} ${lang === "am" ? "ዕቃዎች" : "items"}`}
          subtitle={lang === "am" ? `የገቡበት ጠቅላላ ዋጋ፦ ETB ${computedMetrics.totalInflowWorth.toLocaleString()}` : `Total Inflow Worth: ETB ${computedMetrics.totalInflowWorth.toLocaleString()}`}
          icon={Layers}
          bgColor="bg-zinc-950"
          iconColor="text-white"
        />
        <MetricCard
          title={lang === "am" ? "ጠቅላላ የተሸጡ ዕቃዎች" : "Total Sold Stock"}
          value={`${computedMetrics.totalSoldQty.toLocaleString()} ${lang === "am" ? "ዕቃዎች" : "items"}`}
          subtitle={lang === "am" ? `የተሸጡበት ጠቅላላ ዋጋ፦ ETB ${computedMetrics.totalSoldWorth.toLocaleString()}` : `Total Sales Worth: ETB ${computedMetrics.totalSoldWorth.toLocaleString()}`}
          icon={Sparkles}
          bgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <MetricCard
          title={lang === "am" ? "ጠቅላላ ያልተሸጡ ዕቃዎች" : "Remaining Stock Value"}
          value={`${computedMetrics.totalUnsoldQty.toLocaleString()} ${lang === "am" ? "ዕቃዎች" : "items"}`}
          subtitle={lang === "am" ? `ያልተሸጡ ዕቃዎች ጠቅላላ ግምት፦ ETB ${computedMetrics.totalUnsoldWorth.toLocaleString()}` : `Remaining Worth: ETB ${computedMetrics.totalUnsoldWorth.toLocaleString()}`}
          icon={BookMarked}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          title={lang === "am" ? "የዕቃዎች ሽያጭ ፍጥነት" : "Sell-Through Rate"}
          value={`${computedMetrics.sellThroughRate.toFixed(1)}%`}
          subtitle={lang === "am" ? "ከመጋዘን ውስጥ የተሸጠ ትክክለኛ ድርሻ" : "Ratio of sold items vs total inflow"}
          icon={Clock}
          bgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* 3. Action Card triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-emerald-50/70 to-emerald-100/30 border border-emerald-100 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-[#009b3a] text-white flex items-center justify-center shrink-0 shadow-md">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-[#009b3a]">
                {lang === "am" ? "አዲስ ዕቃ ክምችት መዝግብ" : "Add Stock Intake"}
              </h4>
              <p className="text-xs text-zinc-550 leading-relaxed mt-1">
                {lang === "am"
                  ? "አዳዲስ ወደ መጋዘን የገቡ እቃዎችን ስም፣ ፎቶ፣ የአንዱን ዋጋ እና ብዛታቸውን በቀላሉ ይመዝግቡ።"
                  : "Record new merchandise arrivals into your inventory system with pricing and images."}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenIntake}
            className="w-full sm:w-auto self-start px-6 h-12 bg-[#009b3a] hover:bg-[#008331] active:bg-[#007029] text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <Plus className="w-4.5 h-4.5 shrink-0" />
            <span>{lang === "am" ? "የዕቃ መመዝገቢያ ፎርም ክፈት" : "Open Intake Form"}</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-amber-50/70 to-amber-100/30 border border-amber-100 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-amber-600">
                {lang === "am" ? "የሽያጭ ምዝገባ" : "Record Sale"}
              </h4>
              <p className="text-xs text-zinc-550 leading-relaxed mt-1">
                {lang === "am"
                  ? "የተሸጡ እቃዎችን ዝርዝር፣ የክፍያ መንገድ (CBE Birr/Telebirr/በእጅ) በመጠቀም መዝግበው ቀሪ ያሻሽሉ።"
                  : "Log client purchases instantly. Adjust quantities and allocate payment options."}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSold}
            className="w-full sm:w-auto self-start px-6 h-12 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-4.5 h-4.5 shrink-0" />
            <span>{lang === "am" ? "የሽያጭ ምዝገባ" : "Record Sale"}</span>
          </button>
        </div>
      </div>

      {/* 4. Unified All-In-One Info Table with Functional Filters */}
      <div id="unified-master-table" className="bg-white border border-zinc-150 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
        
        {/* Title Head */}
        <div className="border-b border-zinc-100 pb-4">
          <h4 className="text-md sm:text-lg font-black text-zinc-900 flex items-center gap-2">
            <Layers3 className="w-5 h-5 text-emerald-600" />
            <span>
              {lang === "am" 
                ? "አጠቃላይ የዕቃዎች ክምችት፣ የሽያጭ እና የፋይናንስ ሪፖርት" 
                : "Consolidated Inventory, Sales & Finance Log"}
            </span>
          </h4>
          <p className="text-xs text-zinc-400 mt-1 font-semibold">
            {lang === "am"
              ? "ተያያዥነት ያላቸውን የዕቃ ግዥዎች፣ የክፍያ ሁኔታዎች፣ የሽያጭ መጠኖች እና ቀሪ እቃዎችን በአንድ ማዕከላዊ የቁጥጥር ሰሌዳ ላይ በተቀናጀ መልኩ ያስተዳድሩ።"
              : "A master ledger blending 1) Intake Stock, 2) Finance, 3) Sold Units, and 4) Unsold assets in one view."}
          </p>
        </div>

        {/* Search & Export Control Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 max-w-4xl bg-zinc-50/50 p-4 rounded-2xl border border-zinc-150">
          
          {/* Prominent Search Box */}
          <div className="flex-1 space-y-1.5">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider">
              {lang === "am" ? "በምርት ስም ፈልግ" : "Search Product Name"}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === "am" ? "በምርት ስም ፈልግ..." : "Search by product name..."}
                className="w-full min-h-[44px] pl-10 pr-4 border border-zinc-200 focus:border-[#009b3a] focus:ring-1 focus:ring-[#009b3a] rounded-xl text-xs font-bold outline-none bg-white transition-all duration-200"
              />
              <Search className="w-4.5 h-4.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Action Download PDF Button */}
          <div className="shrink-0">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="w-full md:w-auto min-h-[44px] px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-zinc-300 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer shadow-sm"
            >
              {isExporting ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  <span>{lang === "am" ? "በማዘጋጀት ላይ..." : "Exporting..."}</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>
                    {lang === "am" ? "የዕቃዎች ዝርዝር መግለጫ PDF አውርድ" : "Download Product Specs PDF"}
                  </span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Desktop Detailed Unified Grid Table */}
        <div className="hidden md:block overflow-x-auto border border-zinc-150 rounded-2xl">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] uppercase font-black text-zinc-400 select-none">
                <th className="py-3.5 px-3 font-mono w-[6%] text-left">
                  {lang === "am" ? "የዕቃው ፎቶ" : "Photo"}
                </th>
                <th className="py-3.5 px-3 font-mono w-[20%] text-left">
                  <span className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-700" onClick={() => { setSortBy("name"); setSortOrder(prev => prev === "asc" ? "desc" : "asc"); }}>
                    {lang === "am" ? "የዕቃው ስም" : "Item Name"}
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                  </span>
                </th>
                <th className="py-3.5 px-3 font-mono w-[11%] text-left">
                  <span className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-700" onClick={() => { setSortBy("date"); setSortOrder(prev => prev === "asc" ? "desc" : "asc"); }}>
                    {lang === "am" ? "ምዝገባ ቀን" : "Date"}
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                  </span>
                </th>
                <th className="py-3.5 px-3 font-mono w-[11%] text-right text-right-important pr-5">
                  {lang === "am" ? "የአንዱ ዕቃ ዋጋ" : "Unit Price"}
                </th>
                <th className="py-3.5 px-3 font-mono w-[11%] text-center">
                  <span className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-zinc-700" onClick={() => { setSortBy("total_price"); setSortOrder(prev => prev === "asc" ? "desc" : "asc"); }}>
                    {lang === "am" ? "አጠቃላይ ዕቃዎች" : "Total Items"}
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                  </span>
                </th>
                <th className="py-3.5 px-3 font-mono w-[11%] text-center">
                  <span className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-zinc-700" onClick={() => { setSortBy("sold"); setSortOrder(prev => prev === "asc" ? "desc" : "asc"); }}>
                    {lang === "am" ? "የተሸጡ ዕቃዎች" : "Sold Items"}
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                  </span>
                </th>
                <th className="py-3.5 px-3 font-mono w-[11%] text-center">
                  <span className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-zinc-700" onClick={() => { setSortBy("remaining"); setSortOrder(prev => prev === "asc" ? "desc" : "asc"); }}>
                    {lang === "am" ? "ያልተሸጡ" : "Unsold"}
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                  </span>
                </th>
                <th className="py-3.5 px-3 font-mono w-[11%] text-right text-right-important">
                  <span className="flex items-center justify-end gap-1.5 cursor-pointer hover:text-zinc-700" onClick={() => { setSortBy("total_price"); setSortOrder(prev => prev === "asc" ? "desc" : "asc"); }}>
                    {lang === "am" ? "ጠቅላላ ዋጋ" : "Total Price"}
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                  </span>
                </th>
                <th className="py-3.5 px-3 text-center font-mono w-[8%]">
                  {lang === "am" ? "ማስተካከያ" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {filteredAndSortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400 font-bold">
                    {lang === "am" ? "በማጣሪያው መሰረት ምንም ዕቃ አልተገኘም" : "No matching items found for these filters."}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const rem = p.quantity - (p.sold_quantity ?? 0);
                  const unitPrice = p.quantity > 0 ? (p.total_price / p.quantity) : 0;
                  const soldValue = (p.sold_quantity ?? 0) * unitPrice;
                  const remValue = rem * unitPrice;

                  return (
                    <tr key={p.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 text-sm transition duration-100">
                      
                      {/* Photo */}
                      <td className="p-3 text-left w-[6%]">
                        {p.product_image ? (
                          <img
                            src={p.product_image}
                            alt={p.product_name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded object-cover border border-zinc-200 bg-zinc-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center font-black uppercase text-xs flex-shrink-0">
                            {p.product_name.substring(0, 2)}
                          </div>
                        )}
                      </td>

                      {/* Item Name */}
                      <td className="p-3 text-left font-medium text-zinc-900 w-[20%]">
                        <span className="line-clamp-2">{p.product_name}</span>
                      </td>

                      {/* Date */}
                      <td className="p-3 text-left text-zinc-500 w-[11%] whitespace-nowrap">
                        🇪🇹 {formatEthiopianDate(toEthiopian(p.purchase_date), lang)}
                      </td>

                      {/* 4. የአንዱ ዕቃ ዋጋ */}
                      <td className="p-3 text-right font-mono text-zinc-900 w-[11%] pr-5">
                        ETB {Math.round(unitPrice).toLocaleString()}
                      </td>

                      {/* 1. የክምችት ዕቃዎች */}
                      <td className="p-3 text-center text-zinc-600 w-[11%]">
                        {p.quantity.toLocaleString()} {lang === "am" ? "ፍሬ" : "pcs"}
                      </td>

                      {/* 2. የተሸጡ ዕቃዎች */}
                      <td className="p-3 text-center w-[11%]">
                        {((p.sold_quantity ?? 0) === 0) ? (
                          <span className="text-zinc-400 font-medium">0 {lang === "am" ? "ፍሬ" : "pcs"}</span>
                        ) : (
                          <div className="leading-snug">
                            <span className="font-bold text-zinc-800 block">
                              {(p.sold_quantity ?? 0).toLocaleString()} {lang === "am" ? "ፍሬ" : "pcs"}
                            </span>
                            <span className="text-[10px] text-zinc-500 block">
                              ETB {soldValue.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 3. ያልተሸጡ ቀሪዎች */}
                      <td className="p-3 text-center w-[11%]">
                        {rem === 0 ? (
                          <span className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] font-bold inline-block">{lang === "am" ? "ያለቀ" : "Out"}</span>
                        ) : (
                          <div className="leading-snug">
                            <span className="font-bold text-zinc-800 block">
                              {rem.toLocaleString()} {lang === "am" ? "ፍሬ" : "pcs"}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium block">
                              ETB {remValue.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* ጠቅላላ ዋጋ */}
                      <td className="p-3 text-right font-bold text-zinc-900 w-[11%]">
                        ETB {p.total_price.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center w-[8%]">
                        <button
                          onClick={() => onViewProduct(p)}
                          className="px-3 h-8 bg-zinc-100 hover:bg-[#009b3a] hover:text-white hover:border-[#009b3a] active:scale-95 text-zinc-700 rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition border border-zinc-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{lang === "am" ? "ዝርዝር" : "View"}</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Bento Cards List */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredAndSortedProducts.length === 0 ? (
            <p className="py-8 text-center text-zinc-400 text-xs font-bold bg-zinc-50 rounded-2xl border border-zinc-100">
              {lang === "am" ? "በማጣሪያው መሰረት ምንም ዕቃ አልተገኘም" : "No matching items found for these filters."}
            </p>
          ) : (
            paginatedProducts.map((p) => {
              const rem = p.quantity - (p.sold_quantity ?? 0);
              const unitPrice = p.quantity > 0 ? (p.total_price / p.quantity) : 0;
              const soldValue = (p.sold_quantity ?? 0) * unitPrice;
              const remValue = rem * unitPrice;

              return (
                <div key={p.id} className="bg-white border border-zinc-150 rounded-3xl p-5 space-y-4 hover:shadow-md transition duration-200">
                  
                  {/* Card Header: Photo + Name + Date + Action */}
                  <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3.5">
                    <div className="flex items-center gap-3.5">
                      {p.product_image ? (
                        <img
                          src={p.product_image}
                          alt={p.product_name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-2xl object-cover border border-zinc-150 shrink-0 shadow-3xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-zinc-100 text-[#009b3a] flex items-center justify-center font-black uppercase text-xs shrink-0 border border-emerald-500/10">
                          {p.product_name.substring(0, 2)}
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <h5 className="font-black text-zinc-900 text-sm leading-snug line-clamp-2">{p.product_name}</h5>
                        <span className="text-[10px] text-zinc-400 font-bold block">
                          🇪🇹 {formatEthiopianDate(toEthiopian(p.purchase_date), lang)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onViewProduct(p)}
                      className="px-3 h-8.5 bg-zinc-50 hover:bg-[#009b3a] hover:text-white hover:border-[#009b3a] text-zinc-700 text-[10px] font-black rounded-xl transition overflow-hidden shrink-0 border border-zinc-200 flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{lang === "am" ? "ዝርዝር" : "View"}</span>
                    </button>
                  </div>

                  {/* Financial Overview (Unit Price & Total Price) */}
                  <div className="grid grid-cols-2 gap-3 pb-1">
                    <div className="bg-zinc-50/50 p-3 rounded-2xl border border-zinc-100">
                      <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider block">
                        {lang === "am" ? "የአንዱ ዕቃ ዋጋ" : "Unit Price"}
                      </span>
                      <span className="text-sm font-black text-zinc-850 mt-1 block">
                        ETB {Math.round(unitPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-emerald-50/30 p-3 rounded-2xl border border-emerald-100/30">
                      <span className="text-[9px] text-[#009b3a] font-extrabold uppercase tracking-wider block">
                        {lang === "am" ? "ጠቅላላ ዋጋ" : "Total Price"}
                      </span>
                      <span className="text-sm font-black text-emerald-800 mt-1 block">
                        ETB {p.total_price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Stock Details Bento-style Grid (3 Columns) */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* 1. የክምችት ዕቃዎች */}
                    <div className="bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-100 flex flex-col justify-between">
                      <span className="text-[8px] text-zinc-400 font-black uppercase tracking-wider leading-none">
                        {lang === "am" ? "አጠቃላይ ዕቃዎች" : "Total Items"}
                      </span>
                      <span className="text-xs font-black text-zinc-800 mt-2 block">
                        {p.quantity.toLocaleString()} {lang === "am" ? "ፍሬ" : "pcs"}
                      </span>
                    </div>

                    {/* 2. የተሸጡ ዕቃዎች */}
                    <div className="bg-amber-50/30 p-2.5 rounded-xl border border-amber-100/30 flex flex-col justify-between">
                      <span className="text-[8px] text-amber-800 font-black uppercase tracking-wider leading-none">
                        {lang === "am" ? "የተሸጡ ዕቃዎች" : "Sold Items"}
                      </span>
                      <div className="mt-2">
                        <span className="text-xs font-black text-amber-700 block">
                          {(p.sold_quantity ?? 0).toLocaleString()} {lang === "am" ? "ፍሬ" : "pcs"}
                        </span>
                        <span className="text-[8px] text-amber-600/80 font-bold block mt-0.5">
                          ETB {soldValue.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* 3. ያልተሸጡ ቀሪዎች */}
                    <div className="bg-indigo-50/30 p-2.5 rounded-xl border border-indigo-100/30 flex flex-col justify-between">
                      <span className="text-[8px] text-indigo-900 font-black uppercase tracking-wider leading-none">
                        {lang === "am" ? "ያልተሸጡ" : "Unsold"}
                      </span>
                      <div className="mt-2">
                        <span className="text-xs font-black text-indigo-950 block">
                          {rem === 0 ? (
                            <span className="text-rose-500 font-extrabold bg-rose-50 px-1 py-0.5 rounded text-[8px] uppercase tracking-wide inline-block">{lang === "am" ? "ያለቀ" : "Out"}</span>
                          ) : (
                            <span>{rem.toLocaleString()} {lang === "am" ? "ፍሬ" : "pcs"}</span>
                          )}
                        </span>
                        {rem > 0 && (
                          <span className="text-[8px] text-indigo-800/80 font-bold block mt-0.5">
                            ETB {remValue.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t border-zinc-100 select-none">
            <span className="text-xs text-zinc-500 font-bold">
              {lang === "am" 
                ? `ገጽ ${currentPage} ከ ${totalPages} (የዕቃዎች ቁጥር ${((currentPage - 1) * itemsPerPage) + 1} - ${Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)} ከ ${filteredAndSortedProducts.length})`
                : `Page ${currentPage} of ${totalPages} (Showing ${((currentPage - 1) * itemsPerPage) + 1} - ${Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)} of ${filteredAndSortedProducts.length})`
              }
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 text-zinc-650 disabled:hover:bg-transparent rounded-lg text-xs font-black transition cursor-pointer"
                title={lang === "am" ? "የመጀመሪያው ገጽ" : "First Page"}
              >
                {lang === "am" ? "መጀመሪያ" : "First"}
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 text-zinc-650 disabled:hover:bg-transparent rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{lang === "am" ? "ቀዳሚ" : "Prev"}</span>
              </button>
              
              {/* Dynamic Page Numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  // Double check safety
                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all duration-150 cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "border border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 text-zinc-650 disabled:hover:bg-transparent rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1"
              >
                <span>{lang === "am" ? "ቀጣይ" : "Next"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 border border-zinc-205 hover:bg-zinc-50 disabled:opacity-40 text-zinc-650 disabled:hover:bg-transparent rounded-lg text-xs font-black transition cursor-pointer"
                title={lang === "am" ? "የመጨረሻው ገጽ" : "Last Page"}
              >
                {lang === "am" ? "መጨረሻ" : "Last"}
              </button>
            </div>
          </div>
        )}

        {/* Footer info counts */}
        <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold pt-2 border-t border-zinc-50">
          <span>
            {lang === "am" 
              ? `በጠቅላላው ከያዝነው ${products.length} ምርት ዝርዝር ውስጥ` 
              : `Total entries in database: ${products.length}`}
          </span>
          <span>
            {lang === "am" 
              ? `ማጣሪያ ያገኘው፦ ${filteredAndSortedProducts.length}` 
              : `Filtered shown: ${filteredAndSortedProducts.length}`}
          </span>
        </div>

      </div>
    </div>
  );
}
