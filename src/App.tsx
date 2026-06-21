import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { User } from "./types";
import { api } from "./services/api";
import { RefreshCw } from "lucide-react";
import { Language, translations } from "./utils/translations";

export default function App() {
  // Auth Session state
  const [token, setToken] = useState<string | null>(localStorage.getItem("derash_token"));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("derash_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<"login" | "register" | "dashboard">(() => {
    const savedToken = localStorage.getItem("derash_token");
    const savedUser = localStorage.getItem("derash_user");
    return (savedToken && savedUser) ? "dashboard" : "login";
  });
  
  const [loading, setLoading] = useState(false);

  // Language state
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("derash_lang");
    return (saved === "am" || saved === "en") ? saved : "am";
  });

  const handleLanguageToggle = () => {
    const nextLang = lang === "en" ? "am" : "en";
    setLang(nextLang);
    localStorage.setItem("derash_lang", nextLang);
  };

  const t = translations[lang];

  // Set browser tab title as specifically requested:
  // "Derash Inventory Management"
  useEffect(() => {
    document.title = lang === "am" ? "ደራሽ - የዕቃዎች ክምችት አስተዳደር" : "Derash Inventory Management";
  }, [lang]);

  // Validate session on app mount in background
  useEffect(() => {
    const validateSession = async () => {
      const savedToken = localStorage.getItem("derash_token");
      if (!savedToken) return;

      try {
        const response = await api.getMe();
        setUser(response.user);
        localStorage.setItem("derash_user", JSON.stringify(response.user));
      } catch (err) {
        console.error("Session verification failed. Wiping stale tokens.", err);
        localStorage.removeItem("derash_token");
        localStorage.removeItem("derash_user");
        setToken(null);
        setUser(null);
        setCurrentRoute("login");
      }
    };

    validateSession();
  }, []); // Run only on mount

  // Handle successful logins/registrations
  const handleAuthSuccess = (newToken: string, loggedInUser: User) => {
    localStorage.setItem("derash_token", newToken);
    localStorage.setItem("derash_user", JSON.stringify(loggedInUser));
    setToken(newToken);
    setUser(loggedInUser);
    setCurrentRoute("dashboard");
  };

  // Safe logout log sequence
  const handleLogout = async () => {
    if (user && token) {
      try {
        // Log event first
        await api.logEvent("USER_LOGOUT", "USER", user.id, "Logged out successfully via user interaction");
      } catch (e) {
        console.error("Failed auditing logout event", e);
      }
    }
    
    localStorage.removeItem("derash_token");
    localStorage.removeItem("derash_user");
    setToken(null);
    setUser(null);
    setCurrentRoute("login");
  };

  // Safe router switches
  const handleNavigation = (route: "login" | "register" | "dashboard") => {
    // If attempting to go to dashboard without session, route to login instead
    if (route === "dashboard" && !token) {
      setCurrentRoute("login");
    } else {
      setCurrentRoute(route);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center font-sans gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-zinc-950 flex items-center justify-center animate-bounce shadow-lg">
            <span className="text-white text-sm font-extrabold font-mono">D</span>
          </div>
          <span className="text-xl font-black text-zinc-900 tracking-tight font-sans">
            {lang === "am" ? "ደራሽ" : "Derash"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs font-semibold">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
          {t.loadingLedgerCheck}
        </div>
      </div>
    );
  }

  return (
    <div className="selection:bg-emerald-500/10 selection:text-emerald-700">
      {currentRoute === "login" && (
        <Login 
          onLoginSuccess={handleAuthSuccess} 
          onNavigate={handleNavigation} 
          lang={lang}
          onLanguageToggle={handleLanguageToggle}
        />
      )}
      
      {currentRoute === "register" && (
        <Register 
          onRegisterSuccess={handleAuthSuccess} 
          onNavigate={handleNavigation} 
          lang={lang}
          onLanguageToggle={handleLanguageToggle}
        />
      )}
      
      {currentRoute === "dashboard" && user && token && (
        <Dashboard 
          user={user} 
          token={token} 
          onLogout={handleLogout} 
          onNavigate={handleNavigation} 
          lang={lang}
          onLanguageToggle={handleLanguageToggle}
        />
      )}
    </div>
  );
}
