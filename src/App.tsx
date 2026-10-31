import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { LanguageContext } from "@/lib/useLanguage";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import WalletPage from "./pages/WalletPage";
import SchemeDetail from "./pages/SchemeDetail";
import ExploreSchemesPage from "./pages/ExploreSchemesPage";
import AdminSchemesPage from "./pages/AdminSchemesPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [language, setLanguage] = useState<string | null>(
    localStorage.getItem('bb_lang')
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/explore" element={<ExploreSchemesPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/scheme/:id" element={<SchemeDetail />} />
              <Route path="/apply/:id" element={<Navigate to="/explore" replace />} />
              <Route path="/applications" element={<Navigate to="/admin" replace />} />
              <Route path="/admin" element={<AdminSchemesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageContext.Provider>
  );
};

export default App;
