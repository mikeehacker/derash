export type Language = "en" | "am";

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  currentCulture: string;
  activeOperator: string;
  disconnectPanel: string;
  controlPanel: string;
  home: string;
  login: string;
  register: string;
  signIn: string;
  signOut: string;
  signUp: string;
  alreadyRegistered: string;
  dontHaveAccount: string;
  registerHere: string;
  signInInstead: string;
  emailAddress: string;
  passwordLabel: string;
  fullName: string;
  operationalRole: string;
  unlockDashboard: string;
  createAccount: string;
  welcomeBack: string;
  startManaging: string;
  instantDemo: string;
  loadingLedgerCheck: string;

  // Tabs
  inventoryTab: string;
  analyticsTab: string;

  // Home Page HERO
  heroBadge: string;
  heroHeadingBefore: string;
  heroHeadingHighlight: string;
  heroText: string;
  getStarted: string;
  exploreDemo: string;
  goDashboard: string;
  featuresHeading: string;
  featuresSubheading: string;

  // Home Features
  featureEtCalendarTitle: string;
  featureEtCalendarDesc: string;
  featureReportsTitle: string;
  featureReportsDesc: string;
  featureDynamicTitle: string;
  featureDynamicDesc: string;

  // Metrics
  metricSkuCount: string;
  metricSkuDesc: string;
  metricVolume: string;
  metricVolumeDesc: string;
  metricWorth: string;
  metricWorthDesc: string;

  // Toolbar
  searchPlaceholder: string;
  clearBtn: string;
  paymentMethodAll: string;
  pdfExportReport: string;
  recordIntake: string;
  filterLabel: string;

  // Table Columns & States
  colProductDetails: string;
  colQuantities: string;
  colDate: string;
  colPaymentMethod: string;
  colWorth: string;
  colActions: string;
  zeroStockLines: string;
  zeroStockDesc: string;
  outOfStock: string;
  units: string;
  unitPrice: string;
  totalNetInflow: string;
  recordedOperator: string;
  ethiopianDate: string;
  gregorianDate: string;
  closeDeck: string;
  deleteConfirmTitle: string;
  deleteConfirmDesc: string;
  deleteConfirmBtn: string;
  deleteCancelBtn: string;
  showingEntries: string;

  // Analytics
  financialReportsTitle: string;
  financialReportsDesc: string;
  todayIngestion: string;
  weekInflow: string;
  monthInflow: string;
  todayUnitsLogged: string;
  weekUnitsLogged: string;
  monthUnitsLogged: string;
  netAssetDistribution: string;
  unitVolumeShare: string;
  paymentShareSummary: string;
  valuationTrendTitle: string;
  paymentTrendsSubtitle: string;

  // Product Form Modal
  formTitleCreate: string;
  formTitleEdit: string;
  formProductName: string;
  formQuantity: string;
  formTotalPrice: string;
  formPurchaseDate: string;
  formPaymentMethod: string;
  formImageAttachment: string;
  formImageAttached: string;
  formChangePhoto: string;
  formSelectPhoto: string;
  formDragPhoto: string;
  formSubmitCreate: string;
  formSubmitUpdate: string;
  formCancel: string;
  formStatusSaving: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: "Derash",
    appSubtitle: "ERP Inflow Control",
    currentCulture: "Current Epoch Ledger",
    activeOperator: "Active Operator",
    disconnectPanel: "Disconnect Panel Secure",
    controlPanel: "Control Panel",
    home: "Home",
    login: "Login",
    register: "Register",
    signIn: "Sign In",
    signOut: "Sign Out",
    signUp: "Sign Up",
    alreadyRegistered: "Already registered?",
    dontHaveAccount: "Don't have an account?",
    registerHere: "Register here",
    signInInstead: "Sign In instead",
    emailAddress: "Email Address",
    passwordLabel: "Secret Password",
    fullName: "Full Name",
    operationalRole: "Operational Role",
    unlockDashboard: "Unlock Dashboard",
    createAccount: "Create Account",
    welcomeBack: "Welcome Back to Derash",
    startManaging: "Start Managing Stock Precise",
    instantDemo: "Instant Demo Admin Credentials",
    loadingLedgerCheck: "Verifying active session ledgers...",

    inventoryTab: "Inventory Management",
    analyticsTab: "Analytical Reports",

    heroBadge: "Sovereign Ethiopian Standard ERP",
    heroHeadingBefore: "Smarter Stock, Built for ",
    heroHeadingHighlight: "Ethiopia",
    heroText: "Introducing Derash Inventory: A beautifully detailed management ecosystem featuring dual-calendar calculations, secure transaction ledgers, image triggers, and vector PDF audit reports.",
    getStarted: "Create Free Account",
    exploreDemo: "Explore Demo System",
    goDashboard: "Go to Dashboard",
    featuresHeading: "Crafted for Extreme Operational Control",
    featuresSubheading: "Every core module fine-tuned for modern businesses in Addis Ababa and beyond.",

    featureEtCalendarTitle: "Ethiopian Calendar Hub",
    featureEtCalendarDesc: "Integrated calendar selector. Select dates in EC months of Tir, Hamle or Pagume and save in standard DB formats instantly.",
    featureReportsTitle: "Inflow Vector Reports",
    featureReportsDesc: "Export beautiful portable documents with a single click. High contrast rows show purchase paths, payment codes, and total sums.",
    featureDynamicTitle: "Real-Time Visualization",
    featureDynamicDesc: "Robust analytic charts plotting capital allocation, unit-volume ratios, and active transaction flows split across major payment channels.",

    metricSkuCount: "Current SKU Count",
    metricSkuDesc: "Aggregated item registrations",
    metricVolume: "Consolidated Volume",
    metricVolumeDesc: "Consolidated standard physical units",
    metricWorth: "Aggregated Asset Valuation",
    metricWorthDesc: "Total calculated portfolio net worth",

    searchPlaceholder: "Search by brand name...",
    clearBtn: "Clear",
    paymentMethodAll: "All payment methods",
    pdfExportReport: "PDF Inflow Report",
    recordIntake: "Record Intake",
    filterLabel: "Portal:",

    colProductDetails: "Product Details & Photo",
    colQuantities: "Product Quantity",
    colDate: "Registered Date of the Item",
    colPaymentMethod: "Payment Method",
    colWorth: "Total Price",
    colActions: "Adjustment",
    zeroStockLines: "Zero Stock Lines Registered",
    zeroStockDesc: "Ready to track stock? Create a newly recorded inflow item using the Intake button.",
    outOfStock: "Out of stock",
    units: "Units",
    unitPrice: "Unit Price",
    totalNetInflow: "Total Net Inflow",
    recordedOperator: "Recorded operator",
    ethiopianDate: "Ethiopian Calendar Date",
    gregorianDate: "Gregorian standard Date",
    closeDeck: "Close Deck",
    deleteConfirmTitle: "Confirm Deletion",
    deleteConfirmDesc: "Are you absolutely sure you want to permanently delete this stock record from the system? This action is irreversible.",
    deleteConfirmBtn: "Confirm Delete",
    deleteCancelBtn: "Keep Record",
    showingEntries: "Showing {start} to {end} of {total} entries",

    financialReportsTitle: "Financial Reports & Flows",
    financialReportsDesc: "Ingested stock values and distributions grouped according to payment channels and periods",
    todayIngestion: "Today's Ingestions",
    weekInflow: "This Week's Inflow",
    monthInflow: "This Month's Inflow",
    todayUnitsLogged: "logged units today",
    weekUnitsLogged: "logged units this week",
    monthUnitsLogged: "logged units this month",
    netAssetDistribution: "Net Asset Distribution (By Revenue)",
    unitVolumeShare: "Unit Volume Share (By Quantity)",
    paymentShareSummary: "Payment Gateway Share Summary",
    valuationTrendTitle: "Inflow Capital Growth / Trend Analysis",
    paymentTrendsSubtitle: "Monetary values mapped based on transaction logs",

    formTitleCreate: "Record Stock Intake Entry",
    formTitleEdit: "Modify Inflow Record Ledger",
    formProductName: "Product Name",
    formQuantity: "Product Quantity",
    formTotalPrice: "Total Price:",
    formPurchaseDate: "Registered Date of the Item",
    formPaymentMethod: "Payment Gateway",
    formImageAttachment: "Product Photo",
    formImageAttached: "Photo attachment captured",
    formChangePhoto: "Change Photo",
    formSelectPhoto: "click to upload a picture",
    formDragPhoto: "Drag and drop product thumbnail here, or",
    formSubmitCreate: "Publish Entry",
    formSubmitUpdate: "Save Changes",
    formCancel: "Cancel",
    formStatusSaving: "Publishing asset logs..."
  },
  am: {
    appName: "ደራሽ",
    appSubtitle: "የERP ክምችት ቁጥጥር",
    currentCulture: "የአሁኑ ዘመን መቁጠሪያ",
    activeOperator: "የአሁኑ ሰራተኛ",
    disconnectPanel: "ከፓነሉ ደህንነቱ በተጠበቀ ሁኔታ ውጣ",
    controlPanel: "የመቆጣጠሪያ ፓነል",
    home: "ዋና ገጽ",
    login: "ግባ",
    register: "ተመዝገብ",
    signIn: "ግባ",
    signOut: "ውጣ",
    signUp: "ተመዝገብ",
    alreadyRegistered: "ከዚህ በፊት ተመዝግበዋል?",
    dontHaveAccount: "መለያ የለዎትም?",
    registerHere: "እዚህ ይመዝገቡ",
    signInInstead: "በምትኩ ይግቡ",
    emailAddress: "የኢሜይል አድራሻ",
    passwordLabel: "ምስጢራዊ የይለፍ ቃል",
    fullName: "ሙሉ ስም",
    operationalRole: "የስራ ሃላፊነት / ሚና",
    unlockDashboard: "ዳሽቦርዱን ክፈት",
    createAccount: "መለያ ፍጠር",
    welcomeBack: "እንኳን ደህና መጡ ወደ ደራሽ",
    startManaging: "የዕቃዎች ክምችት በ精准 መቆጣጠር ይጀምሩ",
    instantDemo: "የሙከራ የአስተዳዳሪ መግቢያ ምስክርነቶች",
    loadingLedgerCheck: "ገባሪውን የክፍለ ጊዜ መግቢያዎች በማረጋገጥ ላይ...",

    inventoryTab: "የዕቃዎች ክምችት አስተዳደር",
    analyticsTab: "የትንታኔ ሪፖርቶች",

    heroBadge: "የኢትዮጵያ ደረጃዎችን የጠበቀ የላቀ ERP",
    heroHeadingBefore: "የተሻለ የዕቃ ቁጥጥር፣ ለ",
    heroHeadingHighlight: "ኢትዮጵያ",
    heroText: "ደራሽ ኢንቬንተሪን እናስተዋውቅዎታለን፡- የሁለትዮሽ የቀን አቆጣጠር መለወጫዎችን፣ አስተማማኝ የግብይት መዝገቦችን፣ የምስል አባሪዎችን እና ፒ.ዲ.ኤፍ (PDF) ሪፖርቶችን የያዘ ውብ ዘመናዊ የአስተዳደር ስርዓት።",
    getStarted: "ነፃ መለያ ፍጠር",
    exploreDemo: "የሙከራ ስርዓቱን ያስሱ",
    goDashboard: "ወደ ዳሽቦርድ ይሂዱ",
    featuresHeading: "ለከፍተኛ የስራ ማስኬጃ ቁጥጥር የተሰራ",
    featuresSubheading: "እያንዳንዱ ዋና ሞዱል በአዲስ አበባ እና በአካባቢዋ ላሉ ዘመናዊ ንግዶች ተስማሚ ሆኖ የተሰራ ነው።",

    featureEtCalendarTitle: "የኢትዮጵያ ካላንደር ማዕከል",
    featureEtCalendarDesc: "የተቀናጀ የካላንደር መምረጫ። እንደ ጥር፣ ሐምሌ ወይም ጳጉሜ ባሉ የኢ.ሲ ወራት ውስጥ ቀንን ይምረጡና ወዲያውኑ በመደበኛ የውሂብ ጎታ ቅርጸት ያስቀምጡ።",
    featureReportsTitle: "የክምችት ፒ.ዲ.ኤፍ ሪፖርቶች",
    featureReportsDesc: "በአንድ ጠቅታ ውብ የሆኑ ተንቀሳቃሽ ሰነዶችን ወደ ውጭ ይላኩ። ከፍተኛ ንፅፅር ያላቸው ረድፎች የግዢ መንገዶችን፣ የክፍያ ኮዶችን እና አጠቃላይ ድምርን ያሳያሉ።",
    featureDynamicTitle: "የቅጽበታዊ መረጃ ትንታኔ",
    featureDynamicDesc: "የካፒታል ምደባን፣ የክፍያ ስርጭቶችን እና የግብይት ፍሰቶችን በዋና ዋና የክፍያ መንገዶች የሚለዩ ጠንካራ የትንታኔ ገበታዎች።",

    metricSkuCount: "የአሁኑ የዕቃዎች (SKU) ብዛት",
    metricSkuDesc: "የተመዘገቡ የክምችት ዓይነቶች አጠቃላይ ድምር",
    metricVolume: "አጠቃላይ የዕቃዎች ብዛት",
    metricVolumeDesc: "የተጠራቀሙ አጠቃላይ አካላዊ ዕቃዎች ብዛት",
    metricWorth: "አጠቃላይ የንብረት ዋጋ ግምት",
    metricWorthDesc: "የወቅቱ አጠቃላይ የዕቃዎች የገንዘብ ዋጋ ድምር",

    searchPlaceholder: "በምርት ስም ይፈልጉ...",
    clearBtn: "አጽዳ",
    paymentMethodAll: "அனைቱ የክፍያ መንገዶች",
    pdfExportReport: "ሪፖርት በPDF አውርድ",
    recordIntake: "አዲስ ዕቃ መዝግብ",
    filterLabel: "ፖርታል (መተላለፊያ)፦",

    colProductDetails: "የዕቃው ስም ፎቶ",
    colQuantities: "የዕቃው ብዛት",
    colDate: "የዕቃው የተመዘገበበት ቀን",
    colPaymentMethod: "የክፍያ ዘዴ",
    colWorth: "ሙሉ ዋጋ፦",
    colActions: "ማስተካከያ",
    zeroStockLines: "ምንም የተመዘገበ ዕቃ የለም",
    zeroStockDesc: "ዕቃዎችን መከታተል ለመጀመር ዝግጁ ነዎት? ‘አዲስ ዕቃ መዝግብ’ የሚለውን ቁልፍ በመጫን መመዝገብ ይጀምሩ።",
    outOfStock: "ያለቀ ዕቃ / መጋዘን ውስጥ የለም",
    units: "ፍሬ",
    unitPrice: "የአንዱ ዋጋ",
    totalNetInflow: "ጠቅላላ የተጣራ ገቢ",
    recordedOperator: "የመዘገበው ሰራተኛ",
    ethiopianDate: "የኢትዮጵያ የቀን አቆጣጠር",
    gregorianDate: "የአውሮፓውያን የቀን አቆጣጠር",
    closeDeck: "ዝጋ",
    deleteConfirmTitle: "ምዝገባን ሰርዝ",
    deleteConfirmDesc: "ይህን የዕቃ ምዝገባ ከመጋዘን መዝገብ ላይ በቋሚነት መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት? ይህ ድርጊት ወደኋላ ሊመለስ አይችልም።",
    deleteConfirmBtn: "በቋሚነት ሰርዝ",
    deleteCancelBtn: "ይቆይ / አትሰርዝ",
    showingEntries: "ከ {start} እስከ {end} (በጠቅላላው {total} ዕቃዎች ውስጥ) እያሳየ ነው",

    financialReportsTitle: "የፋይናንስ ሪፖርቶች እና ፍሰቶች",
    financialReportsDesc: "የተመዘገቡ የክምችት እሴቶች እና ስርጭቶች በክፍያ መንገዶች እና በጊዜ ወቅቶች ተከፋፍለው የቀረቡበት ገበታ",
    todayIngestion: "የዛሬ የገቡ ዕቃዎች",
    weekInflow: "የዚህ ሳምንት ገቢ",
    monthInflow: "የዚህ ወር ገቢ",
    todayUnitsLogged: "ዕቃዎች ዛሬ ተመዝግበዋል",
    weekUnitsLogged: "ዕቃዎች በዚህ ሳምንት ተመዝግበዋል",
    monthUnitsLogged: "ዕቃዎች በዚህ ወር ተመዝግበዋል",
    netAssetDistribution: "አጠቃላይ የንብረት ድርሻ (በባለቤትነት እሴት)",
    unitVolumeShare: "የክምችት መጠን ድርሻ (በብዛት)",
    paymentShareSummary: "የክፍያ መንገዶች ድርሻ ማጠቃለያ",
    valuationTrendTitle: "የመጋዘን ካፒታል ዕድገት / የጊዜ ግስጋሴ ትንታኔ",
    paymentTrendsSubtitle: "በባንክ እና ዲጂታል ክፍያ መዝገቦች ላይ የተመሰረቱ የገንዘብ መጠኖች",

    formTitleCreate: "የአዲስ ዕቃ ማስገቢያ መዝገብ",
    formTitleEdit: "የዕቃ ምዝገባ ማሻሻያ ቅጽ",
    formProductName: "የዕቃው ስም",
    formQuantity: "የዕቃው ብዛት",
    formTotalPrice: "ሙሉ ዋጋ፦",
    formPurchaseDate: "የዕቃው የተመዘገበበት ቀን",
    formPaymentMethod: "የክፍያ መተላለፊያ",
    formImageAttachment: "የዕቃው ፎቶ",
    formImageAttached: "ፎቶው በተሳካ ሁኔታ ተያይዟል",
    formChangePhoto: "ፎቶ ቀይር",
    formSelectPhoto: "ምስል ለመጫን እዚህ ይጫኑ",
    formDragPhoto: "የምርቱን ምስል እዚህ ይጎትቱት ወይም ያስገቡት፣ ወይም",
    formSubmitCreate: "በመዝገብ ላይ አትም",
    formSubmitUpdate: "ማሻሻያዎችን አስቀምጥ",
    formCancel: "ሰርዝ",
    formStatusSaving: "መረጃውን በመዝገብ ላይ በመጫን ላይ..."
  }
};
