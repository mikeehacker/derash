import React from "react";
import { Product, User } from "../types";
import { Language } from "../utils/translations";
import { 
  BookMarked, 
  HandCoins, 
  AlertCircle, 
  Eye, 
  Sparkles,
  RefreshCcw,
  Plus,
  Cloud
} from "lucide-react";
import { formatDoubleDate } from "../utils/ethiopianCalendar";
import { generateUnsoldAssetsPDF } from "../utils/pdfGenerator";

interface UnsoldTabProps {
  products: Product[];
  computedMetrics: {
    totalUnsoldQty: number;
    totalUnsoldWorth: number;
  };
  lang: Language;
  setViewingProduct: (p: Product) => void;
  formatEthiopianDate: (d: string) => string;
  user?: User;
  isCloudActive?: boolean;
}

export default function UnsoldTab({
  products,
  computedMetrics,
  lang,
  setViewingProduct,
  formatEthiopianDate,
  user,
  isCloudActive,
}: UnsoldTabProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await generateUnsoldAssetsPDF(products, lang, user?.name || "Storekeeper");
    } catch (e) {
      console.error("Failed to generate unsold assets PDF report", e);
    } finally {
      setIsExporting(false);
    }
  };

  // Filters to query unsold remaining products (where remaining stock is > 0)
  const remainingAssets = React.useMemo(() => {
    return products.filter((p) => {
      const remainingPrice = p.quantity - (p.sold_quantity ?? 0);
      return remainingPrice > 0;
    });
  }, [products]);

  // Filters to find critical warning goods (remaining <= 3)
  const criticalGoods = React.useMemo(() => {
    return remainingAssets.filter((p) => {
      const rem = p.quantity - (p.sold_quantity ?? 0);
      return rem <= 3;
    });
  }, [remainingAssets]);

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Tab headings */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-indigo-700" />
              <span>{lang === "am" ? "ያልተሸጡ ቀሪ ዕቃዎች" : "Unsold / Remaining Assets"}</span>
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
            {lang === "am" 
              ? "በመጋዘን ውስጥ የተመዘገቡ ቀሪ እና ያልተሸጡ እቃዎችን ዝርዝር ይከታተሉ" 
              : "Track remaining merchandise in stock along with current valuations."}
          </p>
        </div>

        {/* Action button and remaining value indicator badge */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-black rounded-2xl shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {isExporting ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin" />
                <span>{lang === "am" ? "በማዘጋጀት ላይ..." : "Exporting..."}</span>
              </>
            ) : (
              <>
                <BookMarked className="w-4 h-4" />
                <span>{lang === "am" ? "ቀሪ እቃዎች PDF ሪፖርት አውርድ" : "Download Unsold Assets PDF"}</span>
              </>
            )}
          </button>

          <span className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-black rounded-2xl shadow-sm text-center">
            {lang === "am" ? `የቀረው የዕቃ እሴት፦ ETB ${computedMetrics.totalUnsoldWorth.toLocaleString()}` : `Remaining Assets: ETB ${computedMetrics.totalUnsoldWorth.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Small dynamic bento summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-zinc-100 rounded-3xl flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-405 block font-bold uppercase tracking-wider">{lang === "am" ? "ያልተሸጡ ዕቃዎች ብዛት" : "Asset Stock Units"}</span>
            <span className="text-lg font-black text-zinc-900">{computedMetrics.totalUnsoldQty.toLocaleString()} units</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-100 rounded-3xl flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <HandCoins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-405 block font-bold uppercase tracking-wider">{lang === "am" ? "ያልተሸጡ ጠቅላላ ግምት" : "Asset Book Value"}</span>
            <span className="text-lg font-black text-[#009b3a]">ETB {computedMetrics.totalUnsoldWorth.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-100 rounded-3xl flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-405 block font-bold uppercase tracking-wider">{lang === "am" ? "የሚያልቁ ዕቃዎች መጠን" : "Alert Threshold SKU"}</span>
            <span className="text-lg font-black text-rose-600">{criticalGoods.length} items logged</span>
          </div>
        </div>
      </div>

      {/* Critical Stock Warn panel */}
      {criticalGoods.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-100 text-rose-800 rounded-3xl animate-fadeIn space-y-2.5">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-rose-605" />
            <div>
              <h5 className="text-sm font-black text-rose-900">{lang === "am" ? "በፍጥነት ሊያልቁ የቀረቡ ምርቶች" : "High Priority Low Stock Alert"}</h5>
              <p className="text-[11px] text-zinc-600 mt-0.5">{lang === "am" ? "ከታች የተዘረዘሩት ምርቶች መጠን ከ 3 በታች ስለሆነ እባክዎን ተጨማሪ ትእዛዝ ያድርጉ።" : "The following merchandise items are sitting at depleted quantities."}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1.5">
            {criticalGoods.slice(0, 4).map(p => {
              const rem = p.quantity - (p.sold_quantity ?? 0);
              return (
                <span key={p.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-rose-100 text-rose-700 rounded-xl text-[10px] font-black shadow-3xs font-mono">
                  🔴 {p.product_name} ({rem} remaining)
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Unsold items listings tables */}
      <div className="bg-white border border-zinc-100 rounded-3xl shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 bg-[#fafafa]/50 flex justify-between items-center">
          <h4 className="text-[10px] font-black tracking-widest text-indigo-700 uppercase font-sans">
            {lang === "am" ? "ያልተሸጡ ቀሪ ዕቃዎች ሰንጠረዥ" : "Unsold Items Database Ledger"}
          </h4>
          <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full text-[10px]">
            {lang === "am" ? `ድምር፦ ${remainingAssets.length} እቃዎች አሉ` : `In stock: ${remainingAssets.length} active SKUs`}
          </span>
        </div>

        {remainingAssets.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <Sparkles className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-zinc-800">{lang === "am" ? "ቀሪ ያላለቁ ዕቃዎች የሉም" : "No unsold items left!"}</h5>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1 font-medium">{lang === "am" ? "እንኳን ደስ አለዎት! ሁሉም ዕቃዎች በተሳካ ሁኔታ ተሽጠው አልቀዋል።" : "Outstanding job! Your client inventory ledger is completely empty — everything is registered sold."}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop grid layout */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="border-b border-zinc-100 bg-[#fafafa]/50 text-[10px] font-bold text-zinc-410 uppercase tracking-widest">
                  <th className="py-4 px-6">{lang === "am" ? "እቃና ፎቶ" : "Product details"}</th>
                  <th className="py-4 px-4 text-center">{lang === "am" ? "የገቡ ጠቅላላ" : "Inflow total"}</th>
                  <th className="py-4 px-4 text-center">{lang === "am" ? "የተሸጡ ብዛት" : "Sold Quantity"}</th>
                  <th className="py-4 px-4 text-center bg-indigo-50/25">{lang === "am" ? "ያልተሸጡ ቀሪ" : "Remaining stock"}</th>
                  <th className="py-4 px-4 text-right">{lang === "am" ? "የአንዱ ዋጋ" : "Unit cost"}</th>
                  <th className="py-4 px-4 text-right">{lang === "am" ? "የቀሪው ጠቅላላ ዋጋ" : "Estimated Value"}</th>
                  <th className="py-4 px-4 text-center">{lang === "am" ? "የገቡበት ቀን" : "Register entry"}</th>
                  <th className="py-4 px-6 text-center">{lang === "am" ? "ተግባር" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 text-zinc-700 text-xs">
                {remainingAssets.map((p) => {
                  const rem = p.quantity - (p.sold_quantity ?? 0);
                  const unitVal = p.quantity > 0 ? Math.round(p.total_price / p.quantity) : p.total_price;
                  const estimatedWorth = rem * unitVal;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/20 transition duration-100">
                      <td className="py-4 px-6 font-semibold">
                        <div className="flex items-center gap-3">
                          {p.product_image ? (
                            <img src={p.product_image} alt={p.product_name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-lg object-cover border border-zinc-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center font-bold text-zinc-440 uppercase font-mono text-[10px]">
                              {p.product_name.substring(0, 2)}
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-zinc-805 block">{p.product_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-sans font-bold">{p.quantity} pcs</td>
                      <td className="py-4 px-4 text-center text-emerald-600 font-sans font-bold">{p.sold_quantity ?? 0} pcs</td>
                      <td className="py-4 px-4 text-center bg-indigo-500/5 font-sans font-black text-indigo-805">
                        {rem} pcs
                      </td>
                      <td className="py-4 px-4 text-right">ETB {unitVal.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-black text-[#009b3a] text-sm">ETB {estimatedWorth.toLocaleString()}</td>
                      <td className="py-4 px-4 text-center font-bold text-zinc-455 text-[10px] font-mono">{formatDoubleDate(p.purchase_date, lang)}</td>
                      <td className="py-4 px-6 text-center">
                        <button onClick={() => setViewingProduct(p)} className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-705 transition">
                          <Eye className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile layout list of cards */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {remainingAssets.map((p) => {
                const rem = p.quantity - (p.sold_quantity ?? 0);
                const unitVal = p.quantity > 0 ? Math.round(p.total_price / p.quantity) : p.total_price;
                const estimatedWorth = rem * unitVal;
                return (
                  <div key={p.id} className="bg-zinc-50/50 border border-zinc-100 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {p.product_image ? (
                          <img src={p.product_image} alt={p.product_name} className="w-10 h-10 rounded-img object-cover border border-zinc-200" />
                        ) : (
                          <div className="w-10 h-10 bg-zinc-200 text-zinc-500 text-[10px] uppercase font-bold flex items-center justify-center">{p.product_name.substring(0, 2)}</div>
                        )}
                        <div>
                          <h5 className="font-extrabold text-[#009b3a] text-xs">{p.product_name}</h5>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase font-mono ${
                        rem <= 1 ? "bg-rose-100 text-rose-800" : rem <= 4 ? "bg-amber-100 text-amber-800" : "bg-teal-50 text-teal-800"
                      }`}>
                        {rem <= 1 ? "Critical" : rem <= 4 ? "Low" : "Ok"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-white/70 border border-zinc-100 p-2.5 rounded-xl text-xs font-semibold text-zinc-700">
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase font-bold block">{lang === "am" ? "የገቡት" : "Total intake"}</span>
                        <span>{p.quantity} pcs</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase font-bold block">{lang === "am" ? "የተሸጡት" : "Sold qty"}</span>
                        <span className="text-emerald-600 font-bold">{p.sold_quantity ?? 0} pcs</span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-zinc-120 mt-1 flex justify-between items-center bg-indigo-50/30 px-2 py-1 rounded-lg text-indigo-805">
                        <span className="text-[10px] font-extrabold">{lang === "am" ? "ያልተሸጡ ቀሪ ዕቃዎች" : "Remaining left:"}</span>
                        <span className="font-black text-sm">{rem} pcs</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 bg-white border border-zinc-100 p-2 rounded-xl">
                      <span>{lang === "am" ? "የቀሪ እሴት ግምት" : "Rem Value:"}</span>
                      <span className="text-emerald-700 font-extrabold text-xs">ETB {estimatedWorth.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => setViewingProduct(p)}
                        className="px-3.5 py-1.5 bg-white border border-zinc-200 text-zinc-650 rounded-lg text-[10px] font-bold flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{lang === "am" ? "ተመልከት" : "View Details"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
