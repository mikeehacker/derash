import React, { useState } from "react";
import { api } from "../services/api";
import { User } from "../types";
import { ShieldAlert, RefreshCw, KeyRound, Mail, ArrowRight, Globe } from "lucide-react";
import { Language, translations } from "../utils/translations";

interface LoginProps {
  onLoginSuccess: (token: string, user: User) => void;
  onNavigate: (route: "login" | "register" | "dashboard") => void;
  lang: Language;
  onLanguageToggle: () => void;
}

export default function Login({ onLoginSuccess, onNavigate, lang, onLanguageToggle }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    if (!email || !password) {
      setErrorText(
        lang === "am" 
          ? "እባክዎን የኢሜል አድራሻዎን እና ምስጢራዊ የይለፍ ቃልዎን ያስገቡ።" 
          : "Please enter both your email address and password."
      );
      return;
    }

    setLoading(true);
    try {
      const response = await api.login(email.trim(), password);
      onLoginSuccess(response.token, response.user);
    } catch (err: any) {
      setErrorText(
        err.message || 
        (lang === "am" 
          ? "የተሳሳተ ኢሜል ወይም የይለፍ ቃል ያስገቡ። እባክዎ በድጋሚ ይሞክሩ።" 
          : "Invalid credentials. Please verify your email and password.")
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#fafbfe] relative flex flex-col items-center justify-center p-4 sm:p-6 font-sans overflow-hidden">
      
      {/* Background ambient accents */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top utility language selector */}
      <div className="w-full max-w-md flex justify-end items-center mb-4 z-10">
        <button
          onClick={onLanguageToggle}
          className="px-3.5 py-1.5 text-xs font-black uppercase bg-white hover:bg-zinc-50 border border-zinc-200/50 rounded-2xl text-zinc-700 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>{lang === "en" ? "አማርኛ" : "English"}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white border border-zinc-150 rounded-[32px] shadow-[0_20px_50px_rgba(4,120,87,0.02)] p-6 sm:p-9 z-10 duration-300">
        
        {/* Logo and title */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div 
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-zinc-900 to-zinc-950 flex items-center justify-center shadow-xl mb-4.5 transform hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="text-white text-lg font-black font-mono">D</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">{t.welcomeBack}</h2>
          <span className="mt-1.5 px-3 py-1 bg-emerald-500/5 text-emerald-700 font-black text-[9px] uppercase tracking-widest rounded-lg border border-emerald-500/10">
            {t.appName} ERP SYSTEM
          </span>
        </div>

        {/* Status Error alert */}
        {errorText && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100/60 text-rose-600 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4.5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-zinc-405 uppercase tracking-widest">{t.emailAddress}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
              <input
                type="email"
                required
                placeholder="email@derash.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 min-h-[48px] text-sm bg-zinc-50 hover:bg-zinc-100/30 focus:bg-white border border-zinc-200 focus:border-zinc-900 rounded-2xl focus:outline-none transition duration-150 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-black text-zinc-405 uppercase tracking-widest">{t.passwordLabel}</label>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 min-h-[48px] text-sm bg-zinc-50 hover:bg-zinc-100/30 focus:bg-white border border-zinc-200 focus:border-zinc-900 rounded-2xl focus:outline-none transition duration-150 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] bg-[#009b3a] hover:bg-[#008331] active:bg-[#007029] text-white rounded-2xl text-xs font-black disabled:bg-zinc-200 shadow-md flex items-center justify-center gap-2 transition duration-200 cursor-pointer hover:shadow-lg active:scale-98"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
            ) : (
              <>
                <span>{t.unlockDashboard}</span>
                <ArrowRight className="w-4 h-4 text-emerald-100" />
              </>
            )}
          </button>
        </form>

        {/* Account switches */}
        <div className="mt-8 border-t border-zinc-100 pt-6 text-center">
          <p className="text-xs text-zinc-550 font-semibold">
            {t.dontHaveAccount}{" "}
            <button
              onClick={() => onNavigate("register")}
              className="text-[#009b3a] font-extrabold hover:underline cursor-pointer"
            >
              {t.registerHere}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
