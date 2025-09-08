import { useState, useEffect, useCallback, useMemo } from 'react';
import { Settings, Plus, Edit, Trash2, Database, Target, ListTree, RefreshCw } from 'lucide-react';
import { Button } from '../new_components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../new_components/ui/Card';
import { UnifiedTable } from '../new_components/tables/UnifiedTable';
import { Alert, AlertDescription } from '../new_components/ui/Alert';
import { ConfirmDialog } from '../new_components/dialogs/ConfirmDialog';
import { useToast } from '../hooks/use-toast';
import { resetDatabase, cleanupStaging } from '../api';
import { VoceAnaliticaDialog } from '../new_components/dialogs/VoceAnaliticaDialog';
import { RegolaRipartizioneDialog } from '../new_components/dialogs/RegolaRipartizioneDialog';

interface VoceAnalitica {
  id: string;
  nome: string;
  descrizione?: string;
  tipo: 'costo' | 'ricavo';
  isAttiva: boolean;
  // Nota: createdAt non esiste nel modello del database per VoceAnalitica
}

interface RegolaRipartizione {
  id: string;
  descrizione: string;
  commessaId: string;
  percentuale: number;
  contoId: string;
  voceAnaliticaId: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  commessa?: {
    id: string;
    nome: string;
  };
  conto?: {
    id: string;
    nome: string;
  };
  voceAnalitica?: {
    id: string;
    nome: string;
  };
}

type SettingSection = 'voci-analitiche' | 'regole-ripartizione' | 'sistema';

