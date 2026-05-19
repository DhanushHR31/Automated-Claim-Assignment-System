import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Policies from "./pages/Policies";
import BuyInsurance from "./pages/BuyInsurance";
import InsuranceDetails from "./pages/InsuranceDetails";
import Claims from "./pages/Claims";
import Analytics from "./pages/Analytics";
import SettingsPage from "./pages/SettingsPage";
import PremiumCalculator from "./pages/PremiumCalculator";
import KYCPage from "./pages/KYCPage";
import CustomerSupport from "./pages/CustomerSupport";
import PolicyDetail from "./pages/PolicyDetail";
import Hospitals from "./pages/Hospitals";
import HospitalDetails from "./pages/HospitalDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/policies" element={<ProtectedRoute><Policies /></ProtectedRoute>} />
            <Route path="/buy-insurance" element={<ProtectedRoute><BuyInsurance /></ProtectedRoute>} />
            <Route path="/insurance-details" element={<ProtectedRoute><InsuranceDetails /></ProtectedRoute>} />
            <Route path="/claims" element={<ProtectedRoute><Claims /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><PremiumCalculator /></ProtectedRoute>} />
            <Route path="/kyc" element={<ProtectedRoute><KYCPage /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><CustomerSupport /></ProtectedRoute>} />
            <Route path="/policy/:id" element={<ProtectedRoute><PolicyDetail /></ProtectedRoute>} />
            <Route path="/hospitals" element={<ProtectedRoute><Hospitals /></ProtectedRoute>} />
            <Route path="/hospital/:id" element={<ProtectedRoute><HospitalDetails /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
