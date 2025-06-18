import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Commesse from "./pages/Commesse";
import CommessaDettaglio from "./pages/CommessaDettaglio";
import PrimaNota from "./pages/PrimaNota";
import NuovaRegistrazionePrimaNota from "./pages/NuovaRegistrazionePrimaNota";
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
          <Route path="/commesse/:id" element={<Layout><CommessaDettaglio /></Layout>} />
          <Route path="/prima-nota" element={<Layout><PrimaNota /></Layout>} />
          <Route path="/prima-nota/nuova" element={<Layout><NuovaRegistrazionePrimaNota /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
