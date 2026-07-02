import { jsPDF } from "jspdf";
import { Product, Sale } from "../types";
import { toEthiopian, formatEthiopianDate, getLocalGregorianDate } from "./ethiopianCalendar";

// Helper to convert any image URL/Data URL to a safe base64-encoded PNG using standard canvas
async function getBase64Image(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith("data:image")) return url; // Already standard base64 data, return directly
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width || img.naturalWidth;
        canvas.height = img.height || img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
          return;
        }
      } catch (e) {
        console.error("Failed to convert image to base64 canvas", e);
      }
      resolve(null);
    };
    img.onerror = () => {
      resolve(null);
    };
  });
}

// Get image format from base64 data URL
function getFormat(dataUrl: string | null | undefined): string {
  if (!dataUrl) return "PNG";
  if (dataUrl.startsWith("data:image/webp")) return "WEBP";
  if (dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")) return "JPEG";
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  return "PNG";
}

// Append a beautiful high-resolution image gallery at the end of the PDF
function appendImagesGallery(
  doc: jsPDF,
  lang: string,
  items: Array<{
    name: string;
    productImg?: string | null;
    receiptImg?: string | null;
    details?: string;
  }>
) {
  const itemsWithImages = items.filter(item => item.productImg || item.receiptImg);
  if (itemsWithImages.length === 0) return;

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.addPage();

  // Left banner border accent (Ethiopian Green)
  doc.setFillColor(0, 155, 58);
  doc.rect(0, 0, 5, pageHeight, "F");

  // Title
  const galleryTitle = lang === "am" ? "የዕቃዎች እና የደረሰኞች ፎቶዎች ማውጫ (Gallery)" : "Merchandise & Receipts Gallery Appendix";
  drawTextWithCanvas(doc, galleryTitle, 15, 15, { fontSize: 13, isBold: true, color: "#0f172a" });

  const subtitle = lang === "am"
    ? "ለግልጽነት እና ለሂሳብ ቁጥጥር እንዲረዳ የተያያዙ ከፍተኛ ጥራት ያላቸው ምስሎች"
    : "High-resolution attachments for transaction validation and audit clarity.";
  drawTextWithCanvas(doc, subtitle, 15, 22, { fontSize: 8, color: "#64748b" });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, 26, pageWidth - 15, 26);

  const startX = 15;
  const colWidth = (pageWidth - 30 - 6) / 2; // ~87mm wide
  const cardHeight = 65; // ~65mm high

  let itemIndexOnPage = 0;

  itemsWithImages.forEach((item, index) => {
    // Fit up to 6 cards per page (3 rows of 2 columns)
    if (itemIndexOnPage >= 6) {
      doc.addPage();
      // Accent
      doc.setFillColor(0, 155, 58);
      doc.rect(0, 0, 5, pageHeight, "F");

      // Gallery Header
      drawTextWithCanvas(doc, galleryTitle, 15, 14, { fontSize: 10, isBold: true, color: "#0f172a" });
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(15, 18, pageWidth - 15, 18);

      itemIndexOnPage = 0;
    }

    const row = Math.floor(itemIndexOnPage / 2);
    const col = itemIndexOnPage % 2;

    const isFirstPage = index < 6;
    const startY = isFirstPage ? 32 : 24;
    const cardY = startY + row * (cardHeight + 6);
    const cardX = startX + col * (colWidth + 6);

    // Draw container card box
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.rect(cardX, cardY, colWidth, cardHeight, "FD");

    // Title / Product Name inside card
    drawTextWithCanvas(doc, item.name, cardX + 4, cardY + 5.5, { fontSize: 8.5, isBold: true, color: "#0f172a" });
    if (item.details) {
      drawTextWithCanvas(doc, item.details, cardX + 4, cardY + 11.5, { fontSize: 7, color: "#475569" });
    }

    // Image sizing
    const singleImgSize = 36;
    const imgY = cardY + 16;

    if (item.productImg && item.receiptImg) {
      // Both images exist: side-by-side
      try {
        doc.addImage(item.productImg, getFormat(item.productImg), cardX + 4, imgY, singleImgSize, singleImgSize);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.25);
        doc.rect(cardX + 4, imgY, singleImgSize, singleImgSize);
      } catch (e) {
        // failed image placeholder
      }
      drawTextWithCanvas(doc, lang === "am" ? "የምርት ፎቶ" : "Product Photo", cardX + 4 + singleImgSize / 2, imgY + singleImgSize + 3.5, { fontSize: 6.5, color: "#64748b", align: "center" });

      try {
        doc.addImage(item.receiptImg, getFormat(item.receiptImg), cardX + 4 + singleImgSize + 4, imgY, singleImgSize, singleImgSize);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.25);
        doc.rect(cardX + 4 + singleImgSize + 4, imgY, singleImgSize, singleImgSize);
      } catch (e) {
        // failed image placeholder
      }
      drawTextWithCanvas(doc, lang === "am" ? "ደረሰኝ ፎቶ" : "Receipt Photo", cardX + 4 + singleImgSize + 4 + singleImgSize / 2, imgY + singleImgSize + 3.5, { fontSize: 6.5, color: "#64748b", align: "center" });

    } else {
      // Centered single image
      const aloneImg = item.productImg || item.receiptImg;
      const isReceipt = !!item.receiptImg;
      if (aloneImg) {
        const centerImgWidth = 48;
        const centerImgHeight = 36;
        const centerImgX = cardX + (colWidth - centerImgWidth) / 2;
        try {
          doc.addImage(aloneImg, getFormat(aloneImg), centerImgX, imgY, centerImgWidth, centerImgHeight);
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.25);
          doc.rect(centerImgX, imgY, centerImgWidth, centerImgHeight);
        } catch (e) {
          // failed image placeholder
        }
        const aloneLabel = isReceipt
          ? (lang === "am" ? "የተገዛበት ደረሰኝ ፎቶ" : "Purchase Receipt Photo")
          : (lang === "am" ? "የዕቃው ፎቶ" : "Product Photo");
        drawTextWithCanvas(doc, aloneLabel, cardX + colWidth / 2, imgY + centerImgHeight + 3.5, { fontSize: 6.5, color: "#64748b", align: "center" });
      }
    }

    itemIndexOnPage++;
  });
}