export const NewSettings = () => {
  const [activeSection, setActiveSection] = useState<SettingSection>('voci-analitiche');
  const [vociAnalitiche, setVociAnalitiche] = useState<VoceAnalitica[]>([]);
  const [regoleRipartizione, setRegoleRipartizione] = useState<RegolaRipartizione[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResettingDatabase, setIsResettingDatabase] = useState(false);
  const [isCleaningStaging, setIsCleaningStaging] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);
  const [showVoceAnaliticaDialog, setShowVoceAnaliticaDialog] = useState(false);
  const [editingVoceAnalitica, setEditingVoceAnalitica] = useState<VoceAnalitica | undefined>(undefined);
  const [isSavingVoceAnalitica, setIsSavingVoceAnalitica] = useState(false);
  const [showRegolaRipartizioneDialog, setShowRegolaRipartizioneDialog] = useState(false);
  const [editingRegolaRipartizione, setEditingRegolaRipartizione] = useState<RegolaRipartizione | undefined>(undefined);
  const [isSavingRegolaRipartizione, setIsSavingRegolaRipartizione] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [deletingItemName, setDeletingItemName] = useState<string>('');
  const { toast } = useToast();

  const settingSections = [
    {
      key: 'voci-analitiche' as const,
      title: 'Voci Analitiche',
      description: 'Gestisci le voci analitiche per l\'allocazione dei costi',
      icon: ListTree,
      count: vociAnalitiche.length
    },
    {
      key: 'regole-ripartizione' as const,
      title: 'Regole di Ripartizione',
      description: 'Configura regole automatiche per l\'allocazione',
      icon: Target,
      count: regoleRipartizione.length
    },
    {
      key: 'sistema' as const,
      title: 'Operazioni Sistema',
      description: 'Operazioni di manutenzione del database',
      icon: Database,
      count: null
    }
  ];

  // Fetch data based on active section
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeSection === 'voci-analitiche') {
        const response = await fetch('/api/voci-analitiche');
        if (response.ok) {
          const data = await response.json();
          const voci = Array.isArray(data) ? data : data.data || [];
          setVociAnalitiche(voci);
        }
      } else if (activeSection === 'regole-ripartizione') {
        const response = await fetch('/api/regole-ripartizione');
        if (response.ok) {
          const data = await response.json();
          setRegoleRipartizione(Array.isArray(data) ? data : data.data || []);
        }
      }
    } catch (err) {
      setError(`Errore nel caricamento dati: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`);
    } finally {
      setLoading(false);
    }
  }, [activeSection]);

  // Load data when section changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle section change
  const handleSectionChange = useCallback((section: SettingSection) => {
    setActiveSection(section);
  }, []);

  // Handle system operations
  const confirmResetDatabase = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const handleResetDatabase = useCallback(async () => {
    setIsResettingDatabase(true);
    setError(null);

    try {
      const result = await resetDatabase();
      toast({
        title: "Successo",
        description: result.message,
      });
      
      // Refresh data after reset
      if (activeSection !== 'sistema') {
        fetchData();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossibile resettare il database.";
      setError(`Errore Reset Database: ${errorMessage}`);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsResettingDatabase(false);
    }
  }, [activeSection, fetchData, toast]);

  const confirmCleanupStaging = useCallback(() => {
    setShowCleanupConfirm(true);
  }, []);

  const handleCleanupStaging = useCallback(async () => {
    setIsCleaningStaging(true);
    setError(null);

    try {
      const result = await cleanupStaging();
      toast({
        title: "Successo",
        description: result.message,
      });
      
      // Refresh data after cleanup if needed
      if (activeSection !== 'sistema') {
        fetchData();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossibile pulire le tabelle staging.";
      setError(`Errore Cleanup Staging: ${errorMessage}`);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCleaningStaging(false);
    }
  }, [activeSection, fetchData, toast]);

  // Handle CRUD operations
  const handleCreate = useCallback(() => {
    console.log(`Create new ${activeSection}`);
    if (activeSection === 'voci-analitiche') {
      setEditingVoceAnalitica(undefined);
      setShowVoceAnaliticaDialog(true);
    } else if (activeSection === 'regole-ripartizione') {
      setEditingRegolaRipartizione(undefined);
      setShowRegolaRipartizioneDialog(true);
    } else {
      console.log(`Create dialog not implemented for ${activeSection}`);
    }
  }, [activeSection]);

  const handleEdit = useCallback((item: unknown) => {
    if (activeSection === 'voci-analitiche') {
      const voceAnalitica = item as VoceAnalitica;
      setEditingVoceAnalitica(voceAnalitica);
      setShowVoceAnaliticaDialog(true);
    } else if (activeSection === 'regole-ripartizione') {
      const regolaRipartizione = item as RegolaRipartizione;
      setEditingRegolaRipartizione(regolaRipartizione);
      setShowRegolaRipartizioneDialog(true);
    } else {
      console.log(`Edit dialog not implemented for ${activeSection}`);
    }
  }, [activeSection]);

  const handleDelete = useCallback((id: string) => {
    // Find the item by id based on current section
    let item: any = null;
    let itemName = `elemento con ID ${id}`;
    
    if (activeSection === 'voci-analitiche') {
      item = vociAnalitiche.find(v => v.id === id);
      itemName = item?.nome || itemName;
    } else if (activeSection === 'regole-ripartizione') {
      item = regoleRipartizione.find(r => r.id === id);
      itemName = item?.descrizione || itemName;
    }
    
    setDeletingItemId(id);
    setDeletingItemName(itemName);
    setShowDeleteConfirm(true);
  }, [activeSection, vociAnalitiche, regoleRipartizione]);

  const confirmDelete = useCallback(async () => {
    if (!deletingItemId) return;

    try {
      const endpoint = activeSection === 'voci-analitiche' ? '/api/voci-analitiche' : '/api/regole-ripartizione';
      const response = await fetch(`${endpoint}/${deletingItemId}`, { method: 'DELETE' });
      
      if (response.ok) {
        toast({
          title: "Successo",
          description: `${deletingItemName} è stato eliminato con successo.`,
        });
        fetchData(); // Refresh data
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }));
        throw new Error(errorData.error || 'Errore durante l\'eliminazione');
      }
    } catch (err) {
      console.error('Delete error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Errore di connessione durante l\'eliminazione';
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
      setDeletingItemId(null);
      setDeletingItemName('');
    }
  }, [activeSection, deletingItemId, deletingItemName, fetchData, toast]);

  // Handle save voce analitica
  const handleSaveVoceAnalitica = useCallback(async (data: { nome: string; descrizione?: string; tipo: 'costo' | 'ricavo' }) => {
    setIsSavingVoceAnalitica(true);
    setError(null);

    try {
      const url = editingVoceAnalitica 
        ? `/api/voci-analitiche/${editingVoceAnalitica.id}`
        : '/api/voci-analitiche';
      
      const method = editingVoceAnalitica ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Successo",
          description: editingVoceAnalitica 
            ? "Voce analitica modificata con successo."
            : "Voce analitica creata con successo.",
        });
        
        setShowVoceAnaliticaDialog(false);
        setEditingVoceAnalitica(undefined);
        fetchData(); // Refresh data
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }));
        throw new Error(errorData.error || 'Errore durante il salvataggio');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossibile salvare la voce analitica.";
      setError(`Errore Salvataggio: ${errorMessage}`);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSavingVoceAnalitica(false);
    }
  }, [editingVoceAnalitica, fetchData, toast]);

  // Handle save regola ripartizione
  const handleSaveRegolaRipartizione = useCallback(async (data: { 
    descrizione: string; 
    commessaId: string; 
    percentuale: number; 
    contoId: string; 
    voceAnaliticaId: string 
  }) => {
    setIsSavingRegolaRipartizione(true);
    setError(null);

    try {
      const url = editingRegolaRipartizione 
        ? `/api/regole-ripartizione/${editingRegolaRipartizione.id}`
        : '/api/regole-ripartizione';
      
      const method = editingRegolaRipartizione ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Successo",
          description: editingRegolaRipartizione 
            ? "Regola di ripartizione modificata con successo."
            : "Regola di ripartizione creata con successo.",
        });
        
        setShowRegolaRipartizioneDialog(false);
        setEditingRegolaRipartizione(undefined);
        fetchData(); // Refresh data
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }));
        throw new Error(errorData.error || 'Errore durante il salvataggio');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossibile salvare la regola di ripartizione.";
      setError(`Errore Salvataggio: ${errorMessage}`);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSavingRegolaRipartizione(false);
    }
  }, [editingRegolaRipartizione, fetchData, toast]);

  // Table columns for voci analitiche
  const vociAnaliticheColumns = useMemo(() => [
    { key: 'nome', header: 'Nome', sortable: true },
    { key: 'descrizione', header: 'Descrizione', sortable: true },
    { 
      key: 'tipo', 
      header: 'Tipo',
      render: (tipo: unknown) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          tipo === 'costo' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {String(tipo).charAt(0).toUpperCase() + String(tipo).slice(1)}
        </span>
      )
    },
    { 
      key: 'isAttiva', 
      header: 'Stato',
      render: (isAttiva: unknown) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          isAttiva ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {isAttiva ? 'Attiva' : 'Inattiva'}
        </span>
      )
    }
    // Nota: createdAt rimosso perché non esiste nel modello VoceAnalitica
  ], []);

  // Table columns for regole ripartizione
  const regoleRipartizioneColumns = useMemo(() => [
    { key: 'descrizione', header: 'Descrizione', sortable: true },
    { 
      key: 'commessa', 
      header: 'Commessa',
      render: (commessa: any) => commessa?.nome || '-'
    },
    { 
      key: 'conto', 
      header: 'Conto',
      render: (conto: any) => conto?.nome || '-'
    },
    { 
      key: 'voceAnalitica', 
      header: 'Voce Analitica',
      render: (voceAnalitica: any) => voceAnalitica?.nome || '-'
    },
    { 
      key: 'percentuale', 
      header: 'Percentuale',
      render: (percentuale: unknown) => `${Number(percentuale)}%`
    },
    { 
      key: 'createdAt', 
      header: 'Creata',
      render: (value: unknown) => {
        if (!value) return '-';
        
        const date = new Date(String(value));
        if (isNaN(date.getTime())) return '-';
        
        return date.toLocaleDateString('it-IT');
      }
    }
  ], []);

  const currentSection = settingSections.find(s => s.key === activeSection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Impostazioni</h1>
          <p className="text-gray-500">Configurazioni di sistema e parametri business</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Menu */}
        <div className="space-y-2">
          {settingSections.map((section) => (
            <div
              key={section.key}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                activeSection === section.key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => handleSectionChange(section.key)}
            >
              <div className="flex items-center space-x-3">
                <section.icon className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  {section.count !== null && (
                    <p className="text-sm text-gray-500">{section.count} elementi</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Active Section Content */}
        <div className="lg:col-span-3">
          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {currentSection && <currentSection.icon className="w-6 h-6 text-blue-600" />}
                  <div>
                    <CardTitle>{currentSection?.title}</CardTitle>
                    <p className="text-sm text-gray-500">{currentSection?.description}</p>
                  </div>
                </div>
                
                {/* Pulsanti specifici per sezione */}
                {(activeSection === 'voci-analitiche' || activeSection === 'regole-ripartizione') && (
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={fetchData} disabled={loading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Aggiorna
                    </Button>
                    <Button onClick={handleCreate}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nuovo
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {activeSection === 'voci-analitiche' && (
                <UnifiedTable
                  data={vociAnalitiche as unknown as Record<string, unknown>[]}
                  columns={vociAnaliticheColumns}
                  onEdit={(row) => handleEdit(row as any)}
                  onDelete={(id) => handleDelete(id)}
                  loading={loading}
                  searchable={true}
                  paginated={true}
                  emptyMessage="Nessuna voce analitica configurata"
                  showActions={true}
                />
              )}

              {activeSection === 'regole-ripartizione' && (
                <UnifiedTable
                  data={regoleRipartizione as unknown as Record<string, unknown>[]}
                  columns={regoleRipartizioneColumns}
                  onEdit={(row) => handleEdit(row as any)}
                  onDelete={(id) => handleDelete(id)}
                  loading={loading}
                  searchable={true}
                  paginated={true}
                  emptyMessage="Nessuna regola di ripartizione configurata"
                  showActions={true}
                />
              )}

              {activeSection === 'sistema' && (
                <div className="space-y-4">
                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Operazioni Sistema</strong><br/>
                      Funzionalità di manutenzione del database e operazioni di sistema.
                      Attenzione: queste operazioni possono influire sui dati esistenti.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Reset Database</h4>
                            <p className="text-sm text-gray-500">Cancella TUTTO il database e ripopola SOLO i dati di produzione</p>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={confirmResetDatabase}
                            disabled={isResettingDatabase}
                            className="bg-red-50 border-red-200 hover:bg-red-100 text-red-700"
                          >
                            {isResettingDatabase ? 'Reset in corso...' : 'Reset DB'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Cleanup Staging</h4>
                            <p className="text-sm text-gray-500">Cancella SOLO le tabelle staging (mantiene intatti i dati di produzione)</p>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={confirmCleanupStaging}
                            disabled={isCleaningStaging}
                            className="bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700"
                          >
                            {isCleaningStaging ? 'Cleanup in corso...' : 'Cleanup'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialoghi di Conferma */}
      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Reset Database"
        description="⚠️ ATTENZIONE: Questa operazione cancellerà TUTTO il database e ripopolerà SOLO i dati di produzione.\n\nQuesta azione è irreversibile. Sei sicuro di voler continuare?"
        type="warning"
        confirmText="Sì, procedi con il reset"
        confirmVariant="destructive"
        onConfirm={handleResetDatabase}
      />

      <ConfirmDialog
        open={showCleanupConfirm}
        onOpenChange={setShowCleanupConfirm}
        title="Cleanup Staging"
        description="⚠️ ATTENZIONE: Questa operazione cancellerà SOLO le tabelle staging (i dati di produzione rimarranno intatti).\n\nQuesta azione è irreversibile. Sei sicuro di voler continuare?"
        type="warning"
        confirmText="Sì, procedi con il cleanup"
        confirmVariant="destructive"
        onConfirm={handleCleanupStaging}
      />

      {/* Dialog Voce Analitica */}
      <VoceAnaliticaDialog
        open={showVoceAnaliticaDialog}
        onOpenChange={setShowVoceAnaliticaDialog}
        voce={editingVoceAnalitica}
        onSave={handleSaveVoceAnalitica}
        loading={isSavingVoceAnalitica}
      />

      {/* Dialog Regola Ripartizione */}
      <RegolaRipartizioneDialog
        open={showRegolaRipartizioneDialog}
        onOpenChange={setShowRegolaRipartizioneDialog}
        regola={editingRegolaRipartizione}
        onSave={handleSaveRegolaRipartizione}
        loading={isSavingRegolaRipartizione}
      />

      {/* Dialog Conferma Eliminazione */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Conferma Eliminazione"
        description={`Sei sicuro di voler eliminare "${deletingItemName}"?\n\nQuesta azione è irreversibile.`}
        type="warning"
        confirmText="Sì, elimina"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
};