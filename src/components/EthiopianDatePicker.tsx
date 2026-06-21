import React, { useState, useEffect } from "react";
import { 
  ETHIOPIAN_MONTHS_EN,
  ETHIOPIAN_MONTHS_AM,
  toGregorian, 
  toEthiopian, 
  formatEthiopianDate,
  getEthiopianToday
} from "../utils/ethiopianCalendar";
import { Language } from "../utils/translations";
import { Calendar as CalendarIcon } from "lucide-react";

interface EthiopianDatePickerProps {
  value: string; // YYYY-MM-DD Gregorian date
  onChange: (gregorianDateStr: string) => void;
  label?: string;
  id?: string;
  lang?: Language;
}

export default function EthiopianDatePicker({ 
  value, 
  onChange, 
  label, 
  id = "eth-date",
  lang = "en" 
}: EthiopianDatePickerProps) {
  // Initialize from Gregorian string or current date
  const initialET = value ? toEthiopian(value) : getEthiopianToday();
  
  // States matching user's logic
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(initialET.month - 1); // 0-12
  const [currentYear, setCurrentYear] = useState<number>(initialET.year);
  const [selectedDay, setSelectedDay] = useState<number | null>(initialET.day);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const monthsList = lang === "am" ? ETHIOPIAN_MONTHS_AM : ETHIOPIAN_MONTHS_EN;
  
  const weekdays = lang === "am" 
    ? ["ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "አርብ", "ቅዳሜ", "እሑድ"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const computedLabel = label || (lang === "am" 
    ? "ቀን ይምረጡ (የኢትዮጵያ ዘመን አቆጣጠር)" 
    : "Select Date (Ethiopian Calendar)");

  // Sync state with incoming value
  useEffect(() => {
    if (value) {
      const et = toEthiopian(value);
      setCurrentYear(et.year);
      setCurrentMonthIndex(et.month - 1);
      setSelectedDay(et.day);
    }
  }, [value]);

  const openCalendar = () => setIsOpen(true);
  const closeCalendar = () => setIsOpen(false);

  // Math-safe days in current Ethiopian month
  const getMaxDays = (y: number, mIndex: number) => {
    if (mIndex === 12) { // Pagume (13th Month)
      return (y % 4 === 3) ? 6 : 5;
    }
    return 30;
  };

  // Safe weekday offset for alignment of the first day in month
  const getStartOffset = (y: number, mIndex: number) => {
    try {
      const gregStr = toGregorian(y, mIndex + 1, 1);
      const parts = gregStr.split("-");
      if (parts.length === 3) {
        const yr = parseInt(parts[0], 10);
        const mo = parseInt(parts[1], 10) - 1;
        const dy = parseInt(parts[2], 10);
        const d = new Date(yr, mo, dy);
        const gDay = d.getDay(); // 0 is Sunday, 1 Monday...
        // Format to map Monday as index 0, Tuesday index 1 ... Sunday index 6
        return (gDay + 6) % 7;
      }
    } catch {
      // fallback
    }
    return 0;
  };

  const handleMonthChange = (mIndex: number) => {
    setCurrentMonthIndex(mIndex);
  };

  const handleYearChange = (y: number) => {
    setCurrentYear(y);
  };

  const handlePrev = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(currentMonthIndex - 1);
    } else {
      setCurrentMonthIndex(12);
      setCurrentYear(currentYear - 1);
    }
  };

  const handleNext = () => {
    if (currentMonthIndex < 12) {
      setCurrentMonthIndex(currentMonthIndex + 1);
    } else {
      setCurrentMonthIndex(0);
      setCurrentYear(currentYear + 1);
    }
  };

  // Convert Gregorian date equivalence details
  const currentGregorianFormatted = value ? new Date(value).toLocaleDateString(lang === "am" ? "am-ET" : "en-US", {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  }) : "";

  // Set the date and call callback handler
  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const grDateStr = toGregorian(currentYear, currentMonthIndex + 1, day);
    onChange(grDateStr);
    closeCalendar();
  };

  // Format textual value for the Input element representation
  const getFormattedValue = () => {
    if (!value && selectedDay === null) {
      return lang === "am" ? "ቀን ይምረጡ..." : "Select date...";
    }
    const et = value ? toEthiopian(value) : { year: currentYear, month: currentMonthIndex + 1, day: selectedDay || 1 };
    const mName = monthsList[et.month - 1];
    return lang === "am"
      ? `${mName} ${et.day} ቀን ${et.year} ዓ.ም`
      : `${mName} ${et.day}, ${et.year} EC`;
  };

  const daysCount = getMaxDays(currentYear, currentMonthIndex);
  const startOffset = getStartOffset(currentYear, currentMonthIndex);

  return (
    <div className="w-full max-w-full font-sans select-none" id={id}>
      <label className="block mb-1.5 text-[11px] font-black text-zinc-400 uppercase tracking-wider transition-colors">
        {computedLabel}
      </label>

      {/* Input textbox with beautiful custom responsive wrapper */}
      <div className="relative">
        <input
          id={`${id}-input`}
          type="text"
          readOnly
          value={getFormattedValue()}
          onClick={openCalendar}
          placeholder={lang === "am" ? "ቀን ይምረጡ..." : "Select date..."}
          className="w-full min-h-[46px] py-2.5 pl-4 pr-12 border border-zinc-200 focus:border-[#009b3a] focus:ring-1 focus:ring-[#009b3a] rounded-xl text-xs font-bold outline-none bg-zinc-50/50 cursor-pointer select-none transition-all duration-200"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          <CalendarIcon className="w-5 h-5" />
        </span>
      </div>

      {/* Corresponding Gregorian date alert validation indicator check */}
      {value && (
        <div className="mt-2 text-xs text-zinc-400 font-mono text-left pl-1">
          {lang === "am" ? "የታየው ቀን አቻ (Gregorian)፦" : "Gregorian counterpart:"} <span className="font-semibold text-zinc-600 font-sans">{currentGregorianFormatted}</span>
        </div>
      )}

      {/* Dynamic Backdrop */}
      <div 
        id={`${id}-backdrop`}
        className={`fixed inset-0 bg-black/35 z-[9998] transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={closeCalendar}
      />

      {/* Dynamic Bottom Sheet / Centered Dropdown Sheet */}
      <div
        id={`${id}-calendar-picker`}
        className={`fixed left-0 right-0 bottom-[-100%] md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md w-full bg-white rounded-t-[24px] md:rounded-[24px] p-[18px] transition-all duration-300 ease-out z-[9999] shadow-2xl max-h-[80vh] md:max-h-none overflow-y-auto ${
          isOpen ? "!bottom-0 md:opacity-100 md:scale-100" : "md:opacity-0 md:scale-95 md:pointer-events-none"
        }`}
      >
        <div className="drag-handle w-12 h-1.5 bg-zinc-300 rounded-full mx-auto mb-4 md:hidden" />

        <div className="flex items-center gap-2 mb-4">
          <button 
            type="button"
            className="w-[46px] h-[46px] border-none rounded-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xl flex items-center justify-center transition cursor-pointer active:scale-95" 
            id={`${id}-prev`} 
            onClick={handlePrev}
          >
            ‹
          </button>

          {/* Month Select dropdown */}
          <select 
            id={`${id}-month-select`}
            value={currentMonthIndex}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="flex-1 h-[46px] border border-zinc-200 rounded-[10px] px-2.5 text-[15px] font-semibold text-zinc-800 bg-zinc-50 focus:outline-none focus:border-[#009b3a] focus:ring-1 focus:ring-[#009b3a] cursor-pointer"
          >
            {monthsList.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>

          {/* Year Select dropdown */}
          <select 
            id={`${id}-year-select`}
            value={currentYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="flex-1 h-[46px] border border-zinc-200 rounded-[10px] px-2.5 text-[15px] font-semibold text-zinc-800 bg-zinc-50 focus:outline-none focus:border-[#009b3a] focus:ring-1 focus:ring-[#009b3a] cursor-pointer"
          >
            {Array.from({ length: 41 }, (_, i) => 2000 + i).map((yr) => (
              <option key={yr} value={yr}>
                {yr} {lang === "am" ? "ዓ.ም" : "EC"}
              </option>
            ))}
          </select>

          <button 
            type="button"
            className="w-[46px] h-[46px] border-none rounded-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xl flex items-center justify-center transition cursor-pointer active:scale-95" 
            id={`${id}-next`} 
            onClick={handleNext}
          >
            ›
          </button>
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1.5" id={`${id}-days-grid`}>
          {/* Weekday columns labels */}
          {weekdays.map((day, dIdx) => (
            <div key={dIdx} className="text-center text-[11px] font-bold text-zinc-400 py-1 select-none">
              {day}
            </div>
          ))}

          {/* Empty prepended paddings for calendar offset */}
          {Array.from({ length: startOffset }, (_, i) => (
            <div key={`empty-${i}`} className="min-h-[44px] md:min-h-[48px]" />
          ))}

          {/* Individual days render */}
          {Array.from({ length: daysCount }, (_, i) => {
            const dayNum = i + 1;
            // Check if this matches selectedDay values with corresponding viewed year + month
            const isSelected = selectedDay === dayNum && 
              currentMonthIndex === (value ? toEthiopian(value).month - 1 : initialET.month - 1) && 
              currentYear === (value ? toEthiopian(value).year : initialET.year);

            return (
              <button
                type="button"
                key={dayNum}
                onClick={() => handleSelectDay(dayNum)}
                className={`min-h-[44px] md:min-h-[48px] flex justify-center items-center rounded-xl text-[15px] font-bold transition duration-150 active:scale-95 cursor-pointer ${
                  isSelected
                    ? "bg-[#009b3a] text-white shadow-md shadow-[#009b3a]/20 font-extrabold scale-105"
                    : "hover:bg-zinc-100 text-zinc-800"
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