// Draw crisp Amharic or Latin text using high-res canvas rendering directly on jsPDF
function drawTextWithCanvas(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: {
    fontSize?: number;
    isBold?: boolean;
    color?: string;
    align?: "left" | "right" | "center";
  } = {}
) {
  const { fontSize = 9, isBold = false, color = "#000000", align = "left" } = options;
  
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Render high-res (scale factor 5) to prevent any blurriness or compression scaling issues
  const scale = 5;
  const pixelFontSize = fontSize * scale;
  
  const fontWeight = isBold ? "bold" : "normal";
  // Fallbacks support Noto Sans Ethiopic, Nyala (Windows), Abyssinica SIL (Mac/Linux), Inter (Primary Latin), system-ui default
  ctx.font = `${fontWeight} ${pixelFontSize}px 'Noto Sans Ethiopic', Nyala, 'Abyssinica SIL', 'Inter', 'Segoe UI', sans-serif`;
  
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = pixelFontSize * 1.35;

  canvas.width = Math.max(1, textWidth + 12);
  canvas.height = Math.max(1, textHeight);

  // Apply style parameters after canvas resize
  ctx.font = `${fontWeight} ${pixelFontSize}px 'Noto Sans Ethiopic', Nyala, 'Abyssinica SIL', 'Inter', 'Segoe UI', sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillText(text, 6, canvas.height / 2);

  const imgData = canvas.toDataURL("image/png");
  
  // Calculate precise mm dimensions
  const mmHeight = fontSize * 0.3527 * 1.15;
  const mmWidth = (canvas.width / canvas.height) * mmHeight;

  let posX = x;
  if (align === "right") {
    posX = x - mmWidth;
  } else if (align === "center") {
    posX = x - mmWidth / 2;
  }

  // Centering drawing offset
  doc.addImage(imgData, "PNG", posX, y - (mmHeight * 0.72), mmWidth, mmHeight);
}

export async function generateInventoryPDF(products: Product[], lang: string = "am", generatorName: string = "Manager") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page Dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Color theme definition
  const colorGreen600 = [0, 155, 58];    // Ethiopian Green (#009b3a)
  const colorSlate900 = [15, 23, 42];    // Dark Slate
  const colorLine = [228, 228, 231];     // Divider lines

  // Pre-load all available product and receipt images asynchronously
  const loadedImages: Record<string, string | null> = {};
  const loadedReceipts: Record<string, string | null> = {};
  for (const p of products) {
    if (p.product_image) {
      try {
        loadedImages[p.id] = await getBase64Image(p.product_image);
      } catch (e) {
        loadedImages[p.id] = null;
      }
    } else {
      loadedImages[p.id] = null;
    }

    if (p.receipt_image) {
      try {
        loadedReceipts[p.id] = await getBase64Image(p.receipt_image);
      } catch (e) {
        loadedReceipts[p.id] = null;
      }
    } else {
      loadedReceipts[p.id] = null;
    }
  }

  // 1. Lefthand Flag Decor line (Ethiopian National color accent)
  doc.setFillColor(colorGreen600[0], colorGreen600[1], colorGreen600[2]);
  doc.rect(0, 0, 5, pageHeight, "F");

  // 2. Header (White background with clean fonts)
  const grToday = getLocalGregorianDate();
  const etToday = toEthiopian(grToday);

  // Left Title
  drawTextWithCanvas(doc, "ደራሽ | DERASH", 15, 14, { fontSize: 20, isBold: true, color: "#009b3a" });
  
  // Right Title
  drawTextWithCanvas(
    doc, 
    "የአዲስ ዕቃ ክምችት ቁጥጥር ሥርዓት", 
    pageWidth - 15, 14, 
    { fontSize: 11, isBold: true, color: "#1e293b", align: "right" }
  );

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.35);
  doc.line(15, 17.5, pageWidth - 15, 17.5);

  // Metadata labels
  const auditorLabel = lang === "am" ? `ማጣሪያ ባለሙያ: ${generatorName.toUpperCase()}` : `Finance Officer: ${generatorName.toUpperCase()}`;
  drawTextWithCanvas(doc, auditorLabel, 15, 22, { fontSize: 8.5, color: "#475569" });
  
  const etDateStr = formatEthiopianDate(etToday, lang as any);
  const issuedOnLabel = lang === "am" 
    ? `የተወሰደበት ቀን: ${grToday} (${etDateStr})` 
    : `Issued On: ${grToday} (${etDateStr})`;
  drawTextWithCanvas(
    doc, 
    issuedOnLabel, 
    pageWidth - 15, 22, 
    { fontSize: 8.5, color: "#475569", align: "right" }
  );

  // Bold separating line below header
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(15, 26, pageWidth - 15, 26);

  // 3. Dynamic Statistics Box summary (4 KPI Cards)
  let totalQtySum = 0;
  let totalPriceSum = 0;
  let totalSoldQtySum = 0;
  let totalSoldWorthSum = 0;
  let totalUnsoldQtySum = 0;
  let totalUnsoldWorthSum = 0;

  products.forEach(p => {
    totalQtySum += p.quantity;
    totalPriceSum += (p.total_price || 0);

    const sq = p.sold_quantity ?? 0;
    totalSoldQtySum += sq;
    const unitPrice = p.quantity > 0 ? (p.total_price / p.quantity) : 0;
    totalSoldWorthSum += sq * unitPrice;

    const rem = p.quantity - sq;
    totalUnsoldQtySum += rem;
    totalUnsoldWorthSum += rem * unitPrice;
  });

  const sellThroughRate = totalQtySum > 0 ? Math.round((totalSoldQtySum / totalQtySum) * 1000) / 10 : 0;

  const kpiTop = 31;
  const kpiCardWidth = 43.5;

  // KPI 1: Total Inventory Worth (Light Blue)
  doc.setFillColor(239, 246, 255);
  doc.rect(15, kpiTop, kpiCardWidth, 18, "F");
  doc.setFillColor(59, 130, 246);
  doc.rect(15, kpiTop, 1.5, 18, "F");
  drawTextWithCanvas(doc, lang === "am" ? "ጠቅላላ የክምችት ዋጋ" : "Total Inventory Worth", 18, kpiTop + 4.5, { fontSize: 7, isBold: true, color: "#1e40af" });
  drawTextWithCanvas(doc, `ETB ${Math.round(totalPriceSum).toLocaleString()}`, 18, kpiTop + 12.5, { fontSize: 9.5, isBold: true, color: "#1e3a8a" });

  // KPI 2: Total Sold Value (Light Green)
  doc.setFillColor(240, 253, 244);
  doc.rect(15 + 43.5 + 2, kpiTop, kpiCardWidth, 18, "F");
  doc.setFillColor(34, 197, 94);
  doc.rect(15 + 43.5 + 2, kpiTop, 1.5, 18, "F");
  drawTextWithCanvas(doc, lang === "am" ? "ጠቅላላ የተሸጡ ዕቃዎች ዋጋ" : "Total Sold Value", 15 + 43.5 + 2 + 3, kpiTop + 4.5, { fontSize: 7, isBold: true, color: "#166534" });
  drawTextWithCanvas(doc, `ETB ${Math.round(totalSoldWorthSum).toLocaleString()}`, 15 + 43.5 + 2 + 3, kpiTop + 12.5, { fontSize: 9.5, isBold: true, color: "#14532d" });

  // KPI 3: Unsold Value Asset (Light Orange)
  doc.setFillColor(255, 247, 237);
  doc.rect(15 + 43.5 * 2 + 4, kpiTop, kpiCardWidth, 18, "F");
  doc.setFillColor(249, 115, 22);
  doc.rect(15 + 43.5 * 2 + 4, kpiTop, 1.5, 18, "F");
  drawTextWithCanvas(doc, lang === "am" ? "ያልተሸጡ ቀሪዎች ዋጋ" : "Unsold Value Asset", 15 + 43.5 * 2 + 4 + 3, kpiTop + 4.5, { fontSize: 7, isBold: true, color: "#9a3412" });
  drawTextWithCanvas(doc, `ETB ${Math.round(totalUnsoldWorthSum).toLocaleString()}`, 15 + 43.5 * 2 + 4 + 3, kpiTop + 12.5, { fontSize: 9.5, isBold: true, color: "#7c2d12" });

  // KPI 4: Sales Velocity / Rate (Light Purple)
  doc.setFillColor(250, 245, 255);
  doc.rect(15 + 43.5 * 3 + 6, kpiTop, kpiCardWidth, 18, "F");
  doc.setFillColor(168, 85, 247);
  doc.rect(15 + 43.5 * 3 + 6, kpiTop, 1.5, 18, "F");
  drawTextWithCanvas(doc, lang === "am" ? "የሽያጭ ፍጥነት" : "Sales Velocity", 15 + 43.5 * 3 + 6 + 3, kpiTop + 4.5, { fontSize: 7, isBold: true, color: "#6b21a8" });
  drawTextWithCanvas(doc, `${sellThroughRate}%`, 15 + 43.5 * 3 + 6 + 3, kpiTop + 12.5, { fontSize: 9.5, isBold: true, color: "#581c87" });

  // 4. Main Section Title
  const sectionTitle = lang === "am" ? "የዕቃዎች ዝርዝር መግለጫ" : "Itemized Ledger Details";
  drawTextWithCanvas(doc, sectionTitle, 15, 56, { fontSize: 10, isBold: true, color: "#1e293b" });

  // Subtitle line separators
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, 59, pageWidth - 15, 59);

  // 5. Table parameters
  const tableTop = 62;
  const startX = 15;

  // Header background block (Dark green)
  doc.setFillColor(22, 101, 52);
  doc.rect(startX, tableTop, 180, 8.5, "F");

  // Render Column Headers (6 Columns)
  drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ፎቶ" : "Photo", startX + 2, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff" });
  drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ስም" : "Item Name", startX + 15, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff" });
  drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ብዛት" : "Quantity", startX + 72.5, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "center" });
  drawTextWithCanvas(doc, lang === "am" ? "የአንዱ ዋጋ" : "Unit Price", startX + 115, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "right" });
  drawTextWithCanvas(doc, lang === "am" ? "ሙሉ ዋጋ" : "Total Price", startX + 145, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "right" });
  drawTextWithCanvas(doc, lang === "am" ? "የምዝገባ ቀን" : "Registration Date", startX + 178, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "right" });

  // Render Product Transaction rows
  let currentY = tableTop + 8.5;
  const rowHeight = 16.5;

  products.forEach((p, index) => {
    // Multi-page checking
    if (currentY + rowHeight > pageHeight - 32) {
      doc.addPage();
      
      // Page background decor
      doc.setFillColor(colorGreen600[0], colorGreen600[1], colorGreen600[2]);
      doc.rect(0, 0, 5, pageHeight, "F");
      
      currentY = 20;
      
      // Re-render table header on new page
      doc.setFillColor(22, 101, 52);
      doc.rect(startX, currentY, 180, 8.5, "F");

      drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ፎቶ" : "Photo", startX + 2, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff" });
      drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ስም" : "Item Name", startX + 15, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff" });
      drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ብዛት" : "Quantity", startX + 72.5, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "center" });
      drawTextWithCanvas(doc, lang === "am" ? "የአንዱ ዋጋ" : "Unit Price", startX + 115, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "right" });
      drawTextWithCanvas(doc, lang === "am" ? "ሙሉ ዋጋ" : "Total Price", startX + 145, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "right" });
      drawTextWithCanvas(doc, lang === "am" ? "የምዝገባ ቀን" : "Registration Date", startX + 178, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "right" });
      
      currentY += 8.5;
    }

    // Row zebra alternating layout
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(startX, currentY, 180, rowHeight, "F");

    // Divider line below row
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.35);
    doc.line(startX, currentY + rowHeight, startX + 180, currentY + rowHeight);

    // Image coordinates definitions
    const imgX = startX + 0.5;
    const imgY = currentY + 2.25;
    const imgSize = 11;

    const base64Img = loadedImages[p.id];
    if (base64Img) {
      try {
        doc.addImage(base64Img, getFormat(base64Img), imgX, imgY, imgSize, imgSize);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.25);
        doc.rect(imgX, imgY, imgSize, imgSize);
      } catch (e) {
        doc.setFillColor(240, 248, 241);
        doc.rect(imgX, imgY, imgSize, imgSize, "F");
        doc.setDrawColor(0, 155, 58);
        doc.setLineWidth(0.25);
        doc.rect(imgX, imgY, imgSize, imgSize);
        const initials = p.product_name.substring(0, 2);
        drawTextWithCanvas(doc, initials, imgX + 5.5, imgY + 6, { fontSize: 7, isBold: true, color: "#009b3a", align: "center" });
      }
    } else {
      doc.setFillColor(240, 248, 241);
      doc.rect(imgX, imgY, imgSize, imgSize, "F");
      doc.setDrawColor(0, 155, 58);
      doc.setLineWidth(0.25);
      doc.rect(imgX, imgY, imgSize, imgSize);
      const initials = p.product_name.substring(0, 2);
      drawTextWithCanvas(doc, initials, imgX + 5.5, imgY + 6, { fontSize: 7, isBold: true, color: "#009b3a", align: "center" });
    }

    const textY = currentY + 8.25;

    // Column 2: Product Name next to image
    drawTextWithCanvas(doc, p.product_name, startX + 15, textY, { fontSize: 8, isBold: true, color: "#1e293b" });

    // Mathematical calculations
    const sold = p.sold_quantity ?? 0;
    const left = Math.max(0, p.quantity - sold);
    const unitPrice = p.quantity > 0 ? (p.total_price / p.quantity) : 0;
    const totalPrice = left * unitPrice;

    // Column 3: የዕቃው ብዛት
    const qtyText = lang === "am" ? `${left} ፍሬ` : `${left} Pcs`;
    drawTextWithCanvas(doc, qtyText, startX + 72.5, textY, { fontSize: 7.5, color: "#1f2937", align: "center" });

    // Column 4: የአንዱ ዋጋ
    drawTextWithCanvas(doc, `ETB ${Math.round(unitPrice).toLocaleString()}`, startX + 115, textY, { fontSize: 7.5, color: "#1f2937", align: "right", isBold: true });

    // Column 5: ሙሉ ዋጋ
    drawTextWithCanvas(doc, `ETB ${Math.round(totalPrice).toLocaleString()}`, startX + 145, textY, { fontSize: 7.5, color: "#1f2937", align: "right", isBold: true });

    // Column 6: የእቃዎች የተመዘገቡት ቀን
    drawTextWithCanvas(doc, formatEthiopianDate(toEthiopian(p.purchase_date), lang as any), startX + 178, textY, { fontSize: 7.5, color: "#475569", align: "right" });

    currentY += rowHeight;
  });

  // 6. Summary Footer Block Total aggregate (Side-by-side cards)
  currentY += 6;
  if (currentY + 36 > pageHeight) {
    doc.addPage();
    doc.setFillColor(colorGreen600[0], colorGreen600[1], colorGreen600[2]);
    doc.rect(0, 0, 5, pageHeight, "F");
    currentY = 20;
  }

  // Left totals box (Blue theme)
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(0.35);
  doc.rect(startX, currentY, 88, 15, "FD");

  const leftText = lang === "am"
    ? `የተጠቃለለ ድምር ማጠቃለያ : ETB ${Math.round(totalPriceSum).toLocaleString()}`
    : `Total Inventory Worth: ETB ${Math.round(totalPriceSum).toLocaleString()}`;
  drawTextWithCanvas(doc, leftText, startX + 44, currentY + 7.5, { fontSize: 9, isBold: true, color: "#1e3a8a", align: "center" });

  // Right totals box (Orange theme)
  doc.setFillColor(255, 247, 237);
  doc.setDrawColor(254, 215, 170);
  doc.setLineWidth(0.35);
  doc.rect(startX + 88 + 4, currentY, 88, 15, "FD");

  const rightText = lang === "am"
    ? `ያልተሸጡ ቀሪዎች : ETB ${Math.round(totalUnsoldWorthSum).toLocaleString()}`
    : `Unsold Remaining: ETB ${Math.round(totalUnsoldWorthSum).toLocaleString()}`;
  drawTextWithCanvas(doc, rightText, startX + 88 + 4 + 44, currentY + 7.5, { fontSize: 9, isBold: true, color: "#c2410c", align: "center" });

  // 7. Signatures / Stamps sections
  currentY += 25;
  if (currentY + 20 < pageHeight) {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.35);
    doc.line(startX + 10, currentY, startX + 60, currentY);
    doc.line(pageWidth - 70, currentY, pageWidth - 20, currentY);

    drawTextWithCanvas(doc, "የሂሳብ ባለሙያ ፊርማ / (Accountant Signature)", startX + 35, currentY + 4, { fontSize: 7.5, isBold: true, color: "#1e293b", align: "center" });
    drawTextWithCanvas(doc, "የሽያጭ ባለሙያ ፊርማ / (Sales Specialist Signature)", pageWidth - 45, currentY + 4, { fontSize: 7.5, isBold: true, color: "#1e293b", align: "center" });
  }

  // Bottom Confidential lines
  const descWarning = "ማስገንዘቢያ፦ ይህ በደራሽ ዘመናዊ መጋዘን መቆጣጠሪያና የሂሳብ አያያዝ ስርዓት የተዘጋጀ ነው።";
  drawTextWithCanvas(doc, descWarning, startX, pageHeight - 12, { fontSize: 7.5, color: "#475569" });
  
  const creditLine = "© 2026 Derash Inventory Management. All rights reserved.";
  drawTextWithCanvas(doc, creditLine, startX, pageHeight - 8, { fontSize: 7.5, color: "#94a3b8" });

  // Append images gallery
  const galleryItems = products.map((p) => ({
    name: p.product_name,
    productImg: loadedImages[p.id],
    receiptImg: loadedReceipts[p.id],
    details: lang === "am"
      ? `ዋጋ፦ ETB ${Math.round(p.total_price / p.quantity).toLocaleString()} | ቀን፦ ${p.purchase_date}`
      : `Price: ETB ${Math.round(p.total_price / p.quantity).toLocaleString()} | Date: ${p.purchase_date}`
  }));
  appendImagesGallery(doc, lang, galleryItems);

  // Add dynamic page numbers to all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageNumText = lang === "am" ? `ገጽ ${i} ከ ${totalPages}` : `Page ${i} of ${totalPages}`;
    drawTextWithCanvas(doc, pageNumText, pageWidth - 15, pageHeight - 8, { fontSize: 7.5, color: "#64748b", align: "right" });
  }

  // Download PDF
  doc.save(`derash-inventory-${grToday}.pdf`);
}

export async function generateConsolidatedPDF(
  products: Product[],
  sales: Sale[],
  activeFilters: { searchTerm: string; paymentMethod: string; stockStatus: string },
  lang: string,
  generatorName: string = "Manager"
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page Dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Color theme definition
  const colorGreen600 = [0, 155, 58];    // Ethiopian Green (#009b3a)
  const colorSlate900 = [15, 23, 42];    // Dark Slate
  const colorLine = [228, 228, 231];     // Divider lines

  // Pre-load all available product and receipt images asynchronously to avoid any UI loop block
  const loadedImages: Record<string, string | null> = {};
  const loadedReceipts: Record<string, string | null> = {};
  for (const p of products) {
    if (p.product_image) {
      try {
        loadedImages[p.id] = await getBase64Image(p.product_image);
      } catch (e) {
        loadedImages[p.id] = null;
      }
    } else {
      loadedImages[p.id] = null;
    }

    if (p.receipt_image) {
      try {
        loadedReceipts[p.id] = await getBase64Image(p.receipt_image);
      } catch (e) {
        loadedReceipts[p.id] = null;
      }
    } else {
      loadedReceipts[p.id] = null;
    }
  }

  // 1. Lefthand Flag Decor line (Ethiopian National color accent)
  doc.setFillColor(colorGreen600[0], colorGreen600[1], colorGreen600[2]);
  doc.rect(0, 0, 5, pageHeight, "F");

  // 2. Header (White background with clean fonts)
  const grToday = getLocalGregorianDate();
  const etToday = toEthiopian(grToday);

  // Left Title
  drawTextWithCanvas(doc, "ደራሽ | DERASH", 15, 14, { fontSize: 20, isBold: true, color: "#009b3a" });
  
  // Right Title
  const reportHeaderRight = lang === "am" ? "የፋይናንስ ትንታኔ ሪፖርቶች" : "Financial Reports";
  drawTextWithCanvas(
    doc, 
    reportHeaderRight, 
    pageWidth - 15, 14, 
    { fontSize: 11, isBold: true, color: "#1e293b", align: "right" }
  );

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.35);
  doc.line(15, 17.5, pageWidth - 15, 17.5);

  // Metadata labels
  const auditorLabel = lang === "am" ? `ማጣሪያ ባለሙያ: ${generatorName.toUpperCase()}` : `Audated By: ${generatorName.toUpperCase()}`;
  drawTextWithCanvas(doc, auditorLabel, 15, 22, { fontSize: 8.5, color: "#475569" });
  
  const etDateStr = formatEthiopianDate(etToday, lang as any);
  const issuedOnLabel = lang === "am" 
    ? `የተወሰደበት ቀን: ${grToday} (${etDateStr})` 
    : `Issued On: ${grToday} (${etDateStr})`;
  drawTextWithCanvas(
    doc, 
    issuedOnLabel, 
    pageWidth - 15, 22, 
    { fontSize: 8.5, color: "#475569", align: "right" }
  );

  // Bold separating line below header
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(15, 26, pageWidth - 15, 26);

  // Filter sales based on active filters and matching products
  const filteredSales = sales.filter((s) => {
    if (activeFilters.searchTerm && activeFilters.searchTerm.trim() !== "") {
      const q = activeFilters.searchTerm.toLowerCase().trim();
      if (!s.product_name.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (activeFilters.paymentMethod && activeFilters.paymentMethod !== "All") {
      if (s.payment_method !== activeFilters.paymentMethod) {
        return false;
      }
    }
    const matchesProduct = products.some((p) => p.id === s.product_id);
    if (!matchesProduct) {
      return false;
    }
    return true;
  });

  // 3. Dynamic Statistics Box summary (4 KPI Cards)
  let totalQtySum = 0;
  let totalPriceSum = 0;
  let totalSoldQtySum = 0;
  let totalSoldWorthSum = 0;
  let totalUnsoldQtySum = 0;
  let totalUnsoldWorthSum = 0;

  products.forEach(p => {
    totalQtySum += p.quantity;
    totalPriceSum += (p.total_price || 0);

    const sq = p.sold_quantity ?? 0;
    const unitPrice = p.quantity > 0 ? (p.total_price / p.quantity) : 0;
    const rem = p.quantity - sq;
    totalUnsoldQtySum += rem;
    totalUnsoldWorthSum += rem * unitPrice;
  });

  filteredSales.forEach(s => {
    totalSoldQtySum += s.quantity;
    totalSoldWorthSum += (s.total_price || 0);
  });

  const sellThroughRate = totalQtySum > 0 ? Math.round((totalSoldQtySum / totalQtySum) * 1000) / 10 : 0;

  const kpiTop = 31;
  const kpiCardWidth = 43.5;

  // KPI 1: Total Inventory Worth (Light Blue)
  doc.setFillColor(239, 246, 255);
  doc.rect(15, kpiTop, kpiCardWidth, 18, "F");
  doc.setFillColor(59, 130, 246);
  doc.rect(15, kpiTop, 1.5, 18, "F");
  drawTextWithCanvas(doc, lang === "am" ? "ጠቅላላ የክምችት ዋጋ" : "Total Inventory Worth", 18, kpiTop + 4.5, { fontSize: 7, isBold: true, color: "#1e40af" });
  drawTextWithCanvas(doc, `ETB ${Math.round(totalPriceSum).toLocaleString()}`, 18, kpiTop + 12.5, { fontSize: 9.5, isBold: true, color: "#1e3a8a" });

  // KPI 2: Total Sold Value (Light Green)
  doc.setFillColor(240, 253, 244);
  doc.rect(15 + 43.5 + 2, kpiTop, kpiCardWidth, 18, "F");
  doc.setFillColor(34, 197, 94);
  doc.rect(15 + 43.5 + 2, kpiTop, 1.5, 18, "F");
  drawTextWithCanvas(doc, lang === "am" ? "ጠቅላላ የተሸጡ ዕቃዎች ዋጋ" : "Total Sold Value", 15 + 43.5 + 2 + 3, kpiTop + 4.5, { fontSize: 7, isBold: true, color: "#166534" });
  drawTextWithCanvas(doc, `ETB ${Math.round(totalSoldWorthSum).toLocaleString()}`, 15 + 43.5 + 2 + 3, kpiTop + 12.5, { fontSize: 9.5, isBold: true, color: "#14532d" });

  // KPI 3: Unsold Value Asset (Light Orange)
  doc.setFillColor(255, 247, 237);
  doc.rect(15 + 43.5 * 2 + 4, kpiTop, kpiCardWidth, 18, "F");
  doc.setFillColor(249, 115, 22);
  doc.rect(15 + 43.5 * 2 + 4, kpiTop, 1.5, 18, "F");
  drawTextWithCanvas(doc, lang === "am" ? "ያልተሸጡ ቀሪዎች ዋጋ" : "Unsold Value Asset", 15 + 43.5 * 2 + 4 + 3, kpiTop + 4.5, { fontSize: 7, isBold: true, color: "#9a3412" });
  drawTextWithCanvas(doc, `ETB ${Math.round(totalUnsoldWorthSum).toLocaleString()}`, 15 + 43.5 * 2 + 4 + 3, kpiTop + 12.5, { fontSize: 9.5, isBold: true, color: "#7c2d12" });

  // KPI 4: Sales Velocity / Rate (Light Purple)
  doc.setFillColor(250, 245, 255);
  doc.rect(15 + 43.5 * 3 + 6, kpiTop, kpiCardWidth, 18, "F");
  doc.setFillColor(168, 85, 247);
  doc.rect(15 + 43.5 * 3 + 6, kpiTop, 1.5, 18, "F");
  drawTextWithCanvas(doc, lang === "am" ? "የሽያጭ ፍጥነት" : "Sales Velocity", 15 + 43.5 * 3 + 6 + 3, kpiTop + 4.5, { fontSize: 7, isBold: true, color: "#6b21a8" });
  drawTextWithCanvas(doc, `${sellThroughRate}%`, 15 + 43.5 * 3 + 6 + 3, kpiTop + 12.5, { fontSize: 9.5, isBold: true, color: "#581c87" });

  // 4. Main Section Title
  const sectionTitle = lang === "am" ? "የዕቃዎች ዝርዝር መግለጫ" : "Itemized Ledger Details";
  drawTextWithCanvas(doc, sectionTitle, 15, 56, { fontSize: 10, isBold: true, color: "#1e293b" });

  // Subtitle line separators
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, 59, pageWidth - 15, 59);

  // 5. Table parameters
  const tableTop = 62;
  const startX = 15;

  // Header background block (Dark green)
  doc.setFillColor(22, 101, 52);
  doc.rect(startX, tableTop, 180, 8.5, "F");

  // Render Column Headers (7 Columns)
  drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ፎቶ" : "Photo", startX + 2, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff" });
  drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ስም" : "Item Name", startX + 15, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff" });
  drawTextWithCanvas(doc, lang === "am" ? "የገቡበት ቀን" : "Date", startX + 70, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "center" });
  drawTextWithCanvas(doc, lang === "am" ? "የገባው መጠን" : "Inflow Qty", startX + 97.5, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "center" });
  drawTextWithCanvas(doc, lang === "am" ? "ጠቅላላ ዋጋ" : "Inflow Value", startX + 135, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "right" });
  drawTextWithCanvas(doc, lang === "am" ? "የተሸጠው መጠን" : "Sold Qty", startX + 145, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "center" });
  drawTextWithCanvas(doc, lang === "am" ? "የሽያጭ ገቢ" : "Realized Revenue", startX + 180, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "right" });

  // Render Product Transaction rows
  let currentY = tableTop + 8.5;
  const rowHeight = 16.5;

  products.forEach((p, index) => {
    // Multi-page checking
    if (currentY + rowHeight > pageHeight - 32) {
      doc.addPage();
      
      // Page background decor
      doc.setFillColor(colorGreen600[0], colorGreen600[1], colorGreen600[2]);
      doc.rect(0, 0, 5, pageHeight, "F");
      
      currentY = 20;
      
      // Re-render table header on new page
      doc.setFillColor(22, 101, 52);
      doc.rect(startX, currentY, 180, 8.5, "F");

      drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ፎቶ" : "Photo", startX + 2, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff" });
      drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ስም" : "Item Name", startX + 15, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff" });
      drawTextWithCanvas(doc, lang === "am" ? "የገቡበት ቀን" : "Date", startX + 70, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "center" });
      drawTextWithCanvas(doc, lang === "am" ? "የገባው መጠን" : "Inflow Qty", startX + 97.5, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "center" });
      drawTextWithCanvas(doc, lang === "am" ? "ጠቅላላ ዋጋ" : "Inflow Value", startX + 135, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "right" });
      drawTextWithCanvas(doc, lang === "am" ? "የተሸጠው መጠን" : "Sold Qty", startX + 145, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "center" });
      drawTextWithCanvas(doc, lang === "am" ? "የሽያጭ ገቢ" : "Realized Revenue", startX + 180, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "right" });
      
      currentY += 8.5;
    }

    // Row zebra alternating layout
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(startX, currentY, 180, rowHeight, "F");

    // Divider line below row
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.35);
    doc.line(startX, currentY + rowHeight, startX + 180, currentY + rowHeight);

    // Image coordinates definitions
    const imgX = startX + 0.5;
    const imgY = currentY + 2.25;
    const imgSize = 11;

    const base64Img = loadedImages[p.id];
    if (base64Img) {
      try {
        doc.addImage(base64Img, getFormat(base64Img), imgX, imgY, imgSize, imgSize);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.25);
        doc.rect(imgX, imgY, imgSize, imgSize);
      } catch (e) {
        doc.setFillColor(240, 248, 241);
        doc.rect(imgX, imgY, imgSize, imgSize, "F");
        doc.setDrawColor(0, 155, 58);
        doc.setLineWidth(0.25);
        doc.rect(imgX, imgY, imgSize, imgSize);
        const initials = p.product_name.substring(0, 2);
        drawTextWithCanvas(doc, initials, imgX + 5.5, imgY + 6, { fontSize: 7, isBold: true, color: "#009b3a", align: "center" });
      }
    } else {
      doc.setFillColor(240, 248, 241);
      doc.rect(imgX, imgY, imgSize, imgSize, "F");
      doc.setDrawColor(0, 155, 58);
      doc.setLineWidth(0.25);
      doc.rect(imgX, imgY, imgSize, imgSize);
      const initials = p.product_name.substring(0, 2);
      drawTextWithCanvas(doc, initials, imgX + 5.5, imgY + 6, { fontSize: 7, isBold: true, color: "#009b3a", align: "center" });
    }

    const textY = currentY + 8.25;

    // Column 2: Product Name next to image
    drawTextWithCanvas(doc, p.product_name, startX + 15, textY, { fontSize: 8, isBold: true, color: "#1e293b" });

    // Column 3: Entry Date
    drawTextWithCanvas(doc, formatEthiopianDate(toEthiopian(p.purchase_date), lang as any), startX + 70, textY, { fontSize: 7.5, color: "#475569", align: "center" });

    // Mathematical calculations
    const unitPrice = p.quantity > 0 ? (p.total_price / p.quantity) : 0;
    const soldQty = p.sold_quantity ?? 0;
    const soldRevenue = soldQty * unitPrice;

    // Column 4: የገባው መጠን
    const intakeText = lang === "am" ? `${p.quantity} ፍሬ` : `${p.quantity} Pcs`;
    drawTextWithCanvas(doc, intakeText, startX + 97.5, textY, { fontSize: 7.5, color: "#1f2937", align: "center" });

    // Column 5: ጠቅላላ ዋጋ
    drawTextWithCanvas(doc, `ETB ${(p.total_price || 0).toLocaleString()}`, startX + 135, textY, { fontSize: 7.5, color: "#1f2937", align: "right", isBold: true });

    // Column 6: የተሸጠው መጠን
    const soldText = lang === "am" ? `${soldQty} ፍሬ` : `${soldQty} Sold`;
    drawTextWithCanvas(doc, soldText, startX + 145, textY, { fontSize: 7.5, color: soldQty === 0 ? "#9ca3af" : "#1f2937", align: "center" });

    // Column 7: የሽያጭ ገቢ
    drawTextWithCanvas(doc, `ETB ${Math.round(soldRevenue).toLocaleString()}`, startX + 180, textY, { fontSize: 8, isBold: true, color: "#1e293b", align: "right" });

    currentY += rowHeight;
  });

  // Daily, weekly, monthly and payment breakdown calculations
  let dailySoldVal = 0;
  let dailySoldQty = 0;
  let weeklySoldVal = 0;
  let weeklySoldQty = 0;
  let monthlySoldVal = 0;
  let monthlySoldQty = 0;

  let cbeWorth = 0;
  let cbeQty = 0;
  let teleWorth = 0;
  let teleQty = 0;
  let cashWorth = 0;
  let cashQty = 0;

  // 1. Find Ethiopian Date today
  const now = new Date();

  // 2. Determine start of current week (Monday to Sunday)
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  filteredSales.forEach((s) => {
    // Payment Method Breakdown
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

    // Temporal metrics
    let sEt;
    try {
      sEt = toEthiopian(s.sale_date);
    } catch {
      return;
    }

    // Today filter: exact Ethiopian year, month, day match
    if (sEt.year === etToday.year && sEt.month === etToday.month && sEt.day === etToday.day) {
      dailySoldQty += s.quantity;
      dailySoldVal += (s.total_price || 0);
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
          weeklySoldQty += s.quantity;
          weeklySoldVal += (s.total_price || 0);
        }
      }
    } catch (e) {
      // Safe failover
    }

    // Month filter: exact Ethiopian Year and Month match
    if (sEt.year === etToday.year && sEt.month === etToday.month) {
      monthlySoldQty += s.quantity;
      monthlySoldVal += (s.total_price || 0);
    }
  });

  const paymentBreakdown = {
    cbe: Math.round(cbeWorth),
    telebirr: Math.round(teleWorth),
    cash: Math.round(cashWorth),
    cbeQty,
    telebirrQty: teleQty,
    cashQty,
  };

  // 6. Stacked Summary Section (Vertically Stacked Tables)
  currentY += 8;
  
  // Page break check for Table 1 (needs at least ~50mm)
  if (currentY + 50 > pageHeight - 20) {
    doc.addPage();
    doc.setFillColor(colorGreen600[0], colorGreen600[1], colorGreen600[2]);
    doc.rect(0, 0, 5, pageHeight, "F");
    currentY = 20;
  }

  // Draw Table 1 Title
  const table1Title = lang === "am" 
    ? "1. የተሸጡ ዕቃዎች በክፍያ መንገድ ድምር (Payment Analytics)" 
    : "1. Payment breakdown sum (Payment Analytics)";
  drawTextWithCanvas(doc, table1Title, startX, currentY + 4, { fontSize: 8.5, isBold: true, color: "#0f172a" });

  currentY += 6;

  // Table 1 Header Background (Dark Slate)
  doc.setFillColor(15, 23, 42);
  doc.rect(startX, currentY, 180, 7.5, "F");

  // Table 1 Headers Text
  drawTextWithCanvas(doc, lang === "am" ? "የክፍያ መንገድ (Payment Method)" : "Payment Method", startX + 2, currentY + 4.75, { fontSize: 7.5, isBold: true, color: "#ffffff" });
  drawTextWithCanvas(doc, lang === "am" ? "ጠቅላላ የተሸጠበት ብዛት (Total Quantity)" : "Total Quantity", startX + 90, currentY + 4.75, { fontSize: 7.5, isBold: true, color: "#ffffff", align: "center" });
  drawTextWithCanvas(doc, lang === "am" ? "አጠቃላይ የተሰበሰበ ገቢ (Total Revenue)" : "Total Revenue", startX + 178, currentY + 4.75, { fontSize: 7.5, isBold: true, color: "#ffffff", align: "right" });

  currentY += 7.5;

  const t1RowHeight = 10;
  const t1Rows = [
    { method: "CBE BIRR", qty: paymentBreakdown.cbeQty, revenue: paymentBreakdown.cbe },
    { method: "TELEBIRR", qty: paymentBreakdown.telebirrQty, revenue: paymentBreakdown.telebirr },
    { method: "በእጅ (Cash)", qty: paymentBreakdown.cashQty, revenue: paymentBreakdown.cash },
  ];

  t1Rows.forEach((row, idx) => {
    const rowY = currentY + idx * t1RowHeight;
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(startX, rowY, 180, t1RowHeight, "F");
    }
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.3);
    doc.line(startX, rowY + t1RowHeight, startX + 180, rowY + t1RowHeight);

    drawTextWithCanvas(doc, row.method, startX + 2, rowY + 5.5, { fontSize: 8, isBold: true, color: "#1e293b" });
    const qtyText = lang === "am" ? `${row.qty} ፍሬ` : `${row.qty} Pcs`;
    drawTextWithCanvas(doc, qtyText, startX + 90, rowY + 5.5, { fontSize: 8, color: "#334155", align: "center" });
    drawTextWithCanvas(doc, `ETB ${row.revenue.toLocaleString()}`, startX + 178, rowY + 5.5, { fontSize: 8, isBold: true, color: "#0f172a", align: "right" });
  });

  currentY += 3 * t1RowHeight;

  // Gap and check for Table 2
  currentY += 8;
  if (currentY + 65 > pageHeight - 20) {
    doc.addPage();
    doc.setFillColor(colorGreen600[0], colorGreen600[1], colorGreen600[2]);
    doc.rect(0, 0, 5, pageHeight, "F");
    currentY = 20;
  }

  // Draw Table 2 Title
  const table2Title = lang === "am" 
    ? "2. የፋይናንስ እና የሽያጭ አፈፃፀም (Performance Matrix)" 
    : "2. Financial & Sales Performance (Performance Matrix)";
  drawTextWithCanvas(doc, table2Title, startX, currentY + 4, { fontSize: 8.5, isBold: true, color: "#0f172a" });

  currentY += 6;

  // Table 2 Header Background (Dark Slate)
  doc.setFillColor(15, 23, 42);
  doc.rect(startX, currentY, 180, 7.5, "F");

  // Table 2 Headers Text
  drawTextWithCanvas(doc, lang === "am" ? "ሪፖርት / ዝርዝር መግለጫ (Metric Description)" : "Metric Description", startX + 2, currentY + 4.75, { fontSize: 7.5, isBold: true, color: "#ffffff" });
  drawTextWithCanvas(doc, lang === "am" ? "ብዛት (Quantity)" : "Quantity", startX + 140, currentY + 4.75, { fontSize: 7.5, isBold: true, color: "#ffffff", align: "center" });
  drawTextWithCanvas(doc, lang === "am" ? "ጠቅላላ ዋጋ (Total Value)" : "Total Value", startX + 178, currentY + 4.75, { fontSize: 7.5, isBold: true, color: "#ffffff", align: "right" });

  currentY += 7.5;

  const t2RowHeight = 11;
  const t2Rows = [
    {
      metric: lang === "am" ? "የቀሪ ዕቃዎች እሴት" : "Remaining Stock Value",
      desc: lang === "am" ? "(*አዲስ ከተመዘገቡት አጠቃላይ ዕቃዎች መካከል የቀረው ሀብት*)" : "Remaining asset worth in inventory",
      qty: totalUnsoldQtySum,
      val: totalUnsoldWorthSum,
    },
    {
      metric: lang === "am" ? "የዕለቱ የሽያጭ ዋጋ" : "Daily Sales Value",
      desc: lang === "am" ? "በዛሬው ዕለት ብቻ የተሸጡ ዕቃዎች እና የተገኘ ገቢ" : "Items sold and revenue realized today",
      qty: dailySoldQty,
      val: dailySoldVal,
    },
    {
      metric: lang === "am" ? "የሳምንቱ የሽያጭ ዋጋ" : "Weekly Sales Value",
      desc: lang === "am" ? "(*በአንድ ሳምንት ውስጥ የተሸጡ ዕቃዎች አጠቃላይ ድምር*)" : "Total items sold and revenue this week",
      qty: weeklySoldQty,
      val: weeklySoldVal,
    },
    {
      metric: lang === "am" ? "የወሩ የሽያጭ ዋጋ" : "Monthly Sales Value",
      desc: lang === "am" ? "(*በአንድ ወር ውስጥ የተሸጡ ዕቃዎች አጠቃላይ የሽያጭ መጠን*)" : "Total items sold and revenue this month",
      qty: monthlySoldQty,
      val: monthlySoldVal,
    },
  ];

  t2Rows.forEach((row, idx) => {
    const rowY = currentY + idx * t2RowHeight;
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(startX, rowY, 180, t2RowHeight, "F");
    }
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.3);
    doc.line(startX, rowY + t2RowHeight, startX + 180, rowY + t2RowHeight);

    drawTextWithCanvas(doc, row.metric, startX + 2, rowY + 3.5, { fontSize: 7.5, isBold: true, color: "#1e293b" });
    drawTextWithCanvas(doc, row.desc, startX + 2, rowY + 7.5, { fontSize: 6.5, color: "#64748b" });

    const qtyText = lang === "am" ? `${row.qty} ፍሬ` : `${row.qty} Pcs`;
    drawTextWithCanvas(doc, qtyText, startX + 140, rowY + 5.5, { fontSize: 7.5, color: "#334155", align: "center" });
    drawTextWithCanvas(doc, `ETB ${Math.round(row.val).toLocaleString()}`, startX + 178, rowY + 5.5, { fontSize: 7.5, isBold: true, color: "#0f172a", align: "right" });
  });

  currentY += 4 * t2RowHeight;

  // 7. Signatures / Stamps sections
  currentY += 25;
  if (currentY + 20 < pageHeight) {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.35);
    doc.line(startX + 10, currentY, startX + 60, currentY);
    doc.line(pageWidth - 70, currentY, pageWidth - 20, currentY);

    drawTextWithCanvas(doc, "የሂሳብ ባለሙያ ፊርማ / (Accountant Signature)", startX + 35, currentY + 4, { fontSize: 7.5, isBold: true, color: "#1e293b", align: "center" });
    drawTextWithCanvas(doc, "የሽያጭ ባለሙያ ፊርማ / (Sales Specialist Signature)", pageWidth - 45, currentY + 4, { fontSize: 7.5, isBold: true, color: "#1e293b", align: "center" });
  }

  // Bottom Confidential lines
  const descWarning = "ማስገንዘቢያ፦ ይህ በደራሽ ዘመናዊ መጋዘን መቆጣጠሪያና የሂሳብ አያያዝ ስርዓት የተዘጋጀ ነው።";
  drawTextWithCanvas(doc, descWarning, startX, pageHeight - 12, { fontSize: 7.5, color: "#475569" });
  
  const creditLine = "© 2026 Derash Inventory Management. All rights reserved.";
  drawTextWithCanvas(doc, creditLine, startX, pageHeight - 8, { fontSize: 7.5, color: "#94a3b8" });

  // Append images gallery
  const galleryItems = products.map((p) => ({
    name: p.product_name,
    productImg: loadedImages[p.id],
    receiptImg: loadedReceipts[p.id],
    details: lang === "am"
      ? `ዋጋ፦ ETB ${Math.round(p.total_price / p.quantity).toLocaleString()} | ቀን፦ ${p.purchase_date}`
      : `Price: ETB ${Math.round(p.total_price / p.quantity).toLocaleString()} | Date: ${p.purchase_date}`
  }));
  appendImagesGallery(doc, lang, galleryItems);

  // Add dynamic page numbers to all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageNumText = lang === "am" ? `ገጽ ${i} ከ ${totalPages}` : `Page ${i} of ${totalPages}`;
    drawTextWithCanvas(doc, pageNumText, pageWidth - 15, pageHeight - 8, { fontSize: 7.5, color: "#64748b", align: "right" });
  }

  // Download PDF
  doc.save(`derash-consolidated-ledger-${grToday}.pdf`);
}

export async function generateUnsoldAssetsPDF(
  products: Product[],
  lang: string,
  generatorName: string = "Storekeeper"
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // UNIQUE COLOR THEME: Deep Indigo and Dark Slate
  const colorThemePrimary = [30, 41, 59];    // Deep Slate (#1e293b)
  const colorIndigoAccent = [67, 56, 102];   // Indigo-700
  const colorDivider = [235, 238, 241];       // Soft white/gray lines

  const unsoldProducts = products.filter((p) => p.quantity - (p.sold_quantity ?? 0) > 0);

  // Pre-load all available product and receipt images asynchronously
  const loadedImages: Record<string, string | null> = {};
  const loadedReceipts: Record<string, string | null> = {};
  for (const p of unsoldProducts) {
    if (p.product_image) {
      try {
        loadedImages[p.id] = await getBase64Image(p.product_image);
      } catch (e) {
        loadedImages[p.id] = null;
      }
    } else {
      loadedImages[p.id] = null;
    }

    if (p.receipt_image) {
      try {
        loadedReceipts[p.id] = await getBase64Image(p.receipt_image);
      } catch (e) {
        loadedReceipts[p.id] = null;
      }
    } else {
      loadedReceipts[p.id] = null;
    }
  }

  // LHS Decoration line: Indigo accent
  doc.setFillColor(colorIndigoAccent[0], colorIndigoAccent[1], colorIndigoAccent[2]);
  doc.rect(0, 0, 5, pageHeight, "F");

  // Executive Header block: Slate
  doc.setFillColor(colorThemePrimary[0], colorThemePrimary[1], colorThemePrimary[2]);
  doc.rect(5, 0, pageWidth - 5, 45, "F");

  // Title Brand
  drawTextWithCanvas(doc, "ደራሽ | UNSOLD ASSETS", 15, 12, { fontSize: 20, isBold: true, color: "#ffffff" });
  
  const subtitleLabel = lang === "am"
    ? "ያልተሸጡ ቀሪ ዕቃዎች እና የመጋዘን ሀብት መቆጣጠሪያ መዝገብ"
    : "Stock Valuation Ledger & Unsold Assets Registry";
  drawTextWithCanvas(doc, subtitleLabel, 15, 21, { fontSize: 8.5, isBold: false, color: "#818cf8" });

  // Line separating Brand & Details
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.4);
  doc.line(15, 26, pageWidth - 15, 26);

  // Metadata labels
  const grToday = getLocalGregorianDate();
  const etToday = toEthiopian(grToday);
  
  const auditorLabel = lang === "am" ? `ዘጋጅ ጠባቂ፦ ${generatorName.toUpperCase()}` : `Store Keeper: ${generatorName.toUpperCase()}`;
  drawTextWithCanvas(doc, auditorLabel, 15, 32, { fontSize: 8, color: "#cbd5e1" });
  
  const issuedOnLabel = lang === "am" 
    ? `የተወሰደበት ቀን፦ ${grToday} (${formatEthiopianDate(etToday, "am")})` 
    : `Date Executed: ${grToday} (${formatEthiopianDate(etToday, "en")})`;
  drawTextWithCanvas(doc, issuedOnLabel, 15, 38, { fontSize: 8, color: "#cbd5e1" });

  // Right-aligned header labels
  const rightLabelHead = lang === "am" ? "ያልተሸጡ ቀሪ ዕቃዎች" : "Unsold Remaining Assets";
  drawTextWithCanvas(doc, rightLabelHead, pageWidth - 15, 12, { fontSize: 13, isBold: true, color: "#ffffff", align: "right" });
  
  const countLabel = lang === "am" 
    ? `ድምር፦ ${unsoldProducts.length} ቀሪ እቃዎች ወጥተዋል` 
    : `Total remaining SKU counts: ${unsoldProducts.length}`;
  drawTextWithCanvas(doc, countLabel, pageWidth - 15, 20, { fontSize: 8, isBold: false, color: "#fbbf24", align: "right" });

  // Metrics logic
  let totalUnsoldQty = 0;
  let totalUnsoldWorth = 0;
  let lowStockAlertCount = 0;

  unsoldProducts.forEach((p) => {
    const rem = p.quantity - (p.sold_quantity ?? 0);
    const unitPrice = p.quantity > 0 ? p.total_price / p.quantity : 0;
    totalUnsoldQty += rem;
    totalUnsoldWorth += rem * unitPrice;
    if (rem <= 3) {
      lowStockAlertCount += 1;
    }
  });

  const kpiTop = 52;
  const kpiCardWidth = (pageWidth - 30) / 3;

  // KPI 1: Remaining Units
  doc.setFillColor(241, 245, 249);
  doc.rect(15, kpiTop, kpiCardWidth - 2, 18, "F");
  doc.setFillColor(colorIndigoAccent[0], colorIndigoAccent[1], colorIndigoAccent[2]);
  doc.rect(15, kpiTop, 1.5, 18, "F");
  drawTextWithCanvas(doc, lang === "am" ? "የቀሩ ዕቃዎች ጠቅላላ ብዛት" : "Remaining Asset Stock", 18, kpiTop + 4.5, { fontSize: 7, isBold: true, color: "#475569" });
  drawTextWithCanvas(doc, `${totalUnsoldQty} units`, 18, kpiTop + 12.5, { fontSize: 10, isBold: true, color: "#1e293b" });

  // KPI 2: Total Book Valuation
  doc.setFillColor(241, 245, 249);
  doc.rect(15 + kpiCardWidth, kpiTop, kpiCardWidth - 2, 18, "F");
  doc.setFillColor(16, 185, 129); // Emerald indicator for positive assets
  doc.rect(15 + kpiCardWidth, kpiTop, 1.5, 18, "F");
  drawTextWithCanvas(doc, lang === "am" ? "የቀሪ እቃዎች ጠቅላላ እሴት (ካፒታል)" : "Asset Net Book Value", 15 + kpiCardWidth + 3.5, kpiTop + 4.5, { fontSize: 7, isBold: true, color: "#065f46" });
  drawTextWithCanvas(doc, `ETB ${Math.round(totalUnsoldWorth).toLocaleString()}`, 15 + kpiCardWidth + 3.5, kpiTop + 12.5, { fontSize: 10, isBold: true, color: "#1e293b" });

  // KPI 3: Critical warning
  doc.setFillColor(241, 245, 249);
  doc.rect(15 + kpiCardWidth * 2, kpiTop, kpiCardWidth, 18, "F");
  doc.setFillColor(225, 29, 72); // Rose-600
  doc.rect(15 + kpiCardWidth * 2, kpiTop, 1.5, 18, "F");
  drawTextWithCanvas(doc, lang === "am" ? "አደጋ ላይ ያሉ (ሊያልቁ የቀረቡ)" : "Critical Low Stock Alerts", 15 + kpiCardWidth * 2 + 3.5, kpiTop + 4.5, { fontSize: 7, isBold: true, color: "#9f1239" });
  drawTextWithCanvas(doc, `${lowStockAlertCount} SKUs (<3)`, 15 + kpiCardWidth * 2 + 3.5, kpiTop + 12.5, { fontSize: 10, isBold: true, color: "#9f1239" });

  // Main Section Title
  const sectionTitle = lang === "am" ? "ዝርዝር የመጋዘን ቀሪ ሃብት ዝርዝር መዝገብ" : "Unsold Remaining Inventory & Asset Valuation Details";
  drawTextWithCanvas(doc, sectionTitle, 15, 80, { fontSize: 10, isBold: true, color: "#1e293b" });

  // Subtitle line separator
  doc.setDrawColor(colorDivider[0], colorDivider[1], colorDivider[2]);
  doc.setLineWidth(0.4);
  doc.line(15, 83, pageWidth - 15, 83);

  // Table setup
  const tableTop = 87;
  const startX = 15;

  doc.setFillColor(colorThemePrimary[0], colorThemePrimary[1], colorThemePrimary[2]);
  doc.rect(startX, tableTop, 180, 8.5, "F");

  // Table Headers
  drawTextWithCanvas(doc, lang === "am" ? "የቀሪ ዕቃ ስምና ምዝገባ ቀን" : "Product details & Entry", startX + 2, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff" });
  drawTextWithCanvas(doc, lang === "am" ? "የገባ ጠቅላላ" : "Inflow total", startX + 65 + 15, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "center" });
  drawTextWithCanvas(doc, lang === "am" ? "የአንዱ ዋጋ" : "Unit cost", startX + 130, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "right" });
  drawTextWithCanvas(doc, lang === "am" ? "የቀረው ክምችት" : "Remaining Stock", startX + 65 + 40 + 40 + 10, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "center" });
  drawTextWithCanvas(doc, lang === "am" ? "የቀሪው እሴት" : "Book Value", startX + 180 - 2, tableTop + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "right" });

  let currentY = tableTop + 8.5;
  const rowHeight = 16.5; 

  unsoldProducts.forEach((p, index) => {
    // Multi-page layout protection
    if (currentY + rowHeight > pageHeight - 24) {
      doc.addPage();
      
      // Page background decor
      doc.setFillColor(colorIndigoAccent[0], colorIndigoAccent[1], colorIndigoAccent[2]);
      doc.rect(0, 0, 5, pageHeight, "F");
      
      currentY = 20;
      
      // Header background block
      doc.setFillColor(colorThemePrimary[0], colorThemePrimary[1], colorThemePrimary[2]);
      doc.rect(startX, currentY, 180, 8.5, "F");

      drawTextWithCanvas(doc, lang === "am" ? "የቀሪ ዕቃ ስምና ምዝገባ ቀን" : "Product details & Entry", startX + 2, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff" });
      drawTextWithCanvas(doc, lang === "am" ? "የገባ ጠቅላላ" : "Inflow total", startX + 65 + 15, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "center" });
      drawTextWithCanvas(doc, lang === "am" ? "የአንዱ ዋጋ" : "Unit cost", startX + 130, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "right" });
      drawTextWithCanvas(doc, lang === "am" ? "የቀረው ክምችት" : "Remaining Stock", startX + 65 + 40 + 40 + 10, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "center" });
      drawTextWithCanvas(doc, lang === "am" ? "የቀሪው እሴት" : "Book Value", startX + 180 - 2, currentY + 4.25, { fontSize: 8, isBold: true, color: "#ffffff", align: "right" });
      
      currentY += 8.5;
    }

    // Row alternating background stripes
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(startX, currentY, 180, rowHeight, "F");

    // Line separator
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.35);
    doc.line(startX, currentY + rowHeight, startX + 180, currentY + rowHeight);

    // Image positions
    const imgX = startX + 2;
    const imgY = currentY + 2.25;
    const imgSize = 12;

    const base64Img = loadedImages[p.id];
    if (base64Img) {
      try {
        doc.addImage(base64Img, getFormat(base64Img), imgX, imgY, imgSize, imgSize);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.25);
        doc.rect(imgX, imgY, imgSize, imgSize);
      } catch (e) {
        doc.setFillColor(240, 244, 253);
        doc.rect(imgX, imgY, imgSize, imgSize, "F");
        doc.setDrawColor(colorIndigoAccent[0], colorIndigoAccent[1], colorIndigoAccent[2]);
        doc.setLineWidth(0.25);
        doc.rect(imgX, imgY, imgSize, imgSize);
        const initials = p.product_name.substring(0, 2);
        drawTextWithCanvas(doc, initials, imgX + 6, imgY + 6.5, { fontSize: 7, isBold: true, color: "#4338ca", align: "center" });
      }
    } else {
      doc.setFillColor(240, 244, 253);
      doc.rect(imgX, imgY, imgSize, imgSize, "F");
      doc.setDrawColor(colorIndigoAccent[0], colorIndigoAccent[1], colorIndigoAccent[2]);
      doc.setLineWidth(0.25);
      doc.rect(imgX, imgY, imgSize, imgSize);
      const initials = p.product_name.substring(0, 2);
      drawTextWithCanvas(doc, initials, imgX + 6, imgY + 6.5, { fontSize: 7, isBold: true, color: "#4338ca", align: "center" });
    }

    const textY = currentY + 6.75;
    
    // Column 1: Product Name & Date
    drawTextWithCanvas(doc, p.product_name, startX + 16, textY, { fontSize: 8, isBold: true, color: "#1e293b" });
    
    const et = toEthiopian(p.purchase_date);
    const dateFormatted = formatEthiopianDate(et, lang as any);
    drawTextWithCanvas(doc, `🇪🇹 ${dateFormatted}`, startX + 16, currentY + 11.25, { fontSize: 7, color: "#64748b" });

    // Math
    const rem = p.quantity - (p.sold_quantity ?? 0);
    const unitPrice = p.quantity > 0 ? (p.total_price / p.quantity) : 0;
    const valueLeft = rem * unitPrice;

    // Column 2: Inflow total
    drawTextWithCanvas(doc, `${p.quantity} Pcs`, startX + 65 + 15, textY, { fontSize: 8, isBold: true, color: "#1f2937", align: "center" });

    // Column 3: Unit cost
    drawTextWithCanvas(doc, `ETB ${Math.round(unitPrice).toLocaleString()}`, startX + 130, textY, { fontSize: 8, color: "#1f2937", align: "right", isBold: true });

    // Column 4: Remaining stock
    drawTextWithCanvas(doc, `${rem} pcs left`, startX + 65 + 40 + 40 + 10, textY, { fontSize: 8, isBold: true, color: rem <= 3 ? "#e11d48" : "#1f2937", align: "center" });
    if (rem <= 3) {
      drawTextWithCanvas(doc, lang === "am" ? "ሊያልቅ የቀረበ" : "Low Stock", startX + 65 + 40 + 40 + 10, currentY + 11.25, { fontSize: 6, isBold: true, color: "#e11d48", align: "center" });
    } else {
      drawTextWithCanvas(doc, lang === "am" ? "በቂ ክምችት" : "Good Stock", startX + 65 + 40 + 40 + 10, currentY + 11.25, { fontSize: 6, isBold: true, color: "#0d9488", align: "center" });
    }

    // Column 5: Book value
    drawTextWithCanvas(doc, `ETB ${Math.round(valueLeft).toLocaleString()}`, startX + 180 - 2, textY, { fontSize: 8.5, isBold: true, color: "#1f2937", align: "right" });

    currentY += rowHeight;
  });

  // Summary Footer
  currentY += 6;
  if (currentY + 28 > pageHeight) {
    doc.addPage();
    doc.setFillColor(colorIndigoAccent[0], colorIndigoAccent[1], colorIndigoAccent[2]);
    doc.rect(0, 0, 5, pageHeight, "F");
    currentY = 20;
  }

  doc.setFillColor(colorThemePrimary[0], colorThemePrimary[1], colorThemePrimary[2]);
  doc.rect(startX, currentY, 180, 15, "F");
  
  doc.setFillColor(colorIndigoAccent[0], colorIndigoAccent[1], colorIndigoAccent[2]);
  doc.rect(startX, currentY, 2, 15, "F");

  const totalCaptionStr = lang === "am" ? "ያልተሸጡ ጠቅላላ ድምር ማጠቃለያ፦" : "Core Asset Totals Summaries:";
  drawTextWithCanvas(doc, totalCaptionStr, startX + 4, currentY + 7.5, { fontSize: 8, isBold: true, color: "#ffffff" });
  
  const statsQtyStr = lang === "am" ? `ቀሪ እቃዎች መጠን፦ ${totalUnsoldQty} units` : `Valuation size: ${totalUnsoldQty} total units in stock`;
  drawTextWithCanvas(doc, statsQtyStr, startX + 75, currentY + 7.5, { fontSize: 8.5, isBold: true, color: "#cbd5e1" });
  
  drawTextWithCanvas(doc, `Total Worth: ETB ${Math.round(totalUnsoldWorth).toLocaleString()}`, startX + 180 - 4, currentY + 7.5, { fontSize: 8.5, isBold: true, color: "#34d399", align: "right" });

  // Signatures
  currentY += 25;
  if (currentY + 20 < pageHeight) {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.35);
    doc.line(startX + 10, currentY, startX + 60, currentY);
    doc.line(pageWidth - 70, currentY, pageWidth - 20, currentY);

    drawTextWithCanvas(doc, "የሂሳብ ባለሙያ ፊርማ / (Accountant Signature)", startX + 35, currentY + 4, { fontSize: 7.5, isBold: true, color: "#1e293b", align: "center" });
    drawTextWithCanvas(doc, "የሽያጭ ባለሙያ ፊርማ / (Sales Specialist Signature)", pageWidth - 45, currentY + 4, { fontSize: 7.5, isBold: true, color: "#1e293b", align: "center" });
  }

  // Footer text
  const descWarning = "ማስገንዘቢያ፦ ይህ በደራሽ ዘመናዊ መጋዘን መቆጣጠሪያና የሂሳብ አያያዝ ስርዓት የተዘጋጀ ነው።";
  drawTextWithCanvas(doc, descWarning, startX, pageHeight - 12, { fontSize: 7.5, color: "#475569" });
  
  const creditLine = "© 2026 Derash Inventory Management. All rights reserved.";
  drawTextWithCanvas(doc, creditLine, startX, pageHeight - 8, { fontSize: 7.5, color: "#94a3b8" });

  // Append images gallery
  const galleryItems = unsoldProducts.map((p) => ({
    name: p.product_name,
    productImg: loadedImages[p.id],
    receiptImg: loadedReceipts[p.id],
    details: lang === "am"
      ? `ቀሪ ክምችት፦ ${p.quantity - p.sold_quantity} | ዋጋ፦ ETB ${Math.round(p.total_price / p.quantity).toLocaleString()}`
      : `Stock left: ${p.quantity - p.sold_quantity} | Price: ETB ${Math.round(p.total_price / p.quantity).toLocaleString()}`
  }));
  appendImagesGallery(doc, lang, galleryItems);

  // Add dynamic page numbers to all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageNumText = lang === "am" ? `ገጽ ${i} ከ ${totalPages}` : `Page ${i} of ${totalPages}`;
    drawTextWithCanvas(doc, pageNumText, pageWidth - 15, pageHeight - 8, { fontSize: 7.5, color: "#64748b", align: "right" });
  }

  doc.save(`derash-unsold-assets-${grToday}.pdf`);
}

export async function generateSoldUnitsPDF(
  sales: Sale[],
  products: Product[],
  lang: string,
  generatorName: string = "Cashier"
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // UNIQUE COLOR THEME: Warm Amber and Charcoal/Teal
  const colorThemePrimary = [24, 24, 27];    // Very deep gray/zinc (#18181b)
  const colorAmberAccent = [217, 119, 6];    // Amber-600 (#d97706)
  const colorDivider = [244, 244, 245];       // Soft dividing lines

  // Pre-load all available product and receipt images asynchronously
  const loadedImages: Record<string, string | null> = {};
  const loadedReceipts: Record<string, string | null> = {};
  for (const s of sales) {
    const product = products.find((p) => p.id === s.product_id);
    if (product?.product_image) {
      try {
        loadedImages[s.id] = await getBase64Image(product.product_image);
      } catch (e) {
        loadedImages[s.id] = null;
      }
    } else {
      loadedImages[s.id] = null;
    }

    const receiptToLoad = s.receipt_image || product?.receipt_image;
    if (receiptToLoad) {
      try {
        loadedReceipts[s.id] = await getBase64Image(receiptToLoad);
      } catch (e) {
        loadedReceipts[s.id] = null;
      }
    } else {
      loadedReceipts[s.id] = null;
    }
  }

  // LHS Decoration line: Amber accent
  doc.setFillColor(colorAmberAccent[0], colorAmberAccent[1], colorAmberAccent[2]);
  doc.rect(0, 0, 5, pageHeight, "F");

  // Executive Header block
  doc.setFillColor(colorThemePrimary[0], colorThemePrimary[1], colorThemePrimary[2]);
  doc.rect(5, 0, pageWidth - 5, 45, "F");

  // Title Brand
  drawTextWithCanvas(doc, "ደራሽ | SALES REGISTRY", 15, 12, { fontSize: 20, isBold: true, color: "#ffffff" });
  
  const subtitleLabel = lang === "am"
    ? "የተሸጡ ዕቃዎች ዝርዝር ሁኔታ እና የገቢ ምርመራ መግለጫ"
    : "Sold Merchandise Transaction Logs & Revenue Analysis Statement";
  drawTextWithCanvas(doc, subtitleLabel, 15, 21, { fontSize: 8.5, isBold: false, color: "#f59e0b" });

  // Line separating Brand & Details
  doc.setDrawColor(63, 63, 70);
  doc.setLineWidth(0.4);
  doc.line(15, 26, pageWidth - 15, 26);

  // Metadata labels
  const grToday = getLocalGregorianDate();
  const etToday = toEthiopian(grToday);
  
  const auditorLabel = lang === "am" ? `የክፍያ ሒሳብ ተቆጣጣሪ፦ ${generatorName.toUpperCase()}` : `Finance Officer: ${generatorName.toUpperCase()}`;
  drawTextWithCanvas(doc, auditorLabel, 15, 32, { fontSize: 8, color: "#cbd5e1" });
  
  const issuedOnLabel = lang === "am" 
    ? `የተሸጠበት ቀን፦ ${grToday} (${formatEthiopianDate(etToday, "am")})` 
    : `Run Date: ${grToday} (${formatEthiopianDate(etToday, "en")})`;
  drawTextWithCanvas(doc, issuedOnLabel, 15, 38, { fontSize: 8, color: "#cbd5e1" });

  // Right-aligned header labels
  const rightLabelHead = lang === "am" ? "የተሸጡ ዕቃዎች" : "Sold Goods Ledger";
  drawTextWithCanvas(doc, rightLabelHead, pageWidth - 15, 12, { fontSize: 13, isBold: true, color: "#ffffff", align: "right" });
  
  const countLabel = lang === "am" 
    ? `ድምር፦ ${sales.length} የሽያጭ መዛግብቶች አሉ` 
    : `Sales record sets: ${sales.length}`;
  drawTextWithCanvas(doc, countLabel, pageWidth - 15, 20, { fontSize: 8, isBold: false, color: "#34d399", align: "right" });

  // Metrics logic
  let totalSoldQty = 0;
  let totalRevenueEarned = 0;
  let cashPaymentQty = 0;

  sales.forEach((s) => {
    totalSoldQty += s.quantity;
    totalRevenueEarned += s.total_price;
    if (s.payment_method === "Cash") {
      cashPaymentQty += s.quantity;
    }
  });

  const kpiTop = 52;
  const kpiCardWidth = (pageWidth - 30) / 3;

  // KPI 1: Units Sold
  doc.setFillColor(244, 244, 245);
  doc.rect(15, kpiTop, kpiCardWidth - 2, 18, "F");
  doc.setFillColor(colorAmberAccent[0], colorAmberAccent[1], colorAmberAccent[2]);
  doc.rect(15, kpiTop, 1.5, 18, "F");
  drawTextWithCanvas(doc, lang === "am" ? "ጠቅላላ የተሸጡ ዕቃዎች ብዛት" : "Total Sold Units", 18, kpiTop + 4.5, { fontSize: 7, isBold: true, color: "#71717a" });
  drawTextWithCanvas(doc, `${totalSoldQty} units`, 18, kpiTop + 12.5, { fontSize: 10, isBold: true, color: "#18181b" });

  // KPI 2: Total Revenue
  doc.setFillColor(244, 244, 245);
  doc.rect(15 + kpiCardWidth, kpiTop, kpiCardWidth - 2, 18, "F");
  doc.setFillColor(16, 185, 129); // Green accent
  doc.rect(15 + kpiCardWidth, kpiTop, 1.5, 18, "F");
  drawTextWithCanvas(doc, lang === "am" ? "የተሸጡ ጠቅላላ ገቢ (ሪቬኑ)" : "Gross Realized Income", 15 + kpiCardWidth + 3.5, kpiTop + 4.5, { fontSize: 7, isBold: true, color: "#065f46" });
  drawTextWithCanvas(doc, `ETB ${Math.round(totalRevenueEarned).toLocaleString()}`, 15 + kpiCardWidth + 3.5, kpiTop + 12.5, { fontSize: 10, isBold: true, color: "#18181b" });

  // KPI 3: Cash ratio
  doc.setFillColor(244, 244, 245);
  doc.rect(15 + kpiCardWidth * 2, kpiTop, kpiCardWidth, 18, "F");
  doc.setFillColor(14, 165, 233); // sky blue
  doc.rect(15 + kpiCardWidth * 2, kpiTop, 1.5, 18, "F");
  drawTextWithCanvas(doc, lang === "am" ? "በእጅ የተከፈለ (በካሽ)" : "Total Hard Cash Sales", 15 + kpiCardWidth * 2 + 3.5, kpiTop + 4.5, { fontSize: 7, isBold: true, color: "#075985" });
  drawTextWithCanvas(doc, `${cashPaymentQty} units`, 15 + kpiCardWidth * 2 + 3.5, kpiTop + 12.5, { fontSize: 10, isBold: true, color: "#18181b" });

  // Main Section Title
  const sectionTitle = lang === "am" ? "የግብይት ሰንጠረዥ እና የተሸጡ ዕቃዎች ዝርዝር" : "Detailed Sold Stock Listings & Settlement Channels";
  drawTextWithCanvas(doc, sectionTitle, 15, 80, { fontSize: 10, isBold: true, color: "#18181b" });

  // Subtitle line separator
  doc.setDrawColor(colorDivider[0], colorDivider[1], colorDivider[2]);
  doc.setLineWidth(0.4);
  doc.line(15, 83, pageWidth - 15, 83);

  // Table setup (8 columns, total width 180mm)
  const tableTop = 87;
  const startX = 15;

  doc.setFillColor(colorThemePrimary[0], colorThemePrimary[1], colorThemePrimary[2]);
  doc.rect(startX, tableTop, 180, 8.5, "F");

  // Table Headers (8 columns)
  drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ስም" : "Item Name", startX + 2, tableTop + 4.25, { fontSize: 7, isBold: true, color: "#ffffff" });
  drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ፎቶ" : "Photo", startX + 41, tableTop + 4.25, { fontSize: 7, isBold: true, color: "#ffffff", align: "center" });
  drawTextWithCanvas(doc, lang === "am" ? "የተገዛበት ቀን" : "Sale Date", startX + 61, tableTop + 4.25, { fontSize: 7, isBold: true, color: "#ffffff", align: "center" });
  drawTextWithCanvas(doc, lang === "am" ? "የአንዱ ዕቃ ዋጋ" : "Unit Price", startX + 92, tableTop + 4.25, { fontSize: 7, isBold: true, color: "#ffffff", align: "right" });
  drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ብዛት" : "Qty", startX + 102, tableTop + 4.25, { fontSize: 7, isBold: true, color: "#ffffff", align: "center" });
  drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ሙሉ ዋጋ" : "Total Price", startX + 130, tableTop + 4.25, { fontSize: 7, isBold: true, color: "#ffffff", align: "right" });
  drawTextWithCanvas(doc, lang === "am" ? "የክፍያ መንገድ" : "Payment", startX + 143, tableTop + 4.25, { fontSize: 7, isBold: true, color: "#ffffff", align: "center" });
  drawTextWithCanvas(doc, lang === "am" ? "ዕቃው የተገዛበት ደረሰኝ ፎቶ" : "Receipt Photo", startX + 167, tableTop + 4.25, { fontSize: 7, isBold: true, color: "#ffffff", align: "center" });

  let currentY = tableTop + 8.5;
  const rowHeight = 16.5; 

  sales.forEach((s, index) => {
    if (currentY + rowHeight > pageHeight - 24) {
      doc.addPage();
      doc.setFillColor(colorAmberAccent[0], colorAmberAccent[1], colorAmberAccent[2]);
      doc.rect(0, 0, 5, pageHeight, "F");
      
      currentY = 20;
      doc.setFillColor(colorThemePrimary[0], colorThemePrimary[1], colorThemePrimary[2]);
      doc.rect(startX, currentY, 180, 8.5, "F");

      drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ስም" : "Item Name", startX + 2, currentY + 4.25, { fontSize: 7, isBold: true, color: "#ffffff" });
      drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ፎቶ" : "Photo", startX + 41, currentY + 4.25, { fontSize: 7, isBold: true, color: "#ffffff", align: "center" });
      drawTextWithCanvas(doc, lang === "am" ? "የተገዛበት ቀን" : "Sale Date", startX + 61, currentY + 4.25, { fontSize: 7, isBold: true, color: "#ffffff", align: "center" });
      drawTextWithCanvas(doc, lang === "am" ? "የአንዱ ዕቃ ዋጋ" : "Unit Price", startX + 92, currentY + 4.25, { fontSize: 7, isBold: true, color: "#ffffff", align: "right" });
      drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ብዛት" : "Qty", startX + 102, currentY + 4.25, { fontSize: 7, isBold: true, color: "#ffffff", align: "center" });
      drawTextWithCanvas(doc, lang === "am" ? "የዕቃው ሙሉ ዋጋ" : "Total Price", startX + 130, currentY + 4.25, { fontSize: 7, isBold: true, color: "#ffffff", align: "right" });
      drawTextWithCanvas(doc, lang === "am" ? "የክፍያ መንገድ" : "Payment", startX + 143, currentY + 4.25, { fontSize: 7, isBold: true, color: "#ffffff", align: "center" });
      drawTextWithCanvas(doc, lang === "am" ? "ዕቃው የተገዛበት ደረሰኝ ፎቶ" : "Receipt Photo", startX + 167, currentY + 4.25, { fontSize: 7, isBold: true, color: "#ffffff", align: "center" });
      
      currentY += 8.5;
    }

    if (index % 2 === 1) {
      doc.setFillColor(254, 252, 243); // warm light white hue
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(startX, currentY, 180, rowHeight, "F");

    doc.setDrawColor(244, 244, 245);
    doc.setLineWidth(0.35);
    doc.line(startX, currentY + rowHeight, startX + 180, currentY + rowHeight);

    // 1. Column 1: የዕቃው ስም (Product Name)
    drawTextWithCanvas(doc, s.product_name, startX + 2, currentY + 8.25, { fontSize: 7.5, isBold: true, color: "#18181b" });

    // 2. Column 2: የዕቃው ፎቶ (Product Image)
    const pImgX = startX + 35;
    const pImgY = currentY + 2.25;
    const imgSize = 12;

    const base64Img = loadedImages[s.id];
    if (base64Img) {
      try {
        doc.addImage(base64Img, getFormat(base64Img), pImgX, pImgY, imgSize, imgSize);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.25);
        doc.rect(pImgX, pImgY, imgSize, imgSize);
      } catch (e) {
        doc.setFillColor(254, 243, 199);
        doc.rect(pImgX, pImgY, imgSize, imgSize, "F");
        doc.setDrawColor(colorAmberAccent[0], colorAmberAccent[1], colorAmberAccent[2]);
        doc.setLineWidth(0.25);
        doc.rect(pImgX, pImgY, imgSize, imgSize);
        const initials = s.product_name.substring(0, 2);
        drawTextWithCanvas(doc, initials, pImgX + 6, pImgY + 6.5, { fontSize: 7, isBold: true, color: "#d97706", align: "center" });
      }
    } else {
      doc.setFillColor(254, 243, 199);
      doc.rect(pImgX, pImgY, imgSize, imgSize, "F");
      doc.setDrawColor(colorAmberAccent[0], colorAmberAccent[1], colorAmberAccent[2]);
      doc.setLineWidth(0.25);
      doc.rect(pImgX, pImgY, imgSize, imgSize);
      const initials = s.product_name.substring(0, 2);
      drawTextWithCanvas(doc, initials, pImgX + 6, pImgY + 6.5, { fontSize: 7, isBold: true, color: "#d97706", align: "center" });
    }

    const textY = currentY + 8.25;
    
    // 3. Column 3: የተገዛበት ቀን (Sale Date)
    const et = toEthiopian(s.sale_date);
    const dateFormatted = formatEthiopianDate(et, lang as any);
    drawTextWithCanvas(doc, dateFormatted, startX + 61, textY, { fontSize: 7, color: "#71717a", align: "center" });

    // 4. Column 4: የአንዱ ዕቃ ዋጋ (Unit Price)
    drawTextWithCanvas(doc, `ETB ${Math.round(s.unit_price).toLocaleString()}`, startX + 92, textY, { fontSize: 7.5, color: "#1f2937", align: "right", isBold: true });

    // 5. Column 5: የዕቃው ብዛት (Quantity)
    drawTextWithCanvas(doc, `${s.quantity} Pcs`, startX + 102, textY, { fontSize: 7.5, isBold: true, color: "#1f2937", align: "center" });

    // 6. Column 6: የዕቃው ሙሉ ዋጋ (Total Price)
    drawTextWithCanvas(doc, `ETB ${Math.round(s.total_price).toLocaleString()}`, startX + 130, textY, { fontSize: 7.5, color: "#1f2937", align: "right", isBold: true });

    // 7. Column 7: የክፍያ መንገድ (Payment Method)
    const displayPay = s.payment_method === "Cash" ? (lang === "am" ? "በእጅ" : "Cash") : s.payment_method;
    drawTextWithCanvas(doc, displayPay, startX + 143, textY, { fontSize: 7.5, isBold: true, color: "#1f2937", align: "center" });

    // 8. Column 8: የዕቃው የተገዛበት ደረሰኝ ፎቶ (Receipt Image)
    const receiptImgX = startX + 161;
    const receiptImgY = currentY + 2.25;
    const receiptBase64 = loadedReceipts[s.id];
    if (receiptBase64) {
      try {
        doc.addImage(receiptBase64, getFormat(receiptBase64), receiptImgX, receiptImgY, imgSize, imgSize);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.25);
        doc.rect(receiptImgX, receiptImgY, imgSize, imgSize);
      } catch (e) {
        drawTextWithCanvas(doc, lang === "am" ? "የለም" : "No receipt", startX + 167, textY, { fontSize: 7, color: "#94a3b8", align: "center" });
      }
    } else {
      drawTextWithCanvas(doc, lang === "am" ? "የለም" : "No receipt", startX + 167, textY, { fontSize: 7, color: "#94a3b8", align: "center" });
    }

    currentY += rowHeight;
  });

  // Summary Footer
  currentY += 6;
  if (currentY + 28 > pageHeight) {
    doc.addPage();
    doc.setFillColor(colorAmberAccent[0], colorAmberAccent[1], colorAmberAccent[2]);
    doc.rect(0, 0, 5, pageHeight, "F");
    currentY = 20;
  }

  doc.setFillColor(colorThemePrimary[0], colorThemePrimary[1], colorThemePrimary[2]);
  doc.rect(startX, currentY, 180, 15, "F");
  
  doc.setFillColor(colorAmberAccent[0], colorAmberAccent[1], colorAmberAccent[2]);
  doc.rect(startX, currentY, 2, 15, "F");

  const totalCaptionStr = lang === "am" ? "የተሸጡ ጠቅላላ ድምር ማጠቃለያ፦" : "Core Sales Revenue Summary Totals:";
  drawTextWithCanvas(doc, totalCaptionStr, startX + 4, currentY + 7.5, { fontSize: 8, isBold: true, color: "#ffffff" });
  
  const statsQtyStr = lang === "am" ? `የተሸጡ ብዛት፦ ${totalSoldQty} Pcs` : `Settled Volume: ${totalSoldQty} physical units delivered`;
  drawTextWithCanvas(doc, statsQtyStr, startX + 75, currentY + 7.5, { fontSize: 8.5, isBold: true, color: "#e2e8f0" });
  
  drawTextWithCanvas(doc, `Total Rev: ETB ${Math.round(totalRevenueEarned).toLocaleString()}`, startX + 180 - 4, currentY + 7.5, { fontSize: 8.5, isBold: true, color: "#fbbf24", align: "right" });

  // Signatures
  currentY += 25;
  if (currentY + 20 < pageHeight) {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.35);
    doc.line(startX + 10, currentY, startX + 60, currentY);
    doc.line(pageWidth - 70, currentY, pageWidth - 20, currentY);

    drawTextWithCanvas(doc, "የሂሳብ ባለሙያ ፊርማ / (Accountant Signature)", startX + 35, currentY + 4, { fontSize: 7.5, isBold: true, color: "#1e293b", align: "center" });
    drawTextWithCanvas(doc, "የሽያጭ ባለሙያ ፊርማ / (Sales Specialist Signature)", pageWidth - 45, currentY + 4, { fontSize: 7.5, isBold: true, color: "#1e293b", align: "center" });
  }

  // Footer text
  const descWarning = "ማስገንዘቢያ፦ ይህ በደራሽ ዘመናዊ መጋዘን መቆጣጠሪያና የሂሳብ አያያዝ ስርዓት የተዘጋጀ ነው።";
  drawTextWithCanvas(doc, descWarning, startX, pageHeight - 12, { fontSize: 7.5, color: "#475569" });
  
  const creditLine = "© 2026 Derash Inventory Management. All rights reserved.";
  drawTextWithCanvas(doc, creditLine, startX, pageHeight - 8, { fontSize: 7.5, color: "#94a3b8" });

  // Append images gallery
  const galleryItems = sales.map((s) => ({
    name: s.product_name,
    productImg: loadedImages[s.id],
    receiptImg: loadedReceipts[s.id],
    details: lang === "am"
      ? `ብዛት፦ ${s.quantity} Pcs | ጠቅላላ፦ ETB ${Math.round(s.total_price).toLocaleString()} | የሽያጭ ቀን፦ ${s.sale_date}`
      : `Quantity: ${s.quantity} Pcs | Total: ETB ${Math.round(s.total_price).toLocaleString()} | Sale Date: ${s.sale_date}`
  }));
  appendImagesGallery(doc, lang, galleryItems);

  // Add dynamic page numbers to all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageNumText = lang === "am" ? `ገጽ ${i} ከ ${totalPages}` : `Page ${i} of ${totalPages}`;
    drawTextWithCanvas(doc, pageNumText, pageWidth - 15, pageHeight - 8, { fontSize: 7.5, color: "#64748b", align: "right" });
  }

  doc.save(`derash-sold-revenue-${grToday}.pdf`);
}