import React, { useState, useEffect } from "react";
import { User, Product, AnalyticsResponse, Sale } from "../types";
import { api } from "../services/api";
import { toEthiopian, formatEthiopianDate, formatDoubleDate, ETHIOPIAN_MONTHS_EN, ETHIOPIAN_MONTHS_AM, getEthiopianTime, getLocalGregorianDate } from "../utils/ethiopianCalendar";
import { generateInventoryPDF, generateConsolidatedPDF } from "../utils/pdfGenerator";
import MetricCard from "../components/MetricCard";
import ProductFormModal from "../components/ProductFormModal";
import SoldProductFormModal from "../components/SoldProductFormModal";
import DashboardAnalyticsCharts from "../components/DashboardAnalyticsCharts";
import EthiopianDatePicker from "../components/EthiopianDatePicker";
import MainFeaturesTab from "../components/MainFeaturesTab";
import FinanceTab from "../components/FinanceTab";
import SoldTab from "../components/SoldTab";
import UnsoldTab from "../components/UnsoldTab";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Language, translations } from "../utils/translations";
import {
  Search,
  Plus,
  Compass,
  FileDown,
  Trash2,
  Edit,
  Eye,
  LogOut,
  Clock,
  RefreshCcw,
  BookMarked,
  Layers,
  Sparkles,
  X,
  Globe,
  Calendar,
  ShoppingBag,
  Cloud
} from "lucide-react";

interface DashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
  onNavigate: (route: "login" | "register" | "dashboard") => void;
  lang: Language;
  onLanguageToggle: () => void;
}

