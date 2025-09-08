import { useState } from 'react';
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
  TestTube
} from 'lucide-react';

// Importazione componenti sezioni
import { AnagraficheResolutionSection } from '../components/AnagraficheResolutionSection';
import { RigheAggregationSection } from '../components/RigheAggregationSection';
import { AllocationStatusSection } from '../components/AllocationStatusSection';
import { UserPresentationSection } from '../components/UserPresentationSection';
import { AllocationWorkflowSection } from '../components/AllocationWorkflowSection';
import { BusinessValidationSection } from '../components/BusinessValidationSection';

const SECTIONS = [
  {
    id: 'anagrafiche',
    title: 'A. Risoluzione Anagrafica',
    description: 'Interpreta dati staging per risolvere clienti/fornitori senza creare entità fake',
    icon: Users,
    color: 'bg-blue-500',
    status: 'ready'
  },
  {
    id: 'aggregazione',
    title: 'B. Aggregazione Righe Contabili', 
    description: 'Aggrega righe contabili staging per formare scritture virtuali complete',
    icon: FileText,
    color: 'bg-green-500',
    status: 'ready'
  },
  {
    id: 'allocazioni',
    title: 'C. Calcolo Stato Allocazione',
    description: 'Calcola percentuali allocazione da staging senza finalizzare',
    icon: PieChart,
    color: 'bg-yellow-500',
    status: 'ready'
  },
  {
    id: 'presentazione',
    title: 'D. Presentazione Utente',
    description: 'Trasforma dati staging in rappresentazione user-friendly',
    icon: Eye,
    color: 'bg-purple-500',
    status: 'ready'
  },
  {
    id: 'workflow',
    title: 'E. Test Workflow Allocazione',
    description: 'Simula workflow manuale di allocazione su staging data',
    icon: Settings,
    color: 'bg-orange-500',
    status: 'ready'
  },
  {
    id: 'validazioni',
    title: 'F. Test Validazione Business',
    description: 'Applica validazioni business sui dati staging',
    icon: CheckCircle,
    color: 'bg-red-500',
    status: 'ready'
  }
] as const;

export const StagingAnalysisPage = () => {
  const [activeSection, setActiveSection] = useState<string>('anagrafiche');
  const [globalRefresh, setGlobalRefresh] = useState(0);

  const handleGlobalRefresh = () => {
    setGlobalRefresh(prev => prev + 1);
  };

  const activeTab = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <TestTube className="inline-block mr-3 text-blue-600" size={32} />
              Staging Analysis - Sistema Interpretativo
            </h1>
            <p className="text-gray-600 text-lg">
              Testing della nuova architettura staging-first con logica interpretativa
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
              Refresh All
            </Button>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Database size={14} className="mr-1" />
              Sistema Isolato
            </Badge>
          </div>
        </div>
      </div>

      {/* Alert informativo */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Ambiente di Test Separato:</strong> Questo sistema lavora direttamente sui dati staging con logica interpretativa. 
          Zero impatto sul sistema esistente - completamente isolato per testing sicuro della nuova architettura.
        </AlertDescription>
      </Alert>

      {/* Sezioni Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
      <Card className="mb-6">
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
            <AnagraficheResolutionSection refreshTrigger={globalRefresh} />
          )}
          {activeSection === 'aggregazione' && (
            <RigheAggregationSection refreshTrigger={globalRefresh} />
          )}
          {activeSection === 'allocazioni' && (
            <AllocationStatusSection refreshTrigger={globalRefresh} />
          )}
          {activeSection === 'presentazione' && (
            <UserPresentationSection refreshTrigger={globalRefresh} />
          )}
          {activeSection === 'workflow' && (
            <AllocationWorkflowSection refreshTrigger={globalRefresh} />
          )}
          {activeSection === 'validazioni' && (
            <BusinessValidationSection refreshTrigger={globalRefresh} />
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
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