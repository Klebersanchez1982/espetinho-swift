import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRestaurantStore } from "@/store/restaurant-store";
import RoleSelect from "@/components/RoleSelect";
import AppHeader from "@/components/AppHeader";
import GarcomPage from "@/pages/GarcomPage";
import AssadorPage from "@/pages/AssadorPage";
import CaixaPage from "@/pages/CaixaPage";
import EstoquePage from "@/pages/EstoquePage";
import CardapioPage from "@/pages/CardapioPage";

const queryClient = new QueryClient();

const MainApp = () => {
  const role = useRestaurantStore((s) => s.role);

  if (!role) return <RoleSelect />;

  return (
    <div className="min-h-screen">
      <AppHeader />
      {role === 'garcom' && <GarcomPage />}
      {role === 'assador' && <AssadorPage />}
      {role === 'caixa' && <CaixaPage />}
      {role === 'caixa' && <EstoquePage />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/cardapio" element={<CardapioPage />} />
          <Route path="*" element={<MainApp />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
