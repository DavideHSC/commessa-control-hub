
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Commesse from "./pages/Commesse";
import CommessaDettaglio from "./pages/CommessaDettaglio";
import NuovaCommessa from "./pages/NuovaCommessa";
import PrimaNota from "./pages/PrimaNota";
import NuovaRegistrazionePrimaNota from "./pages/NuovaRegistrazionePrimaNota";
import Report from "./pages/Report";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/commesse" element={<Layout><Commesse /></Layout>} />
          <Route path="/commesse/nuova" element={<Layout><NuovaCommessa /></Layout>} />
          <Route path="/commesse/:id" element={<Layout><CommessaDettaglio /></Layout>} />
          <Route path="/prima-nota" element={<Layout><PrimaNota /></Layout>} />
          <Route path="/prima-nota/nuova" element={<Layout><NuovaRegistrazionePrimaNota /></Layout>} />
          <Route path="/report" element={<Layout><Report /></Layout>} />
          <Route path="/impostazioni" element={<Layout><div className="p-8 text-center"><h1 className="text-2xl font-bold">Impostazioni</h1><p className="text-slate-600 mt-2">Sezione in sviluppo</p></div></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
