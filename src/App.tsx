import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Receipt, Package } from "lucide-react";

const queryClient = new QueryClient();

const CaixaArea = () => {
  const [tab, setTab] = useState<'caixa' | 'estoque'>('caixa');

  return (
    <div>
      <div className="flex gap-2 p-4 pb-0">
        <Button
          variant={tab === 'caixa' ? 'default' : 'secondary'}
          size="lg"
          onClick={() => setTab('caixa')}
          className="gap-2"
        >
          <Receipt className="h-4 w-4" /> Caixa
        </Button>
        <Button
          variant={tab === 'estoque' ? 'default' : 'secondary'}
          size="lg"
          onClick={() => setTab('estoque')}
          className="gap-2"
        >
          <Package className="h-4 w-4" /> Estoque
        </Button>
      </div>
      {tab === 'caixa' ? <CaixaPage /> : <EstoquePage />}
    </div>
  );
};

const MainApp = () => {
  const role = useRestaurantStore((s) => s.role);

  if (!role) return <RoleSelect />;

  return (
    <div className="min-h-screen">
      <AppHeader />
      {role === 'garcom' && <GarcomPage />}
      {role === 'assador' && <AssadorPage />}
      {role === 'caixa' && <CaixaArea />}
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