export default function Dashboard({ user, token, onLogout, onNavigate, lang, onLanguageToggle }: DashboardProps) {
  // Navigation tabs of Dashboard - 5 tabs: dashboard, inventory, finance, sold, unsold
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "finance" | "sold" | "unsold">("dashboard");

  // Core data states
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  // Filter/Search and pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Ethiopian date and period filter states
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("All");
  const [filterYear, setFilterYear] = useState("All");

  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedMonth, setAppliedMonth] = useState("All");
  const [appliedYear, setAppliedYear] = useState("All");
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals operations controllers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSoldFormOpen, setIsSoldFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  
  // Custom states
  const [activeClock, setActiveClock] = useState("");
  const [etTodayStr, setEtTodayStr] = useState("");
  const [etTimeStr, setEtTimeStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successBanner, setSuccessBanner] = useState("");
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [supabaseLoading, setSupabaseLoading] = useState(false);

  // Confirmation state for deletes
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);

  // Image zoom modal preview
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const t = translations[lang];
  const isCloudActive = supabaseStatus?.isConfigured && supabaseStatus?.success;

  // Synchronous client-side computed stats matching accurate and instant Ethiopian Calendar logic
  const computedTimeStats = React.useMemo(() => {
    // 1. Find Ethiopian Date today
    const now = new Date();
    const gY = now.getFullYear();
    const gM = String(now.getMonth() + 1).padStart(2, '0');
    const gD = String(now.getDate()).padStart(2, '0');
    const todayEtStr = `${gY}-${gM}-${gD}`;
    const etToday = toEthiopian(todayEtStr);

    // 2. Determine start of current week (Monday to Sunday)
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    let dayQty = 0;
    let dayVal = 0;
    let weekQty = 0;
    let weekVal = 0;
    let monthQty = 0;
    let monthVal = 0;

    sales.forEach(s => {
      // Parse sale_date
      let sEt;
      try {
        sEt = toEthiopian(s.sale_date);
      } catch {
        return;
      }

      // Today filter: exact Ethiopian year, month, day match
      if (sEt.year === etToday.year && sEt.month === etToday.month && sEt.day === etToday.day) {
        dayQty += s.quantity;
        dayVal += (s.total_price || 0);
      }

      // Week filter: Gregorian sale_date must be >= Monday of this week
      try {
        const parts = s.sale_date.split("-");
        if (parts.length === 3) {
          const yr = parseInt(parts[0], 10);
          const mo = parseInt(parts[1], 10) - 1;
          const dy = parseInt(parts[2], 10);
          const pDate = new Date(yr, mo, dy);
          pDate.setHours(0, 0, 0, 0);
          if (pDate.getTime() >= monday.getTime()) {
            weekQty += s.quantity;
            weekVal += (s.total_price || 0);
          }
        }
      } catch (e) {
        // Safe failover
      }

      // Month filter: exact Ethiopian Year and Month match
      if (sEt.year === etToday.year && sEt.month === etToday.month) {
        monthQty += s.quantity;
        monthVal += (s.total_price || 0);
      }
    });

    return {
      day: { qty: dayQty, val: dayVal },
      week: { qty: weekQty, val: weekVal },
      month: { qty: monthQty, val: monthVal }
    };
  }, [sales]);

  // Live dual clock trigger
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // time string
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      // greg date
      const grStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      setActiveClock(`${grStr} - ${timeStr}`);

      // Ethiopian date today
      const grISO = getLocalGregorianDate(now);
      const etDate = toEthiopian(grISO);
      setEtTodayStr(formatEthiopianDate(etDate, lang));
      setEtTimeStr(getEthiopianTime(now, lang));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const fetchSupabaseStatus = async () => {
    setSupabaseLoading(true);
    try {
      const status = await api.getSupabaseStatus();
      setSupabaseStatus(status);
    } catch (err: any) {
      console.error("Failed to fetch Supabase status inside Dashboard parent:", err);
    } finally {
      setSupabaseLoading(false);
    }
  };

  // Hydrate all database objects securely
  const loadDashboardData = async () => {
    setLoading(true);
    setErrorText("");
    try {
      // 1. Fetch ALL products without filtering to keep complete inventory active across all tabs
      const productsData = await api.getProducts({});
      setProducts(productsData);

      // 2. Fetch sales
      const salesData = await api.getSales();
      setSales(salesData);

      // 3. Fetch system analytics metrics
      const analyticsData = await api.getAnalytics();
      setAnalytics(analyticsData);
    } catch (err: any) {
      setErrorText(err.message || "Failed to synchronise dashboard items.");
    } finally {
      setLoading(false);
    }
  };

  // Re-load on mount only, as search & filters are now computed client-side
  useEffect(() => {
    loadDashboardData();
    fetchSupabaseStatus();
  }, []);

  // Handle core product additions and modifications (CRUD triggers)
  const handleProductSubmit = async (formData: any) => {
    try {
      if (editingProduct) {
        // Run update query
        await api.updateProduct(editingProduct.id, formData);
        showBannerNotification(
          lang === "am" 
            ? `በተሳካ ሁኔታ የዕቃው ዝርዝር ተሻሽሏል፦ ${formData.product_name}` 
            : `Upgrades published successfully for: ${formData.product_name}`
        );
      } else {
        // Run creation query
        await api.createProduct(formData);
        showBannerNotification(
          lang === "am" 
            ? `አዲስ መጋዘን ዕቃ በተሳካ ሁኔታ ተመዝግቧል፦ ${formData.product_name}` 
            : `Recorded stock entry successfully: ${formData.product_name}`
        );
      }
      setIsFormOpen(false);
      setEditingProduct(null);
      loadDashboardData(); // Refresh metrics instantly
    } catch (err: any) {
      throw new Error(err.message || "Operation failed.");
    }
  };

  // Handle sold products recording
  const handleSoldProductSubmit = async (
    productId: string, 
    soldQty: number, 
    paymentMethod: "CBE Birr" | "Telebirr" | "Cash", 
    customUnitPrice?: number, 
    saleDate?: string,
    receiptImage?: string
  ) => {
    try {
      const targetProduct = products.find(p => p.id === productId);
      if (!targetProduct) {
        throw new Error(lang === "am" ? "ዕቃው አልተገኘም።" : "Product not found.");
      }

      const newSoldQty = (targetProduct.sold_quantity ?? 0) + soldQty;
      if (newSoldQty > targetProduct.quantity) {
        throw new Error(
          lang === "am"
            ? `ይቅርታ! የተሸጡ ዕቃዎች ጠቅላላ ብዛት (${newSoldQty}) ከያዘው ክምችት (${targetProduct.quantity}) መብለጥ አይችልም።`
            : `Total sold quantity (${newSoldQty}) exceeds stock levels (${targetProduct.quantity}).`
        );
      }

      const unitPriceVal = customUnitPrice ?? (targetProduct.quantity > 0 ? Math.round(targetProduct.total_price / targetProduct.quantity) : targetProduct.total_price);
      const totalPriceVal = soldQty * unitPriceVal;

      await api.createSale({
        product_id: productId,
        product_name: targetProduct.product_name,
        quantity: soldQty,
        unit_price: unitPriceVal,
        total_price: totalPriceVal,
        sale_date: saleDate || getLocalGregorianDate(),
        payment_method: paymentMethod,
        receipt_image: receiptImage || targetProduct.receipt_image
      });

      showBannerNotification(
        lang === "am"
          ? `የሽያጭ ምዝገባ በተሳካ ሁኔታ ተጠናቋል፦ ${soldQty} ${targetProduct.product_name}`
          : `Sales transaction completed successfully: ${soldQty} x ${targetProduct.product_name}`
      );

      loadDashboardData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to submit sale.");
    }
  };

  // Confirm delete sale handler
  const triggerDeleteSale = async (id: string) => {
    try {
      await api.deleteSale(id);
      showBannerNotification(
        lang === "am" 
          ? `የሽያጭ መዝገብ በተሳካ ሁኔታ ተሰርዟል` 
          : `Sales transaction record deleted.`
      );
      setDeletingSaleId(null);
      loadDashboardData();
    } catch (err: any) {
      setErrorText(err.message || "Failed to remove sales record.");
    }
  };

  // Confirm delete handler
  const triggerDeleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      showBannerNotification(
        lang === "am" 
          ? `የዕቃው ምዝገባ በተሳካ ሁኔታ ተሰርዟል` 
          : `Stock record deleted from list.`
      );
      setDeletingProductId(null);
      loadDashboardData();
    } catch (err: any) {
      setErrorText(err.message || "Failed to remove product item.");
    }
  };

  // Export consolidated PDF report for the Finance tab with active date and search filters
  const triggerPDFExport = async () => {
    try {
      // Log event first
      await api.logEvent(
        "PDF_REPORT_EXPORT",
        "REPORT",
        "FINANCIAL_CONSOLIDATED",
        `Exported financial consolidated report having ${filteredProducts.length} filtered stock items`
      );
      
      await generateConsolidatedPDF(
        filteredProducts,
        sales,
        {
          searchTerm: searchQuery,
          paymentMethod: paymentFilter,
          stockStatus: statusFilter
        },
        lang,
        user.name || "Manager"
      );
    } catch (err: any) {
      setErrorText("Failed to export financial report file.");
    }
  };

  // Action feedback alert utility
  const showBannerNotification = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner("");
    }, 4500);
  };

  const handleEditClick = (prod: Product) => {
    setEditingProduct(prod);
    setIsFormOpen(true);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
  };

  const handleApplyFilter = () => {
    setAppliedStartDate(filterStartDate);
    setAppliedEndDate(filterEndDate);
    setAppliedMonth(filterMonth);
    setAppliedYear(filterYear);
    setIsFilterApplied(true);
    setCurrentPage(1);
    showBannerNotification(
      lang === "am" 
        ? "የኢትዮጵያ ቀን ዘመን ማጣሪያ በተሳካ ሁኔታ ተተግብሯል።" 
        : "Ethiopian Calendar Date Filters applied successfully."
    );
  };

  const handleResetFilter = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterMonth("All");
    setFilterYear("All");

    setAppliedStartDate("");
    setAppliedEndDate("");
    setAppliedMonth("All");
    setAppliedYear("All");
    setIsFilterApplied(false);
    setCurrentPage(1);
    showBannerNotification(
      lang === "am" 
        ? "ሁሉም ማጣሪያዎች ተነስተዋል።" 
        : "All filters reset successfully."
    );
  };

  // Custom client-side Ethiopian date, search, status, payment filter, and sorting
  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    // 1. Search Query Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => p.product_name.toLowerCase().includes(q));
    }

    // 2. Payment Method Filter
    if (paymentFilter !== "All") {
      result = result.filter(p => p.payment_method === paymentFilter);
    }

    // 3. Status Filter (FullySold/UnsoldOnly)
    if (statusFilter === "UnsoldOnly") {
      result = result.filter(p => (p.quantity - (p.sold_quantity ?? 0)) > 0);
    } else if (statusFilter === "FullySold") {
      result = result.filter(p => p.quantity > 0 && p.quantity === (p.sold_quantity ?? 0));
    }

    // 4. Custom Ethiopian Date Filters
    if (isFilterApplied) {
      result = result.filter(p => {
        let pEt;
        try {
          pEt = toEthiopian(p.purchase_date);
        } catch {
          return false;
        }

        // ከ (From Date)
        if (appliedStartDate && p.purchase_date < appliedStartDate) {
          return false;
        }

        // እስከ (To Date)
        if (appliedEndDate && p.purchase_date > appliedEndDate) {
          return false;
        }

        // ወር (Ethiopian Month)
        if (appliedMonth !== "All") {
          const targetMonth = parseInt(appliedMonth, 10);
          if (pEt.month !== targetMonth) {
            return false;
          }
        }

        // ዓመት (Ethiopian Year)
        if (appliedYear !== "All") {
          const targetYear = parseInt(appliedYear, 10);
          if (pEt.year !== targetYear) {
            return false;
          }
        }

        return true;
      });
    }

    // 5. Client-Side Sorting
    if (sortBy) {
      const order = sortOrder === "desc" ? -1 : 1;
      result.sort((a, b) => {
        let valA: any = a[sortBy as keyof Product];
        let valB: any = b[sortBy as keyof Product];

        // Specific overrides or calculations if needed
        if (sortBy === "unit_price") {
          valA = a.quantity > 0 ? (a.total_price / a.quantity) : 0;
          valB = b.quantity > 0 ? (b.total_price / b.quantity) : 0;
        } else if (sortBy === "remaining") {
          valA = a.quantity - (a.sold_quantity ?? 0);
          valB = b.quantity - (b.sold_quantity ?? 0);
        } else if (sortBy === "created_at") {
          // Date comparison
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
        }

        if (valA == null) return order;
        if (valB == null) return -order;
        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
      });
    }

    return result;
  }, [products, searchQuery, paymentFilter, statusFilter, isFilterApplied, appliedStartDate, appliedEndDate, appliedMonth, appliedYear, sortBy, sortOrder]);

  // Pagination bounds calculator
  const paginatedProducts = React.useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredProducts, currentPage]);

  const totalPages = React.useMemo(() => {
    return Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  }, [filteredProducts]);

  // Combined calculations for Sold, Unsold, and Inflow Registered Stock parameters
  const computedMetrics = React.useMemo(() => {
    let inflowQty = 0;
    let inflowWorth = 0;

    let soldQty = 0;
    let soldWorth = 0;

    let unsoldQty = 0;
    let unsoldWorth = 0;

    products.forEach((p) => {
      inflowQty += p.quantity;
      inflowWorth += (p.total_price || 0);

      const unitPrice = p.quantity > 0 ? (p.total_price / p.quantity) : 0;
      const sq = p.sold_quantity ?? 0;
      const remaining = p.quantity - sq;
      unsoldQty += remaining;
      unsoldWorth += remaining * unitPrice;
    });

    sales.forEach((s) => {
      soldQty += s.quantity;
      soldWorth += s.total_price;
    });

    const sellThroughRate = inflowQty > 0 ? Math.round((soldQty / inflowQty) * 100) : 0;

    return {
      totalInflowQty: inflowQty,
      totalInflowWorth: Math.round(inflowWorth),
      totalSoldQty: soldQty,
      totalSoldWorth: Math.round(soldWorth),
      totalUnsoldQty: unsoldQty,
      totalUnsoldWorth: Math.round(unsoldWorth),
      sellThroughRate,
    };
  }, [products, sales]);

  const renderTemporalMetrics = () => {
    return (
      <div className="bg-gradient-to-br from-emerald-500/10 via-zinc-100/30 to-zinc-50 border border-emerald-500/15 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div>
            <h4 className="text-md sm:text-lg font-black text-zinc-900 leading-tight">
              {lang === "am" ? "የዕቃዎች ሽያጭና ግልጋሎት የፋይናንስ መግለጫ (በኢትዮጵያ ዘመን አቆጣጠር)" : "Ethiopian Calendar Financial & Sales Performance"}
            </h4>
            <p className="text-xs text-zinc-400 font-semibold mt-1 font-mono uppercase tracking-wider">
              {lang === "am" ? "የተሸጡ ዕቃዎች ፈጣን የትንታኔ መረጃዎች" : "Real-time Ethiopian calendar analytics overview"}
            </p>
          </div>
          <div className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-black rounded-xl font-sans shadow-sm flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 animate-spin-slow shrink-0" />
            <span>{etTodayStr || (lang === "am" ? "በመጫን ላይ..." : "Loading...")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Today */}
          <div className="p-5 bg-white border border-zinc-200/65 rounded-2xl shadow-xs hover:shadow-sm transition duration-200 hover:border-emerald-500/40">
            <div className="flex justify-between items-start mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 text-white text-[9px] font-extrabold uppercase tracking-wider font-sans">
                {lang === "am" ? "ዛሬ" : "Today"}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono font-bold">
                {etTodayStr}
              </span>
            </div>
            
            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">
                  {lang === "am" ? "የዛሬ ገቢ ብር" : "Today's Revenue"}
                </span>
                <span className="text-lg sm:text-xl font-black text-zinc-900 font-sans block mt-0.5">
                  ETB {computedTimeStats.day.val.toLocaleString()}
                </span>
              </div>
              
              <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                <span className="text-[10px] text-zinc-450 font-bold block">
                  {lang === "am" ? "ዛሬ የተሸጡ እቃዎች ብዛት" : "Today's Sold Items Qty"}
                </span>
                <span className="text-xs font-bold text-zinc-950 font-mono">
                  {computedTimeStats.day.qty.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: This Week */}
          <div className="p-5 bg-white border border-zinc-200/65 rounded-2xl shadow-xs hover:shadow-sm transition duration-200 hover:border-emerald-500/40">
            <div className="flex justify-between items-start mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase tracking-wider font-sans">
                {lang === "am" ? "በዚህ ሳምንት" : "This Week"}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono font-bold">
                {lang === "am" ? "ሰኞ - እሑድ" : "Mon - Sun"}
              </span>
            </div>
            
            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">
                  {lang === "am" ? "የዚህ ሳምንት ገቢ ብር" : "This Week's Revenue"}
                </span>
                <span className="text-lg sm:text-xl font-black text-emerald-700 font-sans block mt-0.5">
                  ETB {computedTimeStats.week.val.toLocaleString()}
                </span>
              </div>
              
              <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                <span className="text-[10px] text-zinc-450 font-bold block">
                  {lang === "am" ? "ከተሸጡ እቃዎች ብዛት" : "Sold Items Qty"}
                </span>
                <span className="text-xs font-bold text-zinc-950 font-mono">
                  {computedTimeStats.week.qty.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: This Month */}
          <div className="p-5 bg-white border border-zinc-200/65 rounded-2xl shadow-xs hover:shadow-sm transition duration-200 hover:border-emerald-500/40">
            <div className="flex justify-between items-start mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-extrabold uppercase tracking-wider font-sans">
                {lang === "am" ? "በዚህ ወር" : "This Month"}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono font-bold">
                {lang === "am" ? "የኢትዮጵያ ወር" : "Eth Month"}
              </span>
            </div>
            
            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">
                  {lang === "am" ? "የዚህ ወር ገቢ ብር" : "This Month's Revenue"}
                </span>
                <span className="text-lg sm:text-xl font-black text-indigo-700 font-sans block mt-0.5">
                  ETB {computedTimeStats.month.val.toLocaleString()}
                </span>
              </div>
              
              <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                <span className="text-[10px] text-zinc-450 font-bold block">
                  {lang === "am" ? "ከተሸጡ እቃዎች ብዛት" : "Sold Items Qty"}
                </span>
                <span className="text-xs font-bold text-zinc-950 font-mono">
                  {computedTimeStats.month.qty.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col font-sans">
      
      {/* 1. Header Toolbar */}
      <header className="px-4 sm:px-6 md:px-12 py-4 bg-white border-b border-zinc-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 sticky top-0 z-40 shadow-sm">
        
        {/* Brand identity area and language switch */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold font-mono">D</span>
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-zinc-900 block leading-none">{t.appName}</span>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5 block">{t.appSubtitle}</span>
            </div>
          </div>

          {/* Quick toggle Language inside Header */}
          <button
            onClick={onLanguageToggle}
            className="px-2.5 py-1.5 text-[11px] font-bold uppercase bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/50 rounded-xl text-zinc-700 transition flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
            <span>{lang === "en" ? "አማርኛ" : "English"}</span>
          </button>
        </div>

        {/* Live dual system clock (Hidden on tiny mobile screens for elegant layout) */}
        <div className="hidden sm:flex items-center gap-3 bg-zinc-50 border border-zinc-100 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl self-start md:self-auto shadow-sm">
          <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
          <div className="text-left leading-none">
            <span className="text-[10px] md:text-[11px] font-extrabold text-zinc-900 font-mono block">{etTodayStr} • {etTimeStr}</span>
            <span className="text-[8.5px] md:text-[9.5px] font-medium text-zinc-400 font-mono block mt-0.5">{activeClock}</span>
          </div>
        </div>

        {/* Disconnect/Logout action */}
        <div className="flex items-center justify-end gap-3.5">
          <button
            onClick={onLogout}
            title={t.disconnectPanel}
            className="p-2 sm:p-2.5 rounded-full hover:bg-rose-50 hover:text-rose-600 text-zinc-400 transition duration-150 border border-zinc-100 bg-white shadow-sm flex items-center justify-center focus:outline-none cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Primary Layout Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-12 pt-6 pb-28 md:py-8 flex flex-col gap-6 md:gap-8">
        
        {/* Banner notifications */}
        {successBanner && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-bounce" />
            <span>{successBanner}</span>
          </div>
        )}

        {errorText && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-semibold">
            {errorText}
          </div>
        )}

        {/* Header navigation tab selectors (Removed "Auditing Ledgers") */}
        <div className="hidden md:flex border-b border-zinc-200 gap-1 pb-px overflow-x-auto text-[11px] font-black uppercase tracking-wider text-zinc-400 select-none scrollbar-none scroll-smooth">
          {([
            { id: "dashboard", label: lang === "am" ? "ዋና የቁጥጥር ሰሌዳ" : "Main Dashboard", icon: Compass },
            { id: "inventory", label: lang === "am" ? "የአዲስ ዕቃ ክምችት ቁጥጥር ሥርዓት" : "New Stock Intake Control System", icon: Layers },
            { id: "finance", label: lang === "am" ? "የፋይናንስ ትንታኔ ሪፖርቶች" : "Financial Reports", icon: Clock },
            { id: "sold", label: lang === "am" ? "የተሸጡ ዕቃዎች" : "Sold Goods Ledger", icon: ShoppingBag },
            { id: "unsold", label: lang === "am" ? "ያልተሸጡ ቀሪ ዕቃዎች" : "Unsold Remaining Assets", icon: BookMarked }
          ] as const).map((tb) => {
            const Icon = tb.icon;
            const isActive = activeTab === tb.id;
            return (
              <button
                key={tb.id}
                onClick={() => {
                  setActiveTab(tb.id);
                  setCurrentPage(1);
                }}
                className={`pb-3.5 px-4 transition-all border-b-2 shrink-0 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "border-[#009b3a] text-[#009b3a] font-black"
                    : "border-transparent hover:text-zinc-650 hover:border-zinc-300"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "animate-pulse" : ""}`} />
                <span>{tb.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. CONDITIONAL MODULE LOADING */}

        {/* Tab 1: Main Features Dashboard */}
        {activeTab === "dashboard" && (
          <MainFeaturesTab
            user={user}
            products={products}
            computedMetrics={computedMetrics}
            lang={lang}
            etTodayStr={etTodayStr}
            etTimeStr={etTimeStr}
            activeClock={activeClock}
            onOpenIntake={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            onOpenSold={() => setIsSoldFormOpen(true)}
            onViewProduct={setViewingProduct}
            onEditProduct={handleEditClick}
            onTabChange={setActiveTab}
            onSyncSuccess={loadDashboardData}
          />
        )}

        {/* Tab 3: Finance Analytics Reports */}
        {activeTab === "finance" && (
          <FinanceTab
            products={filteredProducts}
            sales={sales}
            analytics={analytics}
            loading={loading}
            lang={lang}
            etTodayStr={etTodayStr}
            filterStartDate={filterStartDate}
            setFilterStartDate={setFilterStartDate}
            filterEndDate={filterEndDate}
            setFilterEndDate={setFilterEndDate}
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
            filterYear={filterYear}
            setFilterYear={setFilterYear}
            isFilterApplied={isFilterApplied}
            handleApplyFilter={handleApplyFilter}
            handleResetFilter={handleResetFilter}
            triggerPDFExport={triggerPDFExport}
            isCloudActive={isCloudActive}
            supabaseStatus={supabaseStatus}
          />
        )}

        {/* Tab 4: Sold Stock Listing & Progression Bar Charts */}
        {activeTab === "sold" && (
          <SoldTab
            products={products}
            sales={sales}
            computedMetrics={computedMetrics}
            lang={lang}
            setIsSoldFormOpen={setIsSoldFormOpen}
            setViewingProduct={setViewingProduct}
            formatEthiopianDate={(d) => {
              const et = toEthiopian(d);
              return formatEthiopianDate(et, lang);
            }}
            onEditClick={handleEditClick}
            onDeleteClick={(id) => setDeletingSaleId(id)}
            user={user}
            isCloudActive={isCloudActive}
          />
        )}

        {/* Tab 5: Unsold / Remaining stock asset tracking ledger */}
        {activeTab === "unsold" && (
          <UnsoldTab
            products={products}
            computedMetrics={computedMetrics}
            lang={lang}
            setViewingProduct={setViewingProduct}
            formatEthiopianDate={(d) => {
              const et = toEthiopian(d);
              return formatEthiopianDate(et, lang);
            }}
            user={user}
            isCloudActive={isCloudActive}
          />
        )}

        {/* Tab 2: Stock inventory listing matrix (የአዲስ ዕቃ ክምችት አስተዳደር) */}
        {activeTab === "inventory" && (
          <div className="space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header section with register action button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900">
                    {lang === "am" ? "የአዲስ ዕቃ ክምችት ቁጥጥር ሥርዓት" : "New Stock Intake Control System"}
                  </h3>
                  {isCloudActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-extrabold uppercase rounded-full tracking-wider shadow-3xs select-none">
                      <Cloud className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{lang === "am" ? "ደመና-የተመሳሰለ" : "Synced"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-50 border border-zinc-200 text-zinc-500 text-[9px] font-extrabold uppercase rounded-full tracking-wider select-none">
                      <Cloud className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span>{lang === "am" ? "አከባቢ" : "Offline"}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-medium">
                  {lang === "am" ? "በመጋዘን እንቅስቃሴዎች ላይ ተመስርተው የዕቃ ቅበላ ሰነዶችንና ሪከርዶችን ጥራታቸውን በጠበቀ መልኩ ያደራጁ።" : "Organize item intake documents and records based on warehouse movements."}
                </p>
              </div>

              {/* Record intake action */}
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsFormOpen(true);
                }}
                className="min-h-[48px] px-6 bg-[#009b3a] hover:bg-[#008331] active:bg-[#007029] text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2.5 shadow-md active:scale-95 transition cursor-pointer shrink-0"
              >
                <Plus className="w-4.5 h-4.5 shrink-0" />
                <span>{lang === "am" ? "አዲስ ዕቃ ክምችት መሙያ ፎርም" : "Record Intake"}</span>
              </button>
            </div>

            {/* Inventory control filter tools row */}
            <div className="bg-white border border-zinc-100 rounded-3xl p-5 sm:p-6 shadow-[0_4px_25px_rgb(0,0,0,0.01)] flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
              
              {/* Left Side Inputs: Search query */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
                {/* Search Product input */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full min-h-[48px] pl-11 pr-14 text-[13px] bg-zinc-50 border-2 border-zinc-100 focus:border-[#009b3a] focus:bg-white rounded-2xl focus:ring-1 focus:ring-[#009b3a] focus:outline-none transition-all duration-200 font-semibold text-zinc-800 placeholder-zinc-400"
                  />
                  {searchQuery && (
                    <button 
                      onClick={handleSearchClear} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 hover:text-zinc-700 font-extrabold uppercase bg-zinc-100/60 hover:bg-zinc-150 px-2 py-1 rounded-lg transition"
                    >
                      {t.clearBtn}
                    </button>
                  )}
                </div>
              </div>

              {/* Right Side Control Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Refresh Database Feed */}
                <button
                  onClick={loadDashboardData}
                  title="Refresh Database Feed"
                  className="w-12 min-h-[48px] bg-zinc-50 border-2 border-zinc-100 text-zinc-600 rounded-2xl hover:bg-zinc-100 active:bg-zinc-150 transition-all duration-155 flex items-center justify-center shadow-xs focus:outline-none cursor-pointer"
                >
                  <RefreshCcw className={`w-4.5 h-4.5 ${loading ? "animate-spin" : ""}`} />
                </button>

                {/* Export matched PDF report sets */}
                <button
                  onClick={triggerPDFExport}
                  disabled={filteredProducts.length === 0}
                  className="min-h-[48px] px-5 bg-zinc-50 border-2 border-zinc-100 hover:bg-zinc-100 active:bg-zinc-150 text-zinc-700 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all duration-155 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <FileDown className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{t.pdfExportReport}</span>
                </button>
              </div>

            </div>

            {/* Unified Ingested Stock table display */}
            <div className="bg-white border border-zinc-105 rounded-3xl shadow-[0_4px_25px_rgb(0,0,0,0.01)] overflow-hidden">
              {loading ? (
                <div className="p-10 space-y-4">
                  <div className="h-6 bg-zinc-100 rounded-xl animate-pulse w-1/4" />
                  <div className="h-12 bg-zinc-50 rounded-xl animate-pulse" />
                  <div className="h-12 bg-zinc-50 rounded-xl animate-pulse" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mx-auto text-zinc-400 border border-zinc-100">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-800">{t.zeroStockLines}</h4>
                    <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1 font-medium">{t.zeroStockDesc}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* (A) Table for Medium & Desktop Screens */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-100 bg-[#fafafa]/50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          <th className="py-4.5 px-6">{lang === "am" ? "የዕቃው ስም" : "Product Name"}</th>
                          <th className="py-4.5 px-4 text-center">{lang === "am" ? "የዕቃው ፎቶ" : "Product Photo"}</th>
                          <th className="py-4.5 px-4 text-center">{lang === "am" ? "የዕቃው ብዛት" : "Product Quantity"}</th>
                          <th className="py-4.5 px-4 text-right">{lang === "am" ? "የአንዱ ዋጋ" : "Unit Price"}</th>
                          <th className="py-4.5 px-4 text-right">{lang === "am" ? "ሙሉ ዋጋ" : "Total Price"}</th>
                          <th className="py-4.5 px-4 text-center">{lang === "am" ? "የእቃዎች የተመዘገቡት ቀን" : "Registration Date"}</th>
                          <th className="py-4.5 px-6 text-right">{lang === "am" ? "ማስተካከያ" : "Adjustment"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 text-xs text-zinc-650 font-medium">
                        {paginatedProducts.map((p) => {
                          const sold = p.sold_quantity ?? 0;
                          const left = Math.max(0, p.quantity - sold);
                          return (
                            <tr key={p.id} className="hover:bg-zinc-50/40 transition duration-150 group">
                              {/* Product name */}
                              <td className="py-4 px-6">
                                <span className="text-sm font-bold text-zinc-850 block leading-snug group-hover:text-[#009b3a] transition">
                                  {p.product_name}
                                </span>
                              </td>

                              {/* Product photo visual thumbnail */}
                              <td className="py-4 px-4 text-center">
                                {p.product_image ? (
                                  <img
                                    src={p.product_image}
                                    alt={p.product_name}
                                    referrerPolicy="no-referrer"
                                    onClick={() => setZoomedImage(p.product_image || null)}
                                    className="w-10 h-10 rounded-xl object-cover border border-zinc-200 cursor-zoom-in hover:scale-105 transition shadow-sm mx-auto"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center font-mono font-bold text-[10px] select-none uppercase border border-zinc-200/50 mx-auto">
                                    {p.product_name.substr(0, 2)}
                                  </div>
                                )}
                              </td>

                              {/* Total quantity in stock */}
                              <td className="py-4 px-4 text-center font-extrabold text-zinc-850 font-sans text-[13px]">
                                {left}
                              </td>

                              {/* Unit Price Info */}
                              <td className="py-4 px-4 text-right font-extrabold text-zinc-700 font-sans text-sm">
                                ETB {(p.quantity > 0 ? Math.round(p.total_price / p.quantity) : p.total_price || 0).toLocaleString()}
                              </td>

                              {/* Total logged price worth */}
                              <td className="py-4 px-4 text-right font-extrabold text-[#009b3a] font-sans text-sm">
                                ETB {(left * (p.quantity > 0 ? (p.total_price / p.quantity) : 0)).toLocaleString()}
                              </td>

                              {/* Registration date */}
                              <td className="py-4 px-4 text-center font-bold text-zinc-650 font-sans text-xs">
                                {formatEthiopianDate(toEthiopian(p.purchase_date), lang)}
                              </td>

                              {/* Action buttons (View specs, Edit intake, or Delete) */}
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => setViewingProduct(p)}
                                    title="Expand specs"
                                    className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEditClick(p)}
                                    title="Edit Entry Specs"
                                    className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-[#009b3a] transition"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingProductId(p.id)}
                                    title="Permanently Delete SKU Item"
                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* (B) Mobile Responsive Card Layout */}
                  <div className="block md:hidden bg-zinc-50/50 p-4 space-y-4">
                    {paginatedProducts.map((p) => {
                      const sold = p.sold_quantity ?? 0;
                      const left = Math.max(0, p.quantity - sold);
                      return (
                        <div key={`mobile-p-${p.id}`} className="bg-white rounded-3xl border border-zinc-100 p-4.5 shadow-[0_4px_18px_rgba(0,0,0,0.015)] hover:shadow-xs transition-all duration-200 flex flex-col gap-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {p.product_image ? (
                                <img
                                  src={p.product_image}
                                  alt={p.product_name}
                                  referrerPolicy="no-referrer"
                                  onClick={() => setZoomedImage(p.product_image || null)}
                                  className="w-12 h-12 rounded-2xl object-cover border-2 border-zinc-100/80 shadow-xs cursor-zoom-in shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#009b3a]/10 to-zinc-105 text-[#009b3a] flex items-center justify-center font-black text-sm select-none uppercase border border-[#009b3a]/10 shrink-0">
                                  {p.product_name.substr(0, 2)}
                                </div>
                              )}
                              <span className="font-extrabold text-zinc-900 text-sm leading-tight block">
                                {p.product_name}
                              </span>
                            </div>
                            
                            <div className="text-right flex flex-col items-end shrink-0 leading-tight">
                              <span className="font-black text-zinc-900 font-sans text-sm block">
                                ETB {(left * (p.quantity > 0 ? (p.total_price / p.quantity) : 0)).toLocaleString()}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400 mt-1 font-bold">
                                {p.quantity > 0 ? `@ ETB ${Math.round(p.total_price / p.quantity).toLocaleString()}` : "—"}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5 bg-zinc-50/40 p-3.5 rounded-2xl border border-zinc-100 text-[11px] font-medium text-zinc-650">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-extrabold block mb-1">{lang === "am" ? "የዕቃው ብዛት" : "Total Qty"}</span>
                              <span className="font-extrabold text-zinc-800 text-sm font-sans block">{left}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-extrabold block mb-1">{lang === "am" ? "የአንዱ ዋጋ" : "Unit Price"}</span>
                              <span className="font-extrabold text-zinc-800 text-sm font-sans block font-semibold font-sans">ETB {p.quantity > 0 ? Math.round(p.total_price / p.quantity).toLocaleString() : 0}</span>
                            </div>
                            <div className="border-t border-zinc-100/60 pt-2 shrink-0">
                              <span className="text-[9px] uppercase tracking-wider text-emerald-650 font-extrabold block mb-1">{lang === "am" ? "የተሸጡ" : "Sold"}</span>
                              <span className="font-black text-emerald-800 text-sm font-sans block">{sold}</span>
                            </div>
                            <div className="border-t border-zinc-100/60 pt-2 shrink-0">
                              <span className="text-[9px] uppercase tracking-wider text-amber-650 font-extrabold block mb-1">{lang === "am" ? "ቀሪ" : "Remaining"}</span>
                              <span className="font-black text-amber-800 text-sm font-sans block">{left}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-zinc-100/40">
                            <button
                              onClick={() => setViewingProduct(p)}
                              className="h-10 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-650 font-bold hover:bg-zinc-100 active:bg-zinc-150 text-[11px] flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none transition-all duration-150"
                            >
                              <Eye className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{lang === "am" ? "ተመልከት" : "View"}</span>
                            </button>
                            <button
                              onClick={() => handleEditClick(p)}
                              className="h-10 rounded-xl bg-white border border-zinc-200 text-[#009b3a] font-bold hover:bg-zinc-50 active:bg-zinc-100 text-[11px] flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none transition-all duration-150"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#009b3a]" />
                              <span>{lang === "am" ? "ማስተካከያ" : "Edit"}</span>
                            </button>
                            <button
                              onClick={() => setDeletingProductId(p.id)}
                              className="h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 font-bold hover:bg-rose-100 active:bg-rose-150 text-[11px] flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none transition-all duration-150"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>{lang === "am" ? "ሰርዝ" : "Delete"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination footer (For both table & cards) */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans shrink-0">
                      <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                        {lang === "am" ? `ገጽ ${currentPage} ከ ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                      </div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className="px-3 py-1.5 border border-zinc-200 rounded-lg bg-white disabled:opacity-50 hover:bg-zinc-50 min-w-[70px] text-zinc-600 shadow-sm focus:outline-none cursor-pointer"
                        >
                          {lang === "am" ? "በፊት" : "Prev"}
                        </button>
                        <span className="px-3.5 py-1.5 bg-zinc-100 rounded-lg text-zinc-700 font-mono text-[11px]">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className="px-3 py-1.5 border border-zinc-200 rounded-lg bg-white disabled:opacity-50 hover:bg-zinc-50 min-w-[70px] text-zinc-600 shadow-sm focus:outline-none cursor-pointer"
                        >
                          {lang === "am" ? "ቀጣይ" : "Next"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        )}

      </div>

      {/* 4. MODALS & WORKFLOW DIALOG OVERLAYS */}

      {/* Delete Confirmation prompt for Products */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-[360px] bg-white p-7 rounded-[32px] border border-zinc-100/85 shadow-[0_25px_60px_rgba(0,0,0,0.18)] flex flex-col items-center text-center space-y-6 animate-scaleIn">
            <div className="w-13 h-13 rounded-full bg-rose-50 border border-rose-150 flex items-center justify-center text-rose-500 animate-pulse">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-zinc-900 tracking-tight">{t.deleteConfirmTitle}</h4>
              <p className="text-[12px] leading-relaxed text-zinc-450 font-medium px-1">
                {t.deleteConfirmDesc}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full pt-1">
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 min-h-[44px] px-4 bg-zinc-100/65 hover:bg-zinc-100 active:bg-zinc-150 border-2 border-zinc-100/20 text-zinc-650 rounded-2xl text-xs font-bold transition duration-150 cursor-pointer active:scale-95"
              >
                {t.deleteCancelBtn}
              </button>
              <button
                onClick={() => triggerDeleteProduct(deletingProductId)}
                className="flex-1 min-h-[44px] px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-2xl text-xs font-black shadow-sm hover:shadow-md hover:shadow-rose-600/10 transition duration-150 cursor-pointer active:scale-95"
              >
                {t.deleteConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation prompt for Sales Transactions */}
      {deletingSaleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-[360px] bg-white p-7 rounded-[32px] border border-zinc-100/85 shadow-[0_25px_60px_rgba(0,0,0,0.18)] flex flex-col items-center text-center space-y-6 animate-scaleIn">
            <div className="w-13 h-13 rounded-full bg-rose-50 border border-rose-150 flex items-center justify-center text-rose-500 animate-pulse">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-zinc-900 tracking-tight">
                {lang === "am" ? "የሽያጭ መዝገብ መሰረዝ" : "Delete Sales Transaction"}
              </h4>
              <p className="text-[12px] leading-relaxed text-zinc-450 font-medium px-1">
                {lang === "am"
                  ? "ይህንን የሽያጭ መዝገብ በቋሚነት መሰረዝ እና እቃዎቹን ወደ ክምችት መመለስ እንደሚፈልጉ እርግጠኛ ነዎት?"
                  : "Are you sure you want to permanently delete this sales transaction and return items to stock?"}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full pt-1">
              <button
                onClick={() => setDeletingSaleId(null)}
                className="flex-1 min-h-[44px] px-4 bg-zinc-100/65 hover:bg-zinc-100 active:bg-zinc-150 border-2 border-zinc-100/20 text-zinc-650 rounded-2xl text-xs font-bold transition duration-150 cursor-pointer active:scale-95"
              >
                {t.deleteCancelBtn}
              </button>
              <button
                onClick={() => triggerDeleteSale(deletingSaleId)}
                className="flex-1 min-h-[44px] px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-2xl text-xs font-black shadow-sm hover:shadow-md hover:shadow-rose-600/10 transition duration-150 cursor-pointer active:scale-95"
              >
                {t.deleteConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed read popup view */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white p-5 sm:p-7 rounded-[2.5rem] border border-zinc-150 shadow-[0_25px_60px_rgba(0,0,0,0.12)] space-y-6 animate-scaleIn">
            <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
              <div className="space-y-1">
                <h4 className="text-xl font-black text-zinc-900 tracking-tight leading-tight pt-1">
                  {viewingProduct.product_name}
                </h4>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="w-8 h-8 rounded-full bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-150 text-zinc-500 hover:text-zinc-800 transition flex items-center justify-center border border-zinc-200/40 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Display both product photo and receipt photo side-by-side or stacked */}
            {(viewingProduct.product_image || viewingProduct.receipt_image) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {viewingProduct.product_image && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block pl-0.5">
                      {lang === "am" ? "የዕቃው ፎቶ" : "Product Photo"}
                    </span>
                    <div className="relative overflow-hidden rounded-3xl border border-zinc-150 bg-zinc-50 shadow-xs h-40 flex items-center justify-center">
                      <img
                        src={viewingProduct.product_image}
                        alt={viewingProduct.product_name}
                        referrerPolicy="no-referrer"
                        onClick={() => setZoomedImage(viewingProduct.product_image || null)}
                        className="w-full h-40 object-cover transition-transform duration-500 hover:scale-102 cursor-zoom-in"
                      />
                    </div>
                  </div>
                )}

                {viewingProduct.receipt_image && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block pl-0.5">
                      {lang === "am" ? "ዕቃው የተገዛበት ደረሰኝ ፎቶ" : "Receipt Photo"}
                    </span>
                    <div className="relative overflow-hidden rounded-3xl border border-zinc-150 bg-zinc-50 shadow-xs h-40 flex items-center justify-center">
                      <img
                        src={viewingProduct.receipt_image}
                        alt="Receipt Photo"
                        referrerPolicy="no-referrer"
                        onClick={() => setZoomedImage(viewingProduct.receipt_image || null)}
                        className="w-full h-40 object-cover transition-transform duration-500 hover:scale-102 cursor-zoom-in"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-50/70 p-3 rounded-2xl border border-zinc-100 flex flex-col justify-between">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider block leading-none">
                  {lang === "am" ? "በመጋዘን ውስጥ" : "Total Stock"}
                </span>
                <span className="text-sm font-black text-zinc-800 mt-2 block">
                  {viewingProduct.quantity} {t.units}
                </span>
              </div>
              <div className="bg-emerald-50/45 p-3 rounded-2xl border border-emerald-150/50 flex flex-col justify-between">
                <span className="text-[9px] text-emerald-700 font-extrabold uppercase tracking-wider block leading-none">
                  {lang === "am" ? "የተሸጡ ዕቃዎች" : "Sold"}
                </span>
                <span className="text-sm font-black text-emerald-800 mt-2 block">
                  {viewingProduct.sold_quantity ?? 0} {t.units}
                </span>
              </div>
              <div className="bg-amber-50/45 p-3 rounded-2xl border border-amber-150/50 flex flex-col justify-between">
                <span className="text-[9px] text-amber-800 font-extrabold uppercase tracking-wider block leading-none">
                  {lang === "am" ? "ያልተሸጡ" : "Unsold"}
                </span>
                <span className="text-sm font-black text-amber-900 mt-2 block">
                  {viewingProduct.quantity - (viewingProduct.sold_quantity ?? 0)} {t.units}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Dates Group */}
              <div className="bg-zinc-50/40 p-3.5 rounded-2xl border border-zinc-150/60 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-extrabold uppercase tracking-wide text-[10px]">{t.ethiopianDate}</span>
                  <span className="font-bold text-zinc-800 flex items-center gap-1">
                    <span>🇪🇹</span> {formatEthiopianDate(toEthiopian(viewingProduct.purchase_date), lang)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-zinc-100/60 pt-2.5">
                  <span className="text-zinc-400 font-extrabold uppercase tracking-wide text-[10px]">{t.gregorianDate}</span>
                  <span className="font-mono text-zinc-655 font-bold">{viewingProduct.purchase_date}</span>
                </div>
              </div>

              {/* Financial Group */}
              <div className="bg-zinc-50/40 p-3.5 rounded-2xl border border-zinc-150/60 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-extrabold uppercase tracking-wide text-[10px]">{t.unitPrice}</span>
                  <span className="font-black text-zinc-900 font-sans">
                    ETB {(viewingProduct.quantity > 0 ? Math.round(viewingProduct.total_price / viewingProduct.quantity) : 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-zinc-100/60 pt-2.5">
                  <span className="text-emerald-700 font-extrabold uppercase tracking-wide text-[10px]">{t.totalNetInflow}</span>
                  <span className="font-black text-emerald-700 text-sm font-sans">
                    ETB {viewingProduct.total_price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Operator Info */}
              <div className="flex justify-between items-center pt-2 px-1 text-[10px] text-zinc-400">
                <span className="font-bold uppercase tracking-wider">{t.recordedOperator}:</span>
                <span className="font-mono text-zinc-500 font-semibold">
                  {viewingProduct.created_by_name}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setViewingProduct(null)}
                className="w-full sm:w-auto px-6 h-11 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white font-extrabold rounded-2xl text-xs transition transform active:scale-95 cursor-pointer shadow-sm flex items-center justify-center"
              >
                {t.closeDeck}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image zoom overlay preview in backdrop */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 cursor-zoom-out"
        >
          <img
            src={zoomedImage}
            alt="Expanded preview view"
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-zinc-800"
          />
        </div>
      )}

      {/* Creation and updates form popup triggers */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleProductSubmit}
        product={editingProduct}
        errorText={errorText}
        lang={lang}
      />

      {/* Sold items form trigger */}
      <SoldProductFormModal
        isOpen={isSoldFormOpen}
        onClose={() => setIsSoldFormOpen(false)}
        products={products}
        onSubmit={handleSoldProductSubmit}
        lang={lang}
      />

      {/* 5. Mobile Bottom Navigation Bar (Hidden on Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-zinc-200/60 px-3 py-2.5 flex justify-around items-center md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.03)] pb-[calc(14px+env(safe-area-inset-bottom))] rounded-t-[28px]">
        {([
          { id: "dashboard", label: lang === "am" ? "ዋና ማዕከል" : "Main", icon: Compass },
          { id: "inventory", label: lang === "am" ? "የዕቃ ክምችት" : "Intake", icon: Layers },
          { id: "finance", label: lang === "am" ? "ሪፖርት" : "Finance", icon: Clock },
          { id: "sold", label: lang === "am" ? "የተሸጡ" : "Sold", icon: ShoppingBag },
          { id: "unsold", label: lang === "am" ? "ቀሪ ክምችት" : "Unsold", icon: BookMarked }
        ] as const).map((tb) => {
          const Icon = tb.icon;
          const isActive = activeTab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => {
                setActiveTab(tb.id);
                setCurrentPage(1);
              }}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-200 active:scale-95 tap-highlight-transparent font-sans cursor-pointer ${
                isActive
                  ? "text-emerald-600 font-extrabold"
                  : "text-zinc-400 hover:text-zinc-650 font-semibold"
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${isActive ? "bg-emerald-50 text-emerald-600 scale-105" : "text-zinc-400"}`}>
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "animate-pulse" : ""}`} />
              </div>
              <span className="text-[9px] tracking-tight mt-1 whitespace-nowrap font-sans font-bold">
                {tb.label}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
