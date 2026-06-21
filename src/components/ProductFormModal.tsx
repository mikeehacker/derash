import React, { useState, useEffect } from "react";
import { Product } from "../types";
import EthiopianDatePicker from "./EthiopianDatePicker";
import { getLocalGregorianDate } from "../utils/ethiopianCalendar";
import { X, Upload, RefreshCw, Package, Hash, Banknote, Calendar, Image as ImageIcon, Sparkles } from "lucide-react";
import { Language, translations } from "../utils/translations";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  product?: Product | null; // If editing
  statusText?: string;
  errorText?: string;
  lang: Language;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  statusText = "",
  errorText = "",
  lang
}: ProductFormModalProps) {
  const isEdit = !!product;
  const t = translations[lang];

  // Form states
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [soldQuantity, setSoldQuantity] = useState<number | "">("");
  const [purchaseDate, setPurchaseDate] = useState(""); // Gregorian YYYY-MM-DD
  const [paymentMethod, setPaymentMethod] = useState<"CBE Birr" | "Telebirr" | "Cash">("CBE Birr");
  const [unitPrice, setUnitPrice] = useState<number | "">("");
  const [productImage, setProductImage] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [receiptImagePreview, setReceiptImagePreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto populate on Edit item open
  useEffect(() => {
    if (product) {
      setProductName(product.product_name);
      setQuantity(product.quantity);
      setSoldQuantity(product.sold_quantity ?? 0);
      setPurchaseDate(product.purchase_date);
      setPaymentMethod(product.payment_method);
      // Derive unit price from total_price / quantity or keep as is
      const derivedPrice = product.quantity > 0 ? Math.round(product.total_price / product.quantity) : product.total_price;
      setUnitPrice(derivedPrice);
      setProductImage(product.product_image);
      setImagePreview(product.product_image || null);
      setReceiptImage(product.receipt_image);
      setReceiptImagePreview(product.receipt_image || null);
    } else {
      // Clear all
      setProductName("");
      setQuantity("");
      setSoldQuantity(0);
      // default today Gregorian date
      setPurchaseDate(getLocalGregorianDate());
      setPaymentMethod("CBE Birr");
      setUnitPrice("");
      setProductImage(undefined);
      setImagePreview(null);
      setReceiptImage(undefined);
      setReceiptImagePreview(null);
    }
    setLocalError("");
  }, [product, isOpen]);

  if (!isOpen) return null;

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

    // Read file as base64 and compress to <250KB with high quality
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          setProductImage(b64);
          setImagePreview(b64);
          return;
        }

        let maxDim = 500;
        let quality = 0.85;
        let compressedB64 = "";

        // Loop to scale down and compress until size is under 20,000 characters (strictly under 15 KB)
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

          if (compressedB64.length <= 20000 || (maxDim <= 250 && quality <= 0.3)) {
            break;
          }

          // Shrink dimensions and quality to fit target size
          if (maxDim > 250) {
            maxDim -= 50;
          } else {
            quality -= 0.1;
          }
        }

        setProductImage(compressedB64);
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
    setProductImage(undefined);
    setImagePreview(null);
  };

  const handleReceiptImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Read file as base64 and compress to under 15 KB
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          setReceiptImage(b64);
          setReceiptImagePreview(b64);
          return;
        }

        let maxDim = 500;
        let quality = 0.85;
        let compressedB64 = "";

        // Loop to scale down and compress until size is under 20,000 characters (strictly under 15 KB)
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

          if (compressedB64.length <= 20000 || (maxDim <= 250 && quality <= 0.3)) {
            break;
          }

          // Shrink dimensions and quality to fit target size
          if (maxDim > 250) {
            maxDim -= 50;
          } else {
            quality -= 0.1;
          }
        }

        setReceiptImage(compressedB64);
        setReceiptImagePreview(compressedB64);
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

  const clearSelectedReceiptImage = () => {
    setReceiptImage(undefined);
    setReceiptImagePreview(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!productName.trim()) {
      setLocalError(lang === "am" ? "የዕቃው ስም ማስገባት ግዴታ ነው።" : "Product name is required.");
      return;
    }

    const qtyNumber = quantity === "" ? 0 : Number(quantity);
    if (qtyNumber < 0) {
      setLocalError(lang === "am" ? "ብዛት ከ 0 በታች መሆን አይችልም።" : "Quantity must be greater than or equal to 0.");
      return;
    }

    const soldQtyNumber = soldQuantity === "" ? 0 : Number(soldQuantity);
    if (soldQtyNumber < 0) {
      setLocalError(lang === "am" ? "የተሸጡ ብዛት ከ 0 በታች መሆን አይችልም።" : "Sold quantity must be greater than or equal to 0.");
      return;
    }

    if (soldQtyNumber > qtyNumber) {
      setLocalError(
        lang === "am"
          ? `የተሸጡ ዕቃዎች ብዛት (የተመዘገበው ${soldQtyNumber}) ከጠቅላላ ዕቃዎች ብዛት (ያለው ${qtyNumber}) መብለጥ አይችልም።`
          : `Sold quantity (${soldQtyNumber}) cannot exceed total quantity (${qtyNumber}).`
      );
      return;
    }

    if (!purchaseDate) {
      setLocalError(lang === "am" ? "እባክዎን የተገዛበትን ቀን ይምረጡ።" : "Please select a purchase date.");
      return;
    }

    setLoading(true);
    try {
      const priceNumber = unitPrice === "" ? 0 : Number(unitPrice);
      const totalPrice = qtyNumber * priceNumber;
      await onSubmit({
        product_name: productName.trim(),
        quantity: qtyNumber,
        sold_quantity: soldQtyNumber,
        purchase_date: purchaseDate,
        payment_method: paymentMethod,
        total_price: totalPrice,
        product_image: productImage,
        clear_image: !productImage && isEdit, // tells server to strip image
        receipt_image: receiptImage,
        clear_receipt_image: !receiptImage && isEdit // tells server to strip receipt image
      });
      onClose();
    } catch (err: any) {
      setLocalError(err.message || "Failed to submit product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-zinc-950/80 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-zinc-100/80 rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.22)] flex flex-col overflow-hidden max-h-[92vh]">
        
        {/* Header - Styled elegantly with a modern left-border accent */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-zinc-100 shrink-0 bg-white relative">
          <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-[#009b3a] via-emerald-400 to-amber-500 rounded-b-full"></div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold text-[#009b3a] tracking-widest uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100/50">
                {t.appName}
              </span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                • {lang === "am" ? "የዕቃ ምዝገባ ማሻሻያ ቅጽ" : "Intake Record"}
              </span>
            </div>
            <h2 className="text-xl font-extrabold font-sans text-zinc-900 leading-tight">
              {isEdit ? t.formTitleEdit : t.formTitleCreate}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-zinc-100 text-zinc-500 flex items-center justify-center transition duration-150 active:scale-90 cursor-pointer border border-zinc-100 bg-zinc-50/50 hover:shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error / Feedback banners inside modal body */}
        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden bg-white">
          
          {/* Scrollable Form Body Container */}
          <div className="flex-1 overflow-y-auto p-8 pb-16 space-y-6">
            
            {(localError || errorText) && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-100/60 text-rose-700 text-xs font-bold leading-relaxed flex items-start gap-2.5 animate-shake">
                <span className="text-rose-500 font-extrabold text-sm leading-none">⚠️</span>
                <div>{localError || errorText}</div>
              </div>
            )}

            {statusText && (
              <div className="p-4 rounded-2xl bg-zinc-50 text-zinc-650 text-xs font-mono border border-zinc-150/70">
                {statusText}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left side inputs */}
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 pl-0.5">
                    <Package className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{t.formProductName}</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400/80">
                      <Package className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dell XPS, Huawei Hub"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full min-h-[50px] pl-11 pr-4 text-[13px] bg-zinc-50/40 hover:bg-zinc-150/30 focus:bg-white border-2 border-zinc-100 focus:border-[#009b3a] rounded-2xl focus:ring-1 focus:ring-[#009b3a] focus:outline-none transition-all duration-200 font-semibold text-zinc-800 placeholder-zinc-400 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 pl-0.5">
                      <Hash className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{t.formQuantity}</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400/80">
                        <Hash className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        required
                        min={0}
                        placeholder={lang === "am" ? "የዕቃው ብዛት" : "e.g. 5"}
                        value={quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setQuantity("");
                          } else {
                            setQuantity(Math.max(0, Number(val)));
                          }
                        }}
                        className="w-full min-h-[50px] pl-11 pr-4 text-[13px] bg-zinc-50/40 hover:bg-zinc-150/30 focus:bg-white border-2 border-zinc-100 focus:border-[#009b3a] rounded-2xl focus:ring-1 focus:ring-[#009b3a] focus:outline-none transition-all duration-200 font-bold text-zinc-800 placeholder-zinc-400 shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 pl-0.5">
                      <Banknote className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{t.unitPrice}</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400/80">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        min={0}
                        placeholder={lang === "am" ? "ዋጋ" : "e.g. 10"}
                        value={unitPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setUnitPrice("");
                          } else {
                            setUnitPrice(Math.max(0, Number(val)));
                          }
                        }}
                        className="w-full min-h-[50px] pl-11 pr-4 text-[13px] bg-zinc-50/40 hover:bg-zinc-150/30 focus:bg-white border-2 border-zinc-100 focus:border-[#009b3a] rounded-2xl focus:ring-1 focus:ring-[#009b3a] focus:outline-none transition-all duration-200 font-bold text-zinc-800 placeholder-zinc-400 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {isEdit && (
                  <div className="p-4 rounded-3xl bg-zinc-50/45 border-2 border-zinc-100 space-y-3">
                    <label className="block text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
                      <span>{lang === "am" ? "የተሸጡ ዕቃዎች ብዛት (የተሸጠው መጠን)" : "Sold Quantity (Allocated Sales)"}</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400/80">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        min={0}
                        placeholder={lang === "am" ? "የተሸጡ ዕቃዎች ብዛት" : "e.g. 2"}
                        value={soldQuantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setSoldQuantity("");
                          } else {
                            setSoldQuantity(Math.max(0, Number(val)));
                          }
                        }}
                        className="w-full min-h-[50px] pl-11 pr-4 text-[13px] bg-white border-2 border-zinc-200 focus:border-[#009b3a] rounded-2xl focus:ring-1 focus:ring-[#009b3a] focus:outline-none transition-all duration-200 font-bold text-zinc-800 placeholder-zinc-400"
                      />
                    </div>
                    {quantity !== "" && soldQuantity !== "" && (
                      <div className="flex items-center gap-1.5 pl-1.5 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="text-[11px] text-zinc-500 font-bold">
                          {lang === "am"
                            ? `ያልተሸጡ ቀሪ እቃዎች ብዛት፦ ${(Number(quantity) - Number(soldQuantity)).toLocaleString()} ፍሬ` 
                            : `Remaining Unsold Stock: ${(Number(quantity) - Number(soldQuantity)).toLocaleString()} units`}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Total Stock Value projection slip */}
                <div className="p-4.5 rounded-[22px] bg-emerald-50/40 border-2 border-emerald-100/50 flex justify-between items-center transition-all shadow-[0_4px_16px_rgba(16,185,129,0.02)]">
                  <div className="flex flex-col">
                    <span className="text-emerald-800 font-black text-[10px] uppercase tracking-wider">{t.formTotalPrice}</span>
                    <span className="text-[10px] text-emerald-600/80 font-bold mt-0.5">{lang === "am" ? "የተጠቃለለ ዋጋ ስሌት" : "Auto Calculated"}</span>
                  </div>
                  <span className="font-extrabold text-emerald-900 text-lg font-sans tracking-wide">
                    ETB {(Number(quantity) * Number(unitPrice)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Right side inputs */}
              <div className="space-y-5">
                {/* Custom Datepicker */}
                <div className="border-2 border-zinc-100 rounded-[24px] p-4 bg-zinc-50/15">
                  <EthiopianDatePicker
                    value={purchaseDate}
                    onChange={(str) => setPurchaseDate(str)}
                    lang={lang}
                    label={t.formPurchaseDate}
                  />
                </div>

                {/* Secure Image Upload Box */}
                <div>
                  <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 pl-0.5">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{t.formImageAttachment}</span>
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative border-2 border-zinc-150 rounded-[24px] overflow-hidden shadow-md group animate-scaleIn bg-zinc-50">
                      <img
                        src={imagePreview}
                        alt="Upload Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-44 object-cover"
                      />
                      {/* Fully accessible touch-friendly delete overlay/button */}
                      <button
                        type="button"
                        onClick={clearSelectedImage}
                        className="absolute top-3 right-3 w-9 h-9 bg-rose-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer border border-rose-500"
                        title={lang === "am" ? "ምስሉን ሰርዝ" : "Delete Image"}
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="group flex flex-col items-center justify-center border-2 border-dashed border-zinc-250/70 rounded-[24px] p-6 sm:p-8 hover:bg-zinc-50/60 hover:border-[#009b3a]/50 bg-zinc-50/10 cursor-pointer transition-all duration-155 select-none text-center">
                      <div className="w-12 h-12 rounded-full bg-zinc-100/80 flex items-center justify-center mb-3 text-zinc-400 transition group-hover:text-[#009b3a]">
                        <Upload className="w-5.5 h-5.5" />
                      </div>
                      <span className="text-xs font-extrabold text-zinc-700 block mb-1">{lang === "am" ? "ፎቶ ለመጫን እዚህ ጋ ይንኩ" : t.formSelectPhoto}</span>
                      <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">JPEG/PNG, Max Size 7MB</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleImageFile}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Secure Receipt Image Upload Box */}
                <div>
                  <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 pl-0.5">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{t.formReceiptAttachment}</span>
                  </label>
                  
                  {receiptImagePreview ? (
                    <div className="relative border-2 border-zinc-150 rounded-[24px] overflow-hidden shadow-md group animate-scaleIn bg-zinc-50">
                      <img
                        src={receiptImagePreview}
                        alt="Receipt Upload Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-44 object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearSelectedReceiptImage}
                        className="absolute top-3 right-3 w-9 h-9 bg-rose-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer border border-rose-500"
                        title={lang === "am" ? "ምስሉን ሰርዝ" : "Delete Image"}
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="group flex flex-col items-center justify-center border-2 border-dashed border-zinc-250/70 rounded-[24px] p-6 sm:p-8 hover:bg-zinc-50/60 hover:border-[#009b3a]/50 bg-zinc-50/10 cursor-pointer transition-all duration-155 select-none text-center">
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
                      <span className="text-xs font-extrabold text-zinc-700 block mb-1">{lang === "am" ? "ደረሰኝ ፎቶ ይጫኑ" : "Upload Receipt Photo"}</span>
                      <span className="text-[10px] text-zinc-450 font-semibold uppercase tracking-wider">JPEG/PNG, MAX 7MB</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleReceiptImageFile}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions footer - Styled in a cohesive clean slip */}
          <div className="flex justify-end items-center gap-3.5 px-8 py-5 border-t border-zinc-100 bg-zinc-50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-6 text-[13px] font-bold bg-white border-2 border-zinc-200/80 rounded-2xl hover:bg-zinc-100 hover:text-zinc-800 text-zinc-650 transition-all duration-150 cursor-pointer flex-1 sm:flex-initial shadow-xs active:scale-95"
            >
              {t.formCancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="min-h-[48px] px-8 text-[13px] font-black bg-[#009b3a] hover:bg-[#008331] active:bg-[#007029] text-white rounded-2xl disabled:bg-zinc-300 shadow-md hover:shadow-lg hover:shadow-emerald-600/10 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-98 flex-1 sm:flex-initial"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
              <span>{isEdit ? t.formSubmitUpdate : t.formSubmitCreate}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
