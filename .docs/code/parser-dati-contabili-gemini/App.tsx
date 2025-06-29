
import React, { useState, useCallback } from 'react';
import { FileUploader } from './components/FileUploader';
import { DataTable } from './components/DataTable';
import { parseDatiContabili } from './services/parser';
import { identifyAndValidateFiles } from './services/validator';
import type { IMovimentoCompleto, AppFile } from './types';
import { LogoIcon, ProcessIcon, AlertIcon } from './components/icons';
import { FileStatus } from './components/FileStatus';

export type FileType = 'pntesta' | 'pnrigcon' | 'pnrigiva' | 'movanac';

export const FILE_DEFINITIONS: Record<FileType, { name: string; description: string }> = {
  pntesta: { name: 'PNTESTA.TXT', description: 'Testate delle scritture contabili.' },
  pnrigcon: { name: 'PNRIGCON.TXT', description: 'Righe delle scritture contabili.' },
  pnrigiva: { name: 'PNRIGIVA.TXT', description: 'Righe IVA.' },
  movanac: { name: 'MOVANAC.TXT', description: 'Movimenti di contabilità analitica.' },
};


export default function App() {
  const [files, setFiles] = useState<Record<FileType, AppFile | null>>({
    pntesta: null,
    pnrigcon: null,
    pnrigiva: null,
    movanac: null,
  });
  
  const [validation, setValidation] = useState<Record<FileType, { status: 'missing' | 'valid' | 'invalid'; message?: string; fileName?: string }>>({
    pntesta: { status: 'missing' },
    pnrigcon: { status: 'missing' },
    pnrigiva: { status: 'missing' },
    movanac: { status: 'missing' },
  });

  const [parsedData, setParsedData] = useState<IMovimentoCompleto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((droppedFiles: FileList | null) => {
    if (!droppedFiles) return;

    setError(null);
    setParsedData([]);

    const fileReadPromises = Array.from(droppedFiles).map(file =>
        new Promise<{ file: File, content: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ file, content: e.target?.result as string });
            reader.onerror = (err) => reject({ err, file });
            reader.readAsText(file, 'ISO-8859-1');
        })
    );

    Promise.all(fileReadPromises).then(loadedFiles => {
        const validationResult = identifyAndValidateFiles(loadedFiles);
        
        if (validationResult.globalError) {
            setError(validationResult.globalError);
            return;
        }
        
        // Use functional updates to ensure we are working with the latest state
        setFiles(prevFiles => ({
            ...prevFiles,
            ...validationResult.identifiedFiles
        }));
        
        setValidation(prevValidation => {
            const newValidation = { ...prevValidation };
            Object.entries(validationResult.validationStatus).forEach(([type, status]) => {
                newValidation[type as FileType] = status;
            });
            return newValidation;
        });

    }).catch(error => {
        console.error("Errore nella lettura dei file:", error);
        setError(`Impossibile leggere il file "${error.file?.name}".`);
    });

}, []);


  const handleProcessFiles = useCallback(async () => {
    if (!files.pntesta || !files.pnrigcon || !files.pnrigiva || !files.movanac) {
      setError('Si prega di caricare tutti i file richiesti.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setParsedData([]);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula l'elaborazione asincrona
      const result = parseDatiContabili(
        files.pntesta.content,
        files.pnrigcon.content,
        files.pnrigiva.content,
        files.movanac.content,
      );
      setParsedData(result);
    } catch (e) {
      console.error('Errore di parsing:', e);
      setError(e instanceof Error ? `Errore nell'analisi dei file: ${e.message}` : 'Si è verificato un errore sconosciuto durante il parsing.');
      setParsedData([]);
    } finally {
      setIsLoading(false);
    }
  }, [files]);

  const allFilesValid = Object.values(validation).every(v => v.status === 'valid');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <main className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
                <LogoIcon className="h-12 w-12 text-cyan-400" />
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Parser Dati Contabili</h1>
                    <p className="text-gray-400">Carica, elabora ed esporta dati contabili a larghezza fissa.</p>
                </div>
            </div>
        </header>

        <div className="bg-gray-800/50 rounded-2xl shadow-2xl shadow-black/20 backdrop-blur-sm border border-white/5 p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <FileUploader onFilesSelected={handleFilesSelected} />
              <FileStatus validationStatus={validation} />
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleProcessFiles}
                    disabled={!allFilesValid || isLoading}
                    className="flex items-center justify-center space-x-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-cyan-500/20 transition-all duration-300 transform hover:scale-105"
                >
                    <ProcessIcon className="h-5 w-5"/>
                    <span>{isLoading ? 'Elaborazione...' : 'Elabora File'}</span>
                </button>
            </div>
        </div>

        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 flex items-start space-x-3" role="alert">
                <AlertIcon className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                <div>
                    <strong className="font-bold">Errore:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            </div>
        )}

        {isLoading && (
             <div className="flex justify-center items-center p-16">
                 <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
             </div>
        )}

        {parsedData.length > 0 && !isLoading && (
            <DataTable data={parsedData} />
        )}
      </main>
    </div>
  );
}