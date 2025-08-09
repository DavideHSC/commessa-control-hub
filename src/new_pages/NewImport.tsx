// Percorso: src/new_pages/NewImport.tsx (o dove si trova ora)
// VERSIONE DEFINITIVA - 2025-08-09

import { useState, useMemo } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { useImportScritture } from '../new_hooks/useImportScritture';
import { useImportPianoDeiConti } from '../new_hooks/useImportPianoDeiConti';

// Componenti UI
import { Button } from '../new_components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../new_components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../new_components/ui/Select';
import { Alert, AlertDescription } from '../new_components/ui/Alert';
import { FileUploader } from '../new_components/ui/file-uploader';
import { ScrollArea } from '../components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '../components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

// Tipi
interface ScrittureImportFiles {
  pntesta: File;
  pnrigcon: File;
  pnrigiva?: File;
  movanac?: File;
}

const IMPORT_TYPES = [
  { value: 'scritture', label: 'Scritture Contabili', disabled: false },
  { value: 'piano-conti', label: 'Piano dei Conti', disabled: false },
  { value: 'anagrafiche', label: 'Anagrafiche Clienti/Fornitori', disabled: true },
];

// Componente Principale
export const NewImport = () => {
  // Hook per i diversi workflow
  const scrittureWorkflow = useImportScritture();
  const pianoContiWorkflow = useImportPianoDeiConti();
  
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [selectedType, setSelectedType] = useState<string>('scritture');

  // Determina quale workflow è attivo
  const activeWorkflow = selectedType === 'piano-conti' ? pianoContiWorkflow : scrittureWorkflow;

  const handleFilesSelected = (files: File[]) => {
    // Scritture contabili accettano multipli file, piano dei conti solo uno
    if (selectedType === 'piano-conti' && files.length > 1) {
      alert('Il Piano dei Conti accetta solo un singolo file');
      return;
    }
    setFilesToUpload(files);
  };

  const handleStartImport = () => {
    if (filesToUpload.length === 0) return;

    switch (selectedType) {
      case 'scritture':
        // Logica per scritture contabili (file multipli)
        const fileMap: { [key: string]: File } = {};
        filesToUpload.forEach(file => {
          const fileName = file.name.toLowerCase().replace('.txt', '');
          if (['pntesta', 'pnrigcon', 'pnrigiva', 'movanac'].includes(fileName)) {
            fileMap[fileName] = file;
          }
        });

        if (!fileMap.pntesta || !fileMap.pnrigcon) {
          alert('File obbligatori mancanti: PNTESTA.TXT e PNRIGCON.TXT');
          return;
        }
        scrittureWorkflow.startImport(fileMap as unknown as ScrittureImportFiles);
        break;

      case 'piano-conti':
        // Logica per piano dei conti (singolo file)
        if (filesToUpload.length !== 1) {
          alert('Seleziona esattamente un file per il Piano dei Conti');
          return;
        }
        pianoContiWorkflow.startImport(filesToUpload[0]);
        break;

      default:
        alert('Tipo di importazione non ancora supportato');
    }
  };

  const isOperationInProgress = activeWorkflow.status === 'uploading' || activeWorkflow.status === 'polling';

  const renderContent = () => {
    // --- Stato 1: In Attesa (IDLE) ---
    if (activeWorkflow.status === 'idle') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2"><Upload className="w-5 h-5" /><span>Configurazione Import</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tipo di Tracciato</label>
              <Select value={selectedType} onValueChange={(value) => {
                setSelectedType(value);
                setFilesToUpload([]); // Reset files when changing type
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {IMPORT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value} disabled={type.disabled}>
                      {type.label} {type.disabled && "(non disponibile)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">File di Tracciato</label>
              <FileUploader onFilesUploaded={handleFilesSelected} accept=".txt,.TXT" multiple={selectedType === 'scritture'} disabled={false} className="min-h-32">
                <div className="text-center p-4">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <h3 className="text-base font-semibold text-gray-900">Carica File</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedType === 'scritture' 
                      ? 'Trascina qui i file .txt o clicca per selezionare (multipli file)'
                      : 'Trascina qui il file .txt o clicca per selezionare (un singolo file)'
                    }
                  </p>
                </div>
              </FileUploader>
              {filesToUpload.length > 0 && (
                 <div className="text-sm text-gray-600 pt-2">
                   <strong>File selezionati:</strong> {filesToUpload.map(f => f.name).join(', ')}
                 </div>
              )}
            </div>
            <Button onClick={handleStartImport} disabled={filesToUpload.length === 0 || (selectedType === 'scritture' && filesToUpload.length < 2)} className="w-full">
              Avvia Importazione
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    // --- Stato 2: In Corso (UPLOADING / POLLING) ---
    if (isOperationInProgress) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="animate-spin" />
              <span>Importazione in corso...</span>
            </CardTitle>
            <CardDescription>Il sistema sta elaborando i file. Monitora il progresso qui sotto.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72 w-full border rounded-md p-4">
              {selectedType === 'scritture' ? (
                // Per scritture mostra gli eventi di progress
                'progress' in activeWorkflow && activeWorkflow.progress.length === 0 
                  ? <p className="text-sm text-muted-foreground">In attesa di eventi dal server...</p>
                  : 'progress' in activeWorkflow && activeWorkflow.progress.map((event, index) => (
                      <div key={index} className="text-sm flex items-center gap-2">
                        <span className="text-muted-foreground">[{new Date(event.timestamp).toLocaleTimeString()}]</span>
                        <span>{event.message}</span>
                      </div>
                    ))
              ) : (
                // Per piano dei conti mostra solo un messaggio generico
                <p className="text-sm text-muted-foreground">Elaborazione in corso...</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      );
    }

    // --- Stato 3: Finito (COMPLETED / FAILED) ---
    return (
        <Card>
           <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${activeWorkflow.status === 'completed' ? 'text-green-600' : 'text-destructive'}`}>
              {activeWorkflow.status === 'completed' ? <CheckCircle /> : <AlertCircle />}
              {activeWorkflow.status === 'completed' ? 'Importazione Completata' : 'Importazione Fallita'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeWorkflow.error && <Alert variant="destructive"><AlertDescription>{activeWorkflow.error}</AlertDescription></Alert>}
            
            {'validationErrors' in activeWorkflow && activeWorkflow.validationErrors.length > 0 && (
               <div className="space-y-2">
                <h4 className="font-medium">Errori di Validazione Dettagliati:</h4>
                <div className="border rounded-md max-h-60 overflow-y-auto">
                  <Table><TableHeader><TableRow><TableHead>Campo/Riga</TableHead><TableHead>Messaggio</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {'validationErrors' in activeWorkflow && activeWorkflow.validationErrors.map((err, i) => <TableRow key={i}><TableCell>{err.row ? `Riga ${err.row}`:err.field}</TableCell><TableCell>{err.message}</TableCell></TableRow>)}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {activeWorkflow.status === 'completed' && activeWorkflow.report && (
              <div className="space-y-2">
                <h4 className="font-medium">Report Dettagliato:</h4>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="stats"><AccordionTrigger>Statistiche</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-5 text-sm">
                        {selectedType === 'piano-conti' ? (
                          // Piano dei Conti - report semplice
                          Object.entries(activeWorkflow.report).map(([key, value]) => <li key={key}>{key}: <strong>{String(value)}</strong></li>)
                        ) : (
                          // Scritture Contabili - report complesso
                          'stats' in activeWorkflow.report && Object.entries(activeWorkflow.report.stats || {}).map(([key, value]) => <li key={key}>{key}: <strong>{String(value)}</strong></li>)
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {/* Sezioni specifiche per Scritture Contabili */}
                  {selectedType === 'scritture' && 'entitiesCreated' in activeWorkflow.report && activeWorkflow.report.entitiesCreated?.contiCreati?.count > 0 && (
                    <AccordionItem value="conti"><AccordionTrigger>Conti Trovati ({activeWorkflow.report.entitiesCreated.contiCreati.count})</AccordionTrigger>
                      <AccordionContent>
                        <Table><TableHeader><TableRow><TableHead>Codice</TableHead><TableHead>Nome</TableHead></TableRow></TableHeader>
                          <TableBody>{activeWorkflow.report.entitiesCreated.contiCreati.sample?.map((item:any, i:number) => <TableRow key={i}><TableCell>{item.codice}</TableCell><TableCell>{item.nome}</TableCell></TableRow>)}</TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {selectedType === 'scritture' && 'entitiesCreated' in activeWorkflow.report && activeWorkflow.report.entitiesCreated?.anagraficheCreati?.count > 0 && (
                    <AccordionItem value="anagrafiche"><AccordionTrigger>Anagrafiche Trovate ({activeWorkflow.report.entitiesCreated.anagraficheCreati.count})</AccordionTrigger>
                      <AccordionContent>
                        <Table><TableHeader><TableRow><TableHead>Codice</TableHead><TableHead>Nome</TableHead></TableRow></TableHeader>
                          <TableBody>{activeWorkflow.report.entitiesCreated.anagraficheCreati.sample?.map((item:any, i:number) => <TableRow key={i}><TableCell>{item.codice}</TableCell><TableCell>{item.nome}</TableCell></TableRow>)}</TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>
            )}
            
             <div className="space-y-2">
              <h4 className="font-medium">Log Finale:</h4>
              <ScrollArea className="h-40 w-full border rounded-md p-4">
                {selectedType === 'scritture' && 'progress' in activeWorkflow ? (
                  activeWorkflow.progress.map((event, index) => (
                    <div key={index} className="text-sm flex items-center gap-2">
                      <span className="text-muted-foreground">[{new Date(event.timestamp).toLocaleTimeString()}]</span>
                      <span className={`${event.level === 'ERROR' ? 'text-destructive font-semibold' : ''}`}>{event.message}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {activeWorkflow.status === 'completed' 
                      ? 'Importazione completata con successo' 
                      : 'Importazione terminata con errori'
                    }
                  </p>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Importazione Dati</h1>
          <p className="text-sm text-gray-500">Importa i dati dai tracciati del gestionale.</p>
        </div>
        {(activeWorkflow.status === 'completed' || activeWorkflow.status === 'failed') && (
          <Button variant="outline" onClick={() => {
            activeWorkflow.reset();
            setFilesToUpload([]);
          }}>
            <X className="w-4 h-4 mr-2" />
            Esegui un altro import
          </Button>
        )}
      </div>
      
      {renderContent()}

    </div>
  );
};

export default NewImport;