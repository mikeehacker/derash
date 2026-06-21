import React from "react";
import { Product, AnalyticsResponse, Sale } from "../types";
import { Language, translations } from "../utils/translations";
import EthiopianDatePicker from "./EthiopianDatePicker";
import { Calendar, RefreshCcw, Sparkles, FileDown, BookMarked, Landmark, PhoneCall, HandCoins, ShieldCheck, Zap, Cloud } from "lucide-react";
import { toEthiopian, ETHIOPIAN_MONTHS_EN, ETHIOPIAN_MONTHS_AM } from "../utils/ethiopianCalendar";

interface FinanceTabProps {
  products: Product[];
  sales: Sale[];
  analytics: AnalyticsResponse | null;
  loading: boolean;
  lang: Language;
  etTodayStr: string;
  filterStartDate: string;
  setFilterStartDate: (val: string) => void;
  filterEndDate: string;
  setFilterEndDate: (val: string) => void;
  filterMonth: string;
  setFilterMonth: (val: string) => void;
  filterYear: string;
  setFilterYear: (val: string) => void;
  isFilterApplied: boolean;
  handleApplyFilter: () => void;
  handleResetFilter: () => void;
  triggerPDFExport: () => void;
  isCloudActive?: boolean;
  supabaseStatus?: any;
}

