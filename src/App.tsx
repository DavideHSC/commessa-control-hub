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
import ImportPage from './pages/Import';
import Database from './pages/Database';
import ImpostazioniPage from "./pages/Impostazioni";
import RiconciliazionePage from "./pages/Riconciliazione";
import StagingPage from "./pages/Staging"; // Importo la nuova pagina
import ConfigurazioneContiPage from "./pages/impostazioni/ConfigurazioneConti";
import VociAnalitichePage from "./pages/impostazioni/VociAnalitiche";
import RegoleRipartizionePage from "./pages/impostazioni/RegoleRipartizione";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/commesse" element={<Commesse />} />
            <Route path="/commesse/:id" element={<CommessaDettaglio />} />
            <Route path="/prima-nota" element={<PrimaNota />} />
            <Route path="/prima-nota/nuova" element={<NuovaRegistrazionePrimaNota />} />
            <Route path="/prima-nota/modifica/:id" element={<NuovaRegistrazionePrimaNota />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/database" element={<Database />} />
            <Route path="/database/staging" element={<StagingPage />} /> {/* Aggiungo la nuova rotta */}
            <Route path="/impostazioni" element={<ImpostazioniPage />} />
            <Route path="/impostazioni/conti" element={<ConfigurazioneContiPage />} />
            <Route path="/impostazioni/voci-analitiche" element={<VociAnalitichePage />} />
            <Route path="/impostazioni/regole-ripartizione" element={<RegoleRipartizionePage />} />
            <Route path="/riconciliazione" element={<RiconciliazionePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
