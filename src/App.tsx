import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { LanguageContext } from "@/lib/useLanguage";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import Auth from "./pages/Auth";
import WalletPage from "./pages/WalletPage";
import SchemeDetail from "./pages/SchemeDetail";
import ApplyPage from "./pages/ApplyPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ExploreSchemesPage from "./pages/ExploreSchemesPage";
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
              <Route path="/auth" element={<Auth />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/explore" element={<ExploreSchemesPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/scheme/:id" element={<SchemeDetail />} />
              <Route path="/apply/:id" element={<ApplyPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
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
