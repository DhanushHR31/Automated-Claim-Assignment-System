import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppSidebar from "@/components/AppSidebar";
import AIAssistant from "@/components/AIAssistant";
import Dashboard from "./pages/Dashboard";
import Claims from "./pages/Claims";
import Agents from "./pages/Agents";
import Managers from "./pages/Managers";
import Assignments from "./pages/Assignments";
import ManagerSettings from "./pages/ManagerSettings";
import Customers from "./pages/Customers";
import Hospitals from "./pages/Hospitals";
import Login from "./pages/Login";
import AgentPortal from "./pages/AgentPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 rounded-lg gradient-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/managers" element={<Managers />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/settings" element={<ManagerSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <AIAssistant />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/agent" element={<AgentPortal />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
