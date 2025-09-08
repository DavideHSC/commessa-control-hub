import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Commesse from "./pages/Commesse";
import CommessaDettaglio from "./pages/CommessaDettaglio";
import PrimaNota from "./pages/PrimaNota";
import NuovaRegistrazionePrimaNota from "./pages/NuovaRegistrazionePrimaNota";
import NotFound from "./pages/NotFound";
// DEPRECATED V1 ROUTE - import ImportPage from './pages/Import';
import Database from './pages/Database';
import ImpostazioniPage from "./pages/Impostazioni";
import RiconciliazionePage from "./pages/Riconciliazione";
import StagingPage from "./pages/Staging"; // Importo la nuova pagina
import AuditTrailPage from "./pages/AuditTrail";
import ConfigurazioneContiPage from "./pages/impostazioni/ConfigurazioneConti";
import VociAnalitichePage from "./pages/impostazioni/VociAnalitiche";
import RegoleRipartizionePage from "./pages/impostazioni/RegoleRipartizione";

// New Layout System
import { NewLayout } from "./new_components/layout";
import { 
  NewDashboard, 
  NewImport, 
  NewStaging, 
  NewCommesse,
  NewCommessaDettaglio,
  NewDatabase, 
  NewRiconciliazione, 
  NewSettings 
} from "./new_pages";
import { CommessaProvider } from "./new_context/CommessaContext";

// Staging Analysis System
import { StagingAnalysisPage } from "./staging-analysis/pages/StagingAnalysisPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CommessaProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
        <Routes>
          {/* Default redirect to new dashboard */}
          <Route path="/" element={<Navigate to="/new/dashboard" replace />} />
          
          {/* New routes with new layout */}
          <Route path="/new" element={<NewLayout />}>
            <Route path="dashboard" element={<NewDashboard />} />
            <Route path="import" element={<NewImport />} />
            <Route path="staging" element={<NewStaging />} />
            <Route path="commesse" element={<NewCommesse />} />
            <Route path="commesse/:id" element={<NewCommessaDettaglio />} />
            <Route path="database" element={<NewDatabase />} />
            <Route path="riconciliazione" element={<NewRiconciliazione />} />
            <Route path="settings" element={<NewSettings />} />
            <Route path="staging-analysis" element={<StagingAnalysisPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
          
          {/* Old routes (backup) */}
          <Route path="/old" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="commesse" element={<Commesse />} />
            <Route path="commesse/:id" element={<CommessaDettaglio />} />
            <Route path="prima-nota" element={<PrimaNota />} />
            <Route path="prima-nota/nuova" element={<NuovaRegistrazionePrimaNota />} />
            <Route path="prima-nota/modifica/:id" element={<NuovaRegistrazionePrimaNota />} />
            {/* DEPRECATED V1 ROUTE - <Route path="import" element={<ImportPage />} /> */}
            <Route path="database" element={<Database />} />
            <Route path="staging" element={<StagingPage />} />
            <Route path="impostazioni" element={<ImpostazioniPage />} />
            <Route path="impostazioni/conti" element={<ConfigurazioneContiPage />} />
            <Route path="impostazioni/voci-analitiche" element={<VociAnalitichePage />} />
            <Route path="impostazioni/regole-ripartizione" element={<RegoleRipartizionePage />} />
            <Route path="riconciliazione" element={<RiconciliazionePage />} />
            <Route path="audit-trail" element={<AuditTrailPage />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </CommessaProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
