import type { AppFile } from '../types';
import type { FileType } from '../App';
import { FILE_DEFINITIONS } from '../App';

type ValidationStatus = { status: 'missing' | 'valid' | 'invalid'; message?: string; fileName?: string };

// Helper per estrarre campo dalla posizione (1-based indexing come nella documentazione)
function slice(line: string, start: number, end: number): string {
    return line.substring(start - 1, end);
}

// Funzioni di validazione basate su lunghezza + pattern specifici
const isPntesta = (line: string): boolean => {
    // PNTESTA è il più lungo (445 caratteri) e ha pattern unici
    if (line.length < 400) return false;
    
    const codiceFiscale = slice(line, 4, 19).trim();
    const codiceUnivoco = slice(line, 21, 32).trim();
    
    return codiceFiscale.length > 0 && codiceUnivoco.length > 0;
};

const isPnrigcon = (line: string): boolean => {
    // PNRIGCON è medio-lungo (312 caratteri) 
    if (line.length < 250 || line.length > 350) return false;
    
    const codiceUnivoco = slice(line, 4, 15).trim();
    const progressivoRigo = slice(line, 16, 18).trim();
    
    return codiceUnivoco.length > 0 && progressivoRigo.length > 0;
};

const isPnrigiva = (line: string): boolean => {
    // PNRIGIVA è medio (173 caratteri)
    if (line.length < 150 || line.length > 200) return false;
    
    const codiceUnivoco = slice(line, 4, 15).trim();
    const codiceIva = slice(line, 16, 19).trim();
    
    return codiceUnivoco.length > 0 && codiceIva.length > 0;
};

const isMovanac = (line: string): boolean => {
    // MOVANAC è il più corto (34 caratteri)
    if (line.length < 25 || line.length > 50) return false;
    
    const codiceUnivoco = slice(line, 4, 15).trim();
    const progressivoRigo = slice(line, 16, 18).trim();
    const centroCosto = slice(line, 19, 22).trim();
    
    return codiceUnivoco.length > 0 && progressivoRigo.length > 0 && centroCosto.length > 0;
};

const FILE_TYPE_VALIDATORS: { type: FileType; test: (line: string) => boolean }[] = [
    { type: 'pntesta', test: isPntesta },
    { type: 'pnrigcon', test: isPnrigcon },
    { type: 'pnrigiva', test: isPnrigiva },
    { type: 'movanac', test: isMovanac },
];

interface ValidationResult {
    identifiedFiles: Partial<Record<FileType, AppFile>>;
    validationStatus: Partial<Record<FileType, ValidationStatus>>;
    globalError: string | null;
}

export function identifyAndValidateFiles(loadedFiles: { file: File; content: string }[]): ValidationResult {
  const result: ValidationResult = {
    identifiedFiles: {},
    validationStatus: {},
    globalError: null,
  };
  const typesInBatch = new Set<FileType>();

  for (const { file, content } of loadedFiles) {
    // Cerca la prima riga non vuota per la validazione
    const firstValidLine = content.split('\n').find(line => line.trim().length > 0);
    
    if (!firstValidLine) {
        // Ignora file completamente vuoti
        continue;
    }

    let identifiedType: FileType | null = null;
    for (const validator of FILE_TYPE_VALIDATORS) {
      if (validator.test(firstValidLine)) {
        identifiedType = validator.type;
        break;
      }
    }
    
    if (identifiedType) {
      if (typesInBatch.has(identifiedType)) {
        result.globalError = `Hai fornito più file dello stesso tipo (${FILE_DEFINITIONS[identifiedType].name}) in un unico caricamento. Forniscine solo uno per tipo.`;
        return result;
      }
      typesInBatch.add(identifiedType);
      result.identifiedFiles[identifiedType] = { name: file.name, content };
      result.validationStatus[identifiedType] = { status: 'valid', fileName: file.name };
    } else {
       result.globalError = `Il file "${file.name}" ha un formato non riconosciuto o non valido.`;
       return result;
    }
  }

  return result;
}