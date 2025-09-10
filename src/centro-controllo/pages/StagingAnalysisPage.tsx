import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../new_components/ui/Card';
import { Button } from '../../new_components/ui/Button';
import { Badge } from '../../new_components/ui/Badge';
import { Alert, AlertDescription } from '../../new_components/ui/Alert';
import { 
  Users, 
  FileText, 
  PieChart, 
  Eye, 
  Settings, 
  CheckCircle,
  RefreshCw,
  Database,
  BarChart3,
  Lightbulb
} from 'lucide-react';

// Importazione componenti sezioni
import { AnagraficheResolutionSection } from '../components/AnagraficheResolutionSection';
import { AnagrafichePreviewSection } from '../components/AnagrafichePreviewSection';
import { AllocationStatusSection } from '../components/AllocationStatusSection';
import { AllocationWorkflowSection } from '../components/AllocationWorkflowSection';
import { BusinessValidationSection } from '../components/BusinessValidationSection';
import { AutoAllocationSuggestionsSection } from '../components/AutoAllocationSuggestionsSection';
import { MovimentiContabiliSection } from '../components/MovimentiContabiliSection';
import { TemplateManagementSection } from '../components/TemplateManagementSection';

const SECTIONS = [
  // Prima riga - Sezioni principali operative
  {
    id: 'movimenti',
    title: 'A. Movimenti Contabili Completi',
    description: 'Prima nota digitale con interfaccia tipo gestionale tradizionale',
    icon: Database,
    color: 'bg-pink-500',
    status: 'pronto'
  },
  {
    id: 'workflow',
    title: 'B. Workflow Allocazione',
    description: 'Gestione workflow manuale di allocazione e controllo operativo',
    icon: Settings,
    color: 'bg-orange-500',
    status: 'pronto'
  },
  {
    id: 'templates',
    title: 'C. Gestione Template Parsing',
    description: 'Configurazione template per il parsing dei file di importazione',
    icon: Settings,
    color: 'bg-indigo-500',
    status: 'pronto'
  },
  
  // Seconda riga - Analisi dati base
  {
    id: 'anagrafiche',
    title: 'D. Gestione Anagrafica',
    description: 'Gestione completa di clienti e fornitori con risoluzione automatica',
    icon: Users,
    color: 'bg-blue-500',
    status: 'pronto'
  },
  {
    id: 'allocazioni',
    title: 'E. Controllo Allocazioni',
    description: 'Monitoraggio e calcolo percentuali allocazione in tempo reale',
    icon: PieChart,
    color: 'bg-yellow-500',
    status: 'pronto'
  },
  {
    id: 'validazioni',
    title: 'F. Validazione Business',
    description: 'Controllo automatico regole business e integrità dati',
    icon: CheckCircle,
    color: 'bg-red-500',
    status: 'pronto'
  },
  
  // Terza riga - Suggerimenti intelligenti (centrata)
  {
    id: 'suggerimenti',
    title: 'G. Suggerimenti Intelligenti',
    description: 'Sistema di intelligenza artificiale per ottimizzazione automatica',
    icon: Lightbulb,
    color: 'bg-yellow-500',
    status: 'pronto'
  }
] as const;

export const StagingAnalysisPage = () => {
  const [activeSection, setActiveSection] = useState<string>('movimenti');
  const [globalRefresh, setGlobalRefresh] = useState(0);

  const handleGlobalRefresh = () => {
    setGlobalRefresh(prev => prev + 1);
  };

  const activeTab = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <BarChart3 className="inline-block mr-3 text-blue-600" size={32} />
              Centro di Controllo Gestionale
            </h1>
            <p className="text-gray-600 text-lg">
              Gestione completa dei flussi operativi e analisi in tempo reale
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleGlobalRefresh}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Aggiorna Tutti
            </Button>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <BarChart3 size={14} className="mr-1" />
              Operativo
            </Badge>
          </div>
        </div>
      </div>

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <BarChart3 className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Centro di Controllo Gestionale:</strong> Sistema operativo per la gestione avanzata delle commesse con funzionalità integrate per l'analisi, il controllo e l'ottimizzazione dei processi aziendali.
        </AlertDescription>
      </Alert>

      {/* Sezioni Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map((section) => {
          const IconComponent = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <Card 
              key={section.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${section.color} text-white`}>
                    <IconComponent size={20} />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-700 text-xs"
                  >
                    {section.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-sm mb-2">{section.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {section.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sezione Attiva */}
      <Card>
        <CardHeader className="border-b bg-gray-50">
          <div className="flex items-center gap-3">
            {activeTab && (
              <div className={`p-2 rounded-lg ${activeTab.color} text-white`}>
                <activeTab.icon size={24} />
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{activeTab?.title}</CardTitle>
              <p className="text-gray-600 mt-1">{activeTab?.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Contenuto della sezione attiva */}
          {activeSection === 'anagrafiche' && (
            <div className="space-y-6">
              <AnagraficheResolutionSection refreshTrigger={globalRefresh} />
              <AnagrafichePreviewSection refreshTrigger={globalRefresh} />
            </div>
          )}
          {activeSection === 'allocazioni' && (
            <AllocationStatusSection refreshTrigger={globalRefresh} />
          )}
          {activeSection === 'workflow' && (
            <AllocationWorkflowSection refreshTrigger={globalRefresh} />
          )}
          {activeSection === 'validazioni' && (
            <BusinessValidationSection refreshTrigger={globalRefresh} />
          )}
          {activeSection === 'suggerimenti' && (
            <AutoAllocationSuggestionsSection refreshTrigger={globalRefresh} />
          )}
          {activeSection === 'movimenti' && (
            <MovimentiContabiliSection refreshTrigger={globalRefresh} />
          )}
          {activeSection === 'templates' && (
            <TemplateManagementSection refreshTrigger={globalRefresh} />
          )}
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database size={20} className="text-blue-600" />
            Navigazione Rapida Sezioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-2">
            {SECTIONS.map((section) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-center gap-2 text-xs"
                >
                  <IconComponent size={14} />
                  {section.title.split('.')[0]}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};