export default function FinanceTab({
  products,
  sales,
  analytics,
  loading,
  lang,
  etTodayStr,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  isFilterApplied,
  handleApplyFilter,
  handleResetFilter,
  triggerPDFExport,
  isCloudActive,
  supabaseStatus,
}: FinanceTabProps) {
  const t = translations[lang];

  // Calculate the financial metrics requested by the user
  const {
    totalNewStockValue,
    totalOriginalValue,
    totalRemainingQty,
    dailySoldVal,
    dailySoldQty,
    weeklySoldVal,
    weeklySoldQty,
    monthlySoldVal,
    monthlySoldQty,
    paymentBreakdown,
  } = React.useMemo(() => {
    // --- Product-level: Remaining stock value calculations ---
    let totalNewStockValue = 0;
    let totalOriginalValue = 0;
    let totalRemainingQty = 0;

    products.forEach((p) => {
      const sq = p.sold_quantity ?? 0;
      const left = Math.max(0, p.quantity - sq);
      const unitPrice = p.quantity > 0 ? (p.total_price / p.quantity) : 0;
      totalNewStockValue += left * unitPrice;
      totalOriginalValue += (p.total_price || 0);
      totalRemainingQty += left;
    });

    // --- Sales-level: Payment breakdown and temporal metrics from actual transactions ---
    let dailySoldVal = 0;
    let dailySoldQty = 0;
    let weeklySoldVal = 0;
    let weeklySoldQty = 0;
    let monthlySoldVal = 0;
    let monthlySoldQty = 0;

    let cbeWorth = 0;
    let teleWorth = 0;
    let cashWorth = 0;
    let cbeQty = 0;
    let teleQty = 0;
    let cashQty = 0;

    const now = new Date();

    // Ethiopian today for exact day/month matching
    const gY = now.getFullYear();
    const gM = String(now.getMonth() + 1).padStart(2, '0');
    const gD = String(now.getDate()).padStart(2, '0');
    const etToday = toEthiopian(`${gY}-${gM}-${gD}`);

    // Start of current week (Monday) for Gregorian week check
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    sales.forEach((s) => {
      // Payment Method Breakdown from actual sales
      if (s.payment_method === "CBE Birr") {
        cbeWorth += s.total_price;
        cbeQty += s.quantity;
      } else if (s.payment_method === "Telebirr") {
        teleWorth += s.total_price;
        teleQty += s.quantity;
      } else if (s.payment_method === "Cash") {
        cashWorth += s.total_price;
        cashQty += s.quantity;
      }

      // Temporal metrics using Ethiopian calendar on sale_date
      let sEt;
      try {
        sEt = toEthiopian(s.sale_date);
      } catch {
        return;
      }

      // Today: exact Ethiopian year + month + day match
      if (sEt.year === etToday.year && sEt.month === etToday.month && sEt.day === etToday.day) {
        dailySoldQty += s.quantity;
        dailySoldVal += (s.total_price || 0);
      }

      // This week: Gregorian sale_date >= Monday of this week
      try {
        const parts = s.sale_date.split("-");
        if (parts.length === 3) {
          const yr = parseInt(parts[0], 10);
          const mo = parseInt(parts[1], 10) - 1;
          const dy = parseInt(parts[2], 10);
          const sDate = new Date(yr, mo, dy);
          sDate.setHours(0, 0, 0, 0);
          if (sDate.getTime() >= monday.getTime()) {
            weeklySoldQty += s.quantity;
            weeklySoldVal += (s.total_price || 0);
          }
        }
      } catch (e) {
        // Safe failover
      }

      // This month: exact Ethiopian year + month match
      if (sEt.year === etToday.year && sEt.month === etToday.month) {
        monthlySoldQty += s.quantity;
        monthlySoldVal += (s.total_price || 0);
      }
    });

    return {
      totalNewStockValue: Math.round(totalNewStockValue),
      totalOriginalValue: Math.round(totalOriginalValue),
      totalRemainingQty,
      dailySoldVal: Math.round(dailySoldVal),
      dailySoldQty,
      weeklySoldVal: Math.round(weeklySoldVal),
      weeklySoldQty,
      monthlySoldVal: Math.round(monthlySoldVal),
      monthlySoldQty,
      paymentBreakdown: {
        cbe: Math.round(cbeWorth),
        telebirr: Math.round(teleWorth),
        cash: Math.round(cashWorth),
        cbeQty,
        telebirrQty: teleQty,
        cashQty,
      }
    };
  }, [products, sales]);

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn" id="finance-tab-view">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg md:text-xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
              <span className="w-2.5 h-6 bg-[#009b3a] rounded-full inline-block"></span>
              <span>{lang === "am" ? "የየፋይናንስ ትንታኔ ሪፖርቶች" : "Financial Analytics & Reports"}</span>
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
          <p className="text-xs text-zinc-400 mt-1 font-semibold leading-relaxed">
            {lang === "am" 
              ? "የአዲስ ዕቃዎች ክምችት እሴት እና የተሸጡ ዕቃዎችን ሳምንታዊ እንዲሁም ወርሃዊ የሽያጭ ዋጋ በዚህ ገፅ ይከታተሉ" 
              : "Track active remaining stock value alongside your weekly and monthly sales revenues accurately."}
          </p>
        </div>

        <button
          onClick={triggerPDFExport}
          disabled={products.length === 0}
          className="min-h-[46px] px-5 bg-[#009b3a] text-white hover:bg-[#00802f] active:scale-95 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition duration-150 disabled:opacity-40 cursor-pointer"
        >
          <FileDown className="w-4 h-4 shrink-0" />
          <span>{lang === "am" ? "ሪፖርት አውርድ (PDF)" : "Download Report (PDF)"}</span>
        </button>
      </div>

      {/* Ethiopian Date Calendar Filter Panel */}
      <div className="bg-white border border-zinc-150 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h5 className="text-xs sm:text-sm font-black text-zinc-900 leading-tight flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-[#009b3a]" />
              {lang === "am" ? "የኢትዮጵያ ዘመን አቆጣጠር ማጣሪያ" : "Ethiopian Calendar Date Filtering"}
            </h5>
            <p className="text-[10px] text-zinc-400 font-semibold mt-1">
              {lang === "am" 
                ? "የገቡበትን ዕቃዎች በኢትዮጵያ ቀን፣ ወር ወይም ዓመት በመለየት ትክክለኛ ሪፖርት ያውጡ" 
                : "Filter registered and sold transactions accurately by day, month, or year."}
            </p>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-black rounded-xl ${isFilterApplied ? "bg-emerald-50 text-[#009b3a] border border-emerald-100" : "bg-zinc-100 text-zinc-500"}`}>
            {lang === "am" ? "የማጣሪያ ሁኔታ፦ " : "Filter Status: "} 
            {isFilterApplied ? (lang === "am" ? "ማጣሪያ በርቷል (Active)" : "Active") : (lang === "am" ? "ሁሉንም ጊዜ" : "All Time")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div>
            <EthiopianDatePicker
              value={filterStartDate}
              onChange={setFilterStartDate}
              label={lang === "am" ? "ከ (From Date)" : "From Date"}
              id="filter-finance-start-date"
              lang={lang}
            />
          </div>
          <div>
            <EthiopianDatePicker
              value={filterEndDate}
              onChange={setFilterEndDate}
              label={lang === "am" ? "እስከ (To Date)" : "To Date"}
              id="filter-finance-end-date"
              lang={lang}
            />
          </div>
          <div className="space-y-1.5">
            <span className="block text-[11px] font-black text-zinc-400 uppercase tracking-wider">
              {lang === "am" ? "በኢትዮጵያ ወር" : "Ethiopian Month"}
            </span>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full min-h-[46px] px-3 border border-zinc-200 focus:border-[#009b3a] focus:ring-1 focus:ring-[#009b3a] rounded-xl text-xs font-bold outline-none bg-zinc-50/50 cursor-pointer transition-all duration-200"
            >
              <option value="All">{lang === "am" ? "ሁሉም ወራት (All)" : "All Months"}</option>
              {ETHIOPIAN_MONTHS_AM.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {idx + 1} - {lang === "am" ? m : ETHIOPIAN_MONTHS_EN[idx]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <span className="block text-[11px] font-black text-zinc-400 uppercase tracking-wider">
              {lang === "am" ? "በኢትዮጵያ ዓመት" : "Ethiopian Year"}
            </span>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full min-h-[46px] px-3 border border-zinc-200 focus:border-[#009b3a] focus:ring-1 focus:ring-[#009b3a] rounded-xl text-xs font-bold outline-none bg-zinc-50/50 cursor-pointer transition-all duration-200"
            >
              <option value="All">{lang === "am" ? "ሁሉም ዓመታት (All)" : "All Years"}</option>
              {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022].map((yr) => (
                <option key={yr} value={yr}>
                  {yr} {lang === "am" ? "ዓ.ም" : "EC"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            onClick={handleApplyFilter}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#009b3a] hover:bg-[#00802f] text-white text-[10px] font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === "am" ? "ማጣሪያ ተግብር" : "Apply Date Filter"}</span>
          </button>

          <button
            onClick={handleResetFilter}
            className="w-full sm:w-auto px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-650 text-[10px] font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-200"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>{lang === "am" ? "ማጣሪያ አጽዳ" : "Reset Calendar Filters"}</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Performance Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Registered Stock Value after Sales Deducted */}
        <div className="bg-gradient-to-br from-indigo-50/30 via-white to-zinc-50/50 border border-indigo-150 rounded-3xl p-6.5 shadow-xs relative overflow-hidden group hover:shadow-xs transition duration-200">
          <div className="flex justify-between items-start mb-4">
            <span className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 text-[9px] font-extrabold uppercase tracking-widest font-sans">
              {lang === "am" ? "የቀሪ እቃዎች እሴት" : "Catalog Holding Value"}
            </span>
            <BookMarked className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">
                {lang === "am" ? "አዲስ ከተመዘገቡት አጠቃላይ እቃዎች ዋጋ (ቀሪ ዋጋ)" : "Total Newly Registered Stock Value"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-indigo-950 font-sans block mt-1.5 leading-tight">
                ETB {totalNewStockValue.toLocaleString()}
              </span>
            </div>

            <div className="pt-3.5 border-t border-indigo-100/60 flex flex-col gap-2 text-[10px] font-semibold text-zinc-500">
              <div className="flex justify-between items-center">
                <span>{lang === "am" ? "ቀሪ ጠቅላላ ዕቃዎች ብዛት" : "Remaining stock:"}</span>
                <span className="font-extrabold text-zinc-800 font-mono text-[11px] bg-indigo-50 px-2 py-0.5 rounded-md">{totalRemainingQty.toLocaleString()} pcs</span>
              </div>
              <div className="flex justify-between items-center">
                <span>{lang === "am" ? "የተመዘገቡት ጠቅላላ ዋጋ (መጀመሪያ)" : "Original Intake Worth:"}</span>
                <span className="font-bold text-zinc-650">ETB {totalOriginalValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Daily Sold Items Value */}
        <div className="bg-gradient-to-br from-amber-50/30 via-white to-zinc-50/50 border border-amber-150 rounded-3xl p-6.5 shadow-xs relative overflow-hidden group hover:shadow-xs transition duration-200">
          <div className="flex justify-between items-start mb-4">
            <span className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-850 text-[9px] font-extrabold uppercase tracking-widest font-sans">
              {lang === "am" ? "የዕለቱ ሽያጭ ዋጋ" : "Daily Sales Value"}
            </span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">
                {lang === "am" ? "የየዕለቱ የተሸጡ እቃዎች ዋጋ" : "Value of Daily Sold Items"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-600 font-sans block mt-1.5 leading-tight">
                ETB {dailySoldVal.toLocaleString()}
              </span>
            </div>

            <div className="pt-3.5 border-t border-amber-100/60 flex flex-col gap-2 text-[10px] font-semibold text-zinc-500">
              <div className="flex justify-between items-center">
                <span>{lang === "am" ? "በቀኑ የተሸጡ እቃዎች ብዛት" : "Sold units today:"}</span>
                <span className="font-extrabold text-zinc-850 font-mono text-[11px] bg-amber-50 px-2 py-0.5 rounded-md">{dailySoldQty.toLocaleString()} pcs</span>
              </div>
              <p className="text-[9px] text-amber-600 font-bold italic mt-1 leading-snug">
                ☆ {lang === "am" ? "የዛሬውን የሽያጭ መጠን እንቅስቃሴ ያሳያል" : "Performance reflects live today's metrics"}
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Weekly Sold Items Value */}
        <div className="bg-gradient-to-br from-emerald-50/30 via-white to-zinc-50/50 border border-emerald-150 rounded-3xl p-6.5 shadow-xs relative overflow-hidden group hover:shadow-xs transition duration-200">
          <div className="flex justify-between items-start mb-4">
            <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase tracking-widest font-sans">
              {lang === "am" ? "የሳምንቱ ሽያጭ ዋጋ" : "Weekly Sales Value"}
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">
                {lang === "am" ? "የየሳምንቱ የተሸጡ እቃዎች ዋጋ" : "Value of Weekly Sold Items"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 font-sans block mt-1.5 leading-tight">
                ETB {weeklySoldVal.toLocaleString()}
              </span>
            </div>

            <div className="pt-3.5 border-t border-emerald-100/60 flex flex-col gap-2 text-[10px] font-semibold text-zinc-500">
              <div className="flex justify-between items-center">
                <span>{lang === "am" ? "በሳምንቱ የተሸጡ እቃዎች ብዛት" : "Sold units this week:"}</span>
                <span className="font-extrabold text-zinc-850 font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md">{weeklySoldQty.toLocaleString()} pcs</span>
              </div>
              <p className="text-[9px] text-[#009b3a] font-bold italic mt-1 leading-snug">
                ☆ {lang === "am" ? "ሽያጭ በተሳካ ሁኔታ ተቀናሽ የተደረገበት ነው" : "Performance reflects live deducted catalog metrics"}
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Monthly Sold Items Value */}
        <div className="bg-gradient-to-br from-indigo-50/20 via-white to-zinc-50/50 border border-zinc-200 rounded-3xl p-6.5 shadow-xs relative overflow-hidden group hover:shadow-xs transition duration-200">
          <div className="flex justify-between items-start mb-4">
            <span className="px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 text-[9px] font-extrabold uppercase tracking-widest font-sans">
              {lang === "am" ? "የወሩ ሽያጭ ዋጋ" : "Monthly Sales Value"}
            </span>
            <ShieldCheck className="w-5 h-5 text-zinc-400" />
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">
                {lang === "am" ? "የየወሩ የተሸጡ እቃዎች ዋጋ" : "Value of Monthly Sold Items"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-indigo-900 font-sans block mt-1.5 leading-tight">
                ETB {monthlySoldVal.toLocaleString()}
              </span>
            </div>

            <div className="pt-3.5 border-t border-zinc-150 flex flex-col gap-2 text-[10px] font-semibold text-zinc-500">
              <div className="flex justify-between items-center">
                <span>{lang === "am" ? "በወሩ የተሸጡ እቃዎች ብዛት" : "Sold units this month:"}</span>
                <span className="font-extrabold text-zinc-800 font-mono text-[11px] bg-zinc-100 px-2 py-0.5 rounded-md">{monthlySoldQty.toLocaleString()} pcs</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Elegant Payment Channel Summary Card */}
      <div className="bg-[#fafafa]/50 border border-zinc-150 p-6 rounded-3xl space-y-4.5">
        <div>
          <h4 className="text-xs sm:text-sm font-black text-zinc-850 font-sans">
            {lang === "am" ? "የተሸጡ ዕቃዎች በክፍያ መንገድ ድምር" : "Deduction Value by Payment Channel Source"}
          </h4>
          <p className="text-[10px] font-medium text-zinc-400 mt-1">
            {lang === "am" ? "ከተሸጡ ምርቶች ውስጥ በቴሌብር፣ በሲቢኢ ብር እንዲሁም በእጅ የተቀበሉትን ጠቅላላ ያወዳድሩ" : "Examine financial flows received through CBE Birr, Telebirr apps, and Cash."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
          {/* Channel CBE */}
          <div className="p-4 bg-white border border-zinc-150 rounded-2xl flex items-center justify-between gap-3 shadow-3xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] text-zinc-400 uppercase font-black tracking-wide block">CBE Birr</span>
                <span className="text-xs font-black text-zinc-800">ETB {paymentBreakdown.cbe.toLocaleString()}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-lg">{paymentBreakdown.cbeQty} pcs</span>
          </div>

          {/* Channel Telebirr */}
          <div className="p-4 bg-white border border-zinc-150 rounded-2xl flex items-center justify-between gap-3 shadow-3xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] text-zinc-400 uppercase font-black tracking-wide block">Telebirr</span>
                <span className="text-xs font-black text-zinc-800">ETB {paymentBreakdown.telebirr.toLocaleString()}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-lg">{paymentBreakdown.telebirrQty} pcs</span>
          </div>

          {/* Channel Cash */}
          <div className="p-4 bg-white border border-zinc-150 rounded-2xl flex items-center justify-between gap-3 shadow-3xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <HandCoins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] text-zinc-400 uppercase font-black tracking-wide block">{lang === "am" ? "በእጅ (Cash)" : "Cash"}</span>
                <span className="text-xs font-black text-[#009b3a]">ETB {paymentBreakdown.cash.toLocaleString()}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-lg">{paymentBreakdown.cashQty} pcs</span>
          </div>
        </div>
      </div>

    </div>
  );
}
