import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { X, ShoppingBag, Landmark, PhoneCall, HandCoins, AlertCircle, Upload, Image as ImageIcon, Search } from "lucide-react";
import { Language, translations } from "../utils/translations";
import EthiopianDatePicker from "./EthiopianDatePicker";
import { getLocalGregorianDate } from "../utils/ethiopianCalendar";

interface SoldProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (
    productId: string,
    soldQty: number,
    paymentMethod: "CBE Birr" | "Telebirr" | "Cash",
    customUnitPrice: number,
    saleDate: string,
    receiptImage?: string
  ) => Promise<void>;
  lang: Language;
}

export default function SoldProductFormModal({
  isOpen,
  onClose,
  products,
  onSubmit,
  lang
}: SoldProductFormModalProps) {
  const t = translations[lang];

  // Selected product state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [soldQuantity, setSoldQuantity] = useState<number | "">("");
  const [unitPrice, setUnitPrice] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<"CBE Birr" | "Telebirr" | "Cash">("CBE Birr");
  const [saleDate, setSaleDate] = useState<string>(() => getLocalGregorianDate());
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);

  // Derive the active product if any is selected
  const activeProduct = products.find((p) => p.id === selectedProductId);

  // Filter products based on search query
  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  // Auto-populate or calculate values when activeProduct changes
  useEffect(() => {
    if (activeProduct) {
      const derivedUnitPrice = activeProduct.quantity > 0 
        ? Math.round(activeProduct.total_price / activeProduct.quantity) 
        : activeProduct.total_price;
      setUnitPrice(derivedUnitPrice);
      setSoldQuantity(""); // Reset on change
    } else {
      setUnitPrice("");
      setSoldQuantity("");
    }
    setReceiptImage(undefined);
    setImagePreview(null);
    setLocalError("");
  }, [selectedProductId]);

  // Reset entire form when opened/closed
  useEffect(() => {
    if (isOpen) {
      setSelectedProductId("");
      setProductSearchQuery("");
      setSoldQuantity("");
      setUnitPrice("");
      setPaymentMethod("CBE Birr");
      setSaleDate(getLocalGregorianDate());
      setReceiptImage(undefined);
      setImagePreview(null);
      setLocalError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Compute calculated values
  const currentSoldQty = soldQuantity === "" ? 0 : Number(soldQuantity);
  const currentUnitPrice = unitPrice === "" ? 0 : Number(unitPrice);
  const totalPrice = currentSoldQty * currentUnitPrice;

  // Maximum quantity allowed to be sold right now
  const remainingStock = activeProduct 
    ? Math.max(0, activeProduct.quantity - (activeProduct.sold_quantity ?? 0)) 
    : 0;

  // File Upload parsing, verification & compression trigger
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (7MB)
    if (file.size > 7 * 1024 * 1024) {
      setLocalError(
        lang === "am" 
          ? "የፎቶው መጠን ከ 7MB መብለጥ የለበትም።" 
          : "Image size exceeds limit of 7MB."
      );
      return;
    }

    // Validate type
    const fileType = file.type;
    if (fileType !== "image/jpeg" && fileType !== "image/png" && fileType !== "image/jpg" && fileType !== "image/webp") {
      setLocalError(
        lang === "am" 
          ? "JPEG፣ PNG ወይም WebP ምስሎች ብቻ ናቸው የሚፈቀዱት።" 
          : "Only WebP, JPEG, and PNG images are allowed."
      );
      return;
    }

    setLocalError("");

    // Read file as base64 and compress
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          setReceiptImage(b64);
          setImagePreview(b64);
          return;
        }

        let maxDim = 1200;
        let quality = 0.90;
        let compressedB64 = "";

        // Loop to scale down and compress to a high-quality budget (under 350,000 chars, approx 260 KB)
        while (true) {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Try WebP first for superior compression and quality, fallback to JPEG if unsupported
          let tempB64 = canvas.toDataURL("image/webp", quality);
          if (!tempB64.startsWith("data:image/webp")) {
            tempB64 = canvas.toDataURL("image/jpeg", quality);
          }
          compressedB64 = tempB64;

          if (compressedB64.length <= 350000 || (maxDim <= 400 && quality <= 0.4)) {
            break;
          }

          // Shrink dimensions and quality to fit target size
          if (maxDim > 400) {
            maxDim -= 100;
          } else {
            quality -= 0.1;
          }
        }

        setReceiptImage(compressedB64);
        setImagePreview(compressedB64);
      };
      img.src = b64;
    };
    reader.onerror = () => {
      setLocalError(
        lang === "am" 
          ? "ምስሉን መጫን አልተቻለም።" 
          : "Error loading image file."
      );
    };
    reader.readAsDataURL(file);
  };

  const clearSelectedImage = () => {
    setReceiptImage(undefined);
    setImagePreview(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!selectedProductId) {
      setLocalError(
        lang === "am" 
          ? "እባክዎን በመጀመሪያ ዕቃ ይምረጡ።" 
          : "Please select a product first."
      );
      return;
    }

    if (currentSoldQty <= 0) {
      setLocalError(
        lang === "am" 
          ? "የተሸጡ ዕቃዎች ብዛት ከ 0 መበለጥ አለበት።" 
          : "Sold quantity must be greater than 0."
      );
      return;
    }

    if (currentSoldQty > remainingStock) {
      setLocalError(
        lang === "am"
          ? `ይቅርታ! ያለው ቀሪ ክምችት ${remainingStock} ብቻ ነው። የተፃፈው የሽያጭ ብዛት (${currentSoldQty}) ማለፍ አይችልም።`
          : `Sorry! The remaining stock is only ${remainingStock}. You cannot sell ${currentSoldQty}.`
      );
      return;
    }

    setLoading(true);
    try {
      await onSubmit(selectedProductId, currentSoldQty, paymentMethod, currentUnitPrice, saleDate, receiptImage);
      onClose();
    } catch (err: any) {
      setLocalError(err.message || "Failed to submit sale.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-zinc-900/60 backdrop-blur-xs transition-all duration-300">
      <div className="relative w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:max-w-xl bg-white md:border md:border-zinc-100 md:rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-100 shrink-0 bg-white">
          <div>
            <h2 className="text-xl font-bold font-sans text-zinc-900 leading-tight">
              {lang === "am" ? "የሽያጭ ምዝገባ" : "Sales Registration"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-zinc-100 text-zinc-500 flex items-center justify-center transition duration-150 active:scale-90 cursor-pointer border border-zinc-100 bg-zinc-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto p-6 pb-12 space-y-5">
            
            {localError && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-100 text-rose-600 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{localError}</span>
              </div>
            )}

            {/* Step 1: Item Selection */}
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-wider">
                {lang === "am" ? "የዕቃው ስም" : "Product Name Selection"}
              </label>
              
              {/* Product search input */}
              <div className="relative">
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder={lang === "am" ? "በምርት ስም ፈልግ..." : "Search by product name..."}
                  className="w-full min-h-[44px] pl-10 pr-4 text-xs bg-zinc-50 hover:bg-zinc-100/30 focus:bg-white border-2 border-zinc-100 focus:border-[#009b3a] rounded-2xl focus:ring-1 focus:ring-[#009b3a] focus:outline-none transition-all duration-200 font-bold text-zinc-850 placeholder-zinc-400"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              <select
                required
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full min-h-[48px] px-4 text-xs bg-zinc-50 hover:bg-zinc-100/30 focus:bg-white border-2 border-zinc-100 focus:border-[#009b3a] rounded-2xl focus:ring-1 focus:ring-[#009b3a] focus:outline-none transition-all duration-200 font-bold text-zinc-850"
              >
                <option value="">
                  {lang === "am" ? "-- እባክዎን የሚሸጥ ዕቃ ይምረጡ --" : "-- Select Product to sell --"}
                </option>
                {filteredProducts.map((p) => {
                  const rem = Math.max(0, p.quantity - (p.sold_quantity ?? 0));
                  return (
                    <option key={p.id} value={p.id} disabled={rem <= 0}>
                      {p.product_name} ({lang === "am" ? `ቀሪ ክምችት: ${rem}` : `Stock left: ${rem}`})
                    </option>
                  );
                })}
              </select>

              {/* Step 1.2: Image & details preview card */}
              {activeProduct && (
                <div className="bg-zinc-50/70 border border-zinc-100 p-4 rounded-2xl flex items-center gap-4">
                  {activeProduct.product_image ? (
                    <img
                      src={activeProduct.product_image}
                      alt={activeProduct.product_name}
                      className="w-16 h-16 rounded-xl object-cover border border-zinc-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-zinc-200 text-zinc-500 flex items-center justify-center font-bold text-lg border border-zinc-300">
                      {activeProduct.product_name.substr(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-sm text-zinc-800">{activeProduct.product_name}</h4>
                    <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500 font-bold">
                      <span className="px-2 py-0.5 bg-zinc-100 rounded border border-zinc-200">
                        {lang === "am" ? `ቅርቅብ ጠቅላላ: ${activeProduct.quantity}` : `Intake Stock: ${activeProduct.quantity}`}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-150">
                        {lang === "am" ? `የተሸጡ: ${activeProduct.sold_quantity ?? 0}` : `Already Sold: ${activeProduct.sold_quantity ?? 0}`}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-150">
                        {lang === "am" ? `የቀረው ቀሪ: ${remainingStock}` : `Now Left: ${remainingStock}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Grid for parameters */}
            <div className="grid grid-cols-2 gap-4">
              {/* Product Quantity input */}
              <div>
                <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-2">
                  {lang === "am" ? "የተሸጡ ዕቃዎች ብዛት" : "Sold Quantity"}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={remainingStock}
                  placeholder={lang === "am" ? "የሽያጭ መጠን" : "e.g. 5"}
                  value={soldQuantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setSoldQuantity("");
                    } else {
                      setSoldQuantity(Math.max(1, Number(val)));
                    }
                  }}
                  disabled={!selectedProductId}
                  className="w-full min-h-[48px] px-4 text-[13px] bg-zinc-50 hover:bg-zinc-100/30 focus:bg-white border-2 border-zinc-100 focus:border-[#009b3a] rounded-2xl focus:ring-1 focus:ring-[#009b3a] focus:outline-none transition-all duration-200 font-bold text-zinc-850 placeholder-zinc-400 disabled:opacity-50"
                />
              </div>

              {/* Unit Price input */}
              <div>
                <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-2">
                  {lang === "am" ? "የአንዱ ዋጋ" : "Unit Price (ETB)"}
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder={lang === "am" ? "ዕቃ መሸጫ ዋጋ" : "e.g. 1500"}
                  value={unitPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setUnitPrice("");
                    } else {
                      setUnitPrice(Math.max(0, Number(val)));
                    }
                  }}
                  disabled={!selectedProductId}
                  className="w-full min-h-[48px] px-4 text-[13px] bg-zinc-50 hover:bg-zinc-100/30 focus:bg-white border-2 border-zinc-100 focus:border-[#009b3a] rounded-2xl focus:ring-1 focus:ring-[#009b3a] focus:outline-none transition-all duration-200 font-bold text-zinc-850 placeholder-zinc-400 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Paymethod radio grid selecting */}
            <div className="space-y-2.5">
              <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-wider">
                {lang === "am" ? "የክፍያ መንገድ" : "Payment Method"}
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CBE Birr")}
                  className={`py-3 px-3 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === "CBE Birr"
                      ? "border-[#009b3a] bg-emerald-50/20 text-[#009b3a] font-extrabold"
                      : "border-zinc-100 bg-zinc-50/70 text-zinc-650 hover:bg-zinc-100 hover:border-zinc-200 font-bold"
                  }`}
                >
                  <Landmark className="w-4 h-4 text-purple-700" />
                  <span className="text-[11px]">CBE Birr</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("Telebirr")}
                  className={`py-3 px-3 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === "Telebirr"
                      ? "border-[#009b3a] bg-emerald-50/20 text-[#009b3a] font-extrabold"
                      : "border-zinc-100 bg-zinc-50/70 text-zinc-650 hover:bg-zinc-100 hover:border-zinc-200 font-bold"
                  }`}
                >
                  <PhoneCall className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px]">Telebirr</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("Cash")}
                  className={`py-3 px-3 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === "Cash"
                      ? "border-[#009b3a] bg-emerald-50/20 text-[#009b3a] font-extrabold"
                      : "border-zinc-100 bg-zinc-50/70 text-zinc-650 hover:bg-zinc-100 hover:border-zinc-200 font-bold"
                  }`}
                >
                  <HandCoins className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] font-black">{lang === "am" ? "በእጅ (Cash)" : "Cash"}</span>
                </button>
              </div>
            </div>

            {/* Sale Date Picker */}
            <div className="space-y-1">
              <EthiopianDatePicker
                value={saleDate}
                onChange={(gDateStr) => setSaleDate(gDateStr)}
                label={lang === "am" ? "የሽያጭ ቀን" : "Date of Sale"}
                id="sold-item-date-picker"
                lang={lang}
              />
            </div>

            {/* Receipt Image Upload */}
            <div className="space-y-2.5">
              <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 pl-0.5">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{lang === "am" ? "የዕቃው የተገዛበት ደረሰኝ ፎቶ" : "Receipt Photo Attachment"}</span>
              </label>
              
              {imagePreview ? (
                <div className="relative border-2 border-zinc-150 rounded-2xl overflow-hidden shadow-sm group bg-zinc-50 max-h-40 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Receipt Preview"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="absolute top-2.5 right-2.5 w-8 h-8 bg-rose-600 text-white rounded-full shadow-md flex items-center justify-center hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer border border-rose-500"
                    title={lang === "am" ? "ምስሉን ሰርዝ" : "Delete Image"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="group flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl p-6 sm:p-8 hover:bg-zinc-50/60 hover:border-[#009b3a]/50 bg-zinc-50/10 cursor-pointer transition-all duration-150 select-none text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-100/80 flex items-center justify-center mb-3 text-zinc-400 transition group-hover:text-[#009b3a] group-hover:bg-emerald-50">
                    <svg 
                      className="w-5.5 h-5.5 text-zinc-400 group-hover:text-[#009b3a] transition-colors" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
                      <path d="M12 6v12" />
                      <path d="M9.5 8.5h3a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3h3" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-zinc-700 block mb-1">{lang === "am" ? "ደረሰኝ ፎቶ ይጫኑ" : "Upload Receipt Photo"}</span>
                  <span className="text-[10px] text-zinc-450 font-semibold uppercase tracking-wider">JPEG/PNG, MAX 7MB</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageFile}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Total calculated price box */}
            <div className="bg-[#fafafa] border border-zinc-100 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
              <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">
                {lang === "am" ? "ሙሉ ዋጋ፦" : "Total Price:"}
              </span>
              <span className="text-xl font-extrabold font-sans text-[#009b3a]">
                ETB {totalPrice.toLocaleString()}
              </span>
            </div>

          </div>

          {/* Sticky footer buttons */}
          <div className="p-6 bg-[#fafafa] border-t border-zinc-100 shrink-0 flex items-center justify-end gap-3 rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 hover:bg-zinc-100 text-zinc-500 font-bold text-xs rounded-2xl transition active:scale-95 border border-zinc-200 bg-white"
            >
              {lang === "am" ? "ይቅር" : "Cancel"}
            </button>

            <button
              type="submit"
              disabled={loading || !selectedProductId || currentSoldQty <= 0}
              className="px-7 py-3 bg-[#009b3a] hover:bg-[#007b2c] disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl transition shadow-md shadow-emerald-700/10 hover:shadow-lg active:scale-95 cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <span>{lang === "am" ? "በመመዝገብ ላይ..." : "Recording..."}</span>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{lang === "am" ? "ሽያጭ መዝግብ" : "Record Sales Entry"}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
