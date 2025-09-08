import { MovimentoType, CausaleCategory, RigaType, AllocationSuggestion } from '../types/virtualEntities.js';

// ===============================================================================
// CLASSIFICATORE MOVIMENTI CONTABILI (basato su esempi-registrazioni.md)
// ===============================================================================
// Implementa la logica di classificazione automatica dei movimenti contabili
// basandosi sui pattern identificati nell'analisi del documento

export class MovimentClassifier {

  /**
   * Classifica il tipo di movimento basandosi sulla causale
   */
  static classifyMovimentoType(causale: string): MovimentoType {
    const causaleUpper = causale.toUpperCase().trim();
    
    // Fatture di acquisto
    if (['FTRI', 'FRS', 'FTDR'].includes(causaleUpper)) {
      return 'FATTURA_ACQUISTO';
    }
    
    // Fatture di vendita
    if (['FTEM', 'FTS', 'FTDE', 'FTE0'].includes(causaleUpper)) {
      return 'FATTURA_VENDITA';
    }
    
    // Note di credito
    if (['NCRSP', 'NCEM'].includes(causaleUpper)) {
      return 'NOTA_CREDITO';
    }
    
    // Movimenti finanziari
    if (['PAGA', 'INC', '38'].includes(causaleUpper)) {
      return 'MOVIMENTO_FINANZIARIO';
    }
    
    // Scritture di assestamento
    if (['RISA', 'RATP', 'RIMI', 'STIP'].includes(causaleUpper)) {
      return 'ASSESTAMENTO';
    }
    
    // Giroconti
    if (['GIRO', '32', 'RILE'].includes(causaleUpper)) {
      return 'GIRO_CONTABILE';
    }
    
    return 'ALTRO';
  }

  /**
   * Classifica la categoria della causale per scopi interpretativi
   */
  static classifyCausaleCategory(causale: string, tipoMovimento: MovimentoType): CausaleCategory {
    switch (tipoMovimento) {
      case 'FATTURA_ACQUISTO':
        // FTDR sono costi di competenza, gli altri sono costi effettivi
        return causale.toUpperCase() === 'FTDR' ? 'COSTO_DIRETTO' : 'COSTO_DIRETTO';
      
      case 'FATTURA_VENDITA':
        return 'RICAVO';
      
      case 'MOVIMENTO_FINANZIARIO':
        return 'MOVIMENTO_FINANZIARIO';
      
      case 'ASSESTAMENTO':
        return 'COMPETENZA_FUTURA';
      
      case 'GIRO_CONTABILE':
        return 'MOVIMENTO_PATRIMONIALE';
        
      case 'NOTA_CREDITO':
        return 'COSTO_DIRETTO'; // O RICAVO se è una NC emessa
      
      default:
        return 'ALTRO';
    }
  }

  /**
   * Classifica il tipo di riga basandosi sul conto contabile
   */
  static classifyRigaType(conto: string, importoDare: number, importoAvere: number): RigaType {
    const contoTrimmed = conto.trim();
    
    // Determina la classe principale del conto
    const classeContabile = this.getClasseContabile(contoTrimmed);
    
    switch (classeContabile) {
      case '6': // Costi
        return this.classifyCosto(contoTrimmed, importoDare, importoAvere);
      
      case '7': // Ricavi
        return 'RICAVO_ALLOCABILE';
        
      case '1': // Attivo patrimoniale
        if (contoTrimmed.startsWith('188')) { // IVA
          return 'IVA';
        }
        return 'PATRIMONIALE';
        
      case '2': // Passivo patrimoniale
        if (contoTrimmed.startsWith('201')) { // Fornitori
          return 'ANAGRAFICA';
        }
        if (contoTrimmed.startsWith('220')) { // Banche
          return 'BANCA';
        }
        return 'PATRIMONIALE';
        
      case '4': // Conti d'ordine e transitori
        if (contoTrimmed.startsWith('461')) { // Fatture da ricevere
          return 'PATRIMONIALE';
        }
        return 'ANAGRAFICA';
        
      default:
        return 'ALTRO';
    }
  }

  /**
   * Classifica più specificamente i costi (classe 6)
   */
  private static classifyCosto(conto: string, importoDare: number, importoAvere: number): RigaType {
    const sottoconto = conto.substring(0, 4);
    
    // Mappature basate sull'analisi del documento esempi-registrazioni.md
    const costiGenerali = ['6015000800', '6020000450', '7820001600']; // Cancelleria, oneri finanziari, imposte
    const costiDiretti = ['6005', '6015', '6018', '6310', '6320', '6335']; // Acquisti, lavorazioni, servizi, personale
    
    if (costiGenerali.includes(conto)) {
      return 'COSTO_GENERALE';
    }
    
    // Controlla i prefissi per costi diretti
    if (costiDiretti.some(prefisso => conto.startsWith(prefisso))) {
      return 'COSTO_ALLOCABILE';
    }
    
    return 'COSTO_ALLOCABILE'; // Default per classe 6
  }

  /**
   * Determina se una scrittura è allocabile
   */
  static isAllocabile(tipoMovimento: MovimentoType, causaleCategory: CausaleCategory): boolean {
    // Mai allocabili: movimenti finanziari e giroconti
    if (tipoMovimento === 'MOVIMENTO_FINANZIARIO' || tipoMovimento === 'GIRO_CONTABILE') {
      return false;
    }
    
    // Mai allocabili: movimenti puramente patrimoniali
    if (causaleCategory === 'MOVIMENTO_PATRIMONIALE' || causaleCategory === 'MOVIMENTO_FINANZIARIO') {
      return false;
    }
    
    return true;
  }

  /**
   * Determina se una riga specifica è allocabile
   */
  static isRigaAllocabile(tipoRiga: RigaType): boolean {
    return tipoRiga === 'COSTO_ALLOCABILE' || tipoRiga === 'RICAVO_ALLOCABILE';
  }

  /**
   * Suggerisce una voce analitica basandosi sul conto
   */
  static suggestVoceAnalitica(conto: string, note: string): AllocationSuggestion {
    const mappingVociAnalitiche = this.getMappingVociAnalitiche();
    const contoMatch = mappingVociAnalitiche[conto];
    
    if (contoMatch) {
      return {
        rigaProgressivo: '',
        voceAnalitica: contoMatch.voce,
        descrizioneVoce: contoMatch.descrizione,
        motivazione: contoMatch.motivazione,
        confidenza: 85,
        importoSuggerito: 0
      };
    }
    
    // Prova con pattern matching su note
    return this.suggestFromNotes(note, conto);
  }

  /**
   * Mapping statico basato sull'analisi del documento
   */
  private static getMappingVociAnalitiche(): Record<string, { voce: string; descrizione: string; motivazione: string }> {
    return {
      '6005000150': {
        voce: 'Materiale di Consumo',
        descrizione: 'Acquisto Materiali',
        motivazione: 'Costo diretto, da imputare alla commessa che usa il materiale'
      },
      '6005000850': {
        voce: 'Carburanti e Lubrificanti', 
        descrizione: 'Acquisti Materie Prime',
        motivazione: 'Costo diretto per commesse con uso di mezzi d\'opera/veicoli'
      },
      '6015000400': {
        voce: 'Utenze',
        descrizione: 'Energia Elettrica',
        motivazione: 'Costo indiretto da ripartire, diventa diretto se cantiere ha contatore dedicato'
      },
      '6015000751': {
        voce: 'Lavorazioni Esterne',
        descrizione: 'Costi per Lavorazioni',
        motivazione: 'Costo diretto, da imputare alla commessa per cui è stata eseguita la lavorazione'
      },
      '6015000800': {
        voce: 'Spese Generali / di Struttura',
        descrizione: 'Cancelleria',
        motivazione: 'NON imputare a commesse specifiche, ma a centro di costo "Spese Generali"'
      },
      '6015002101': {
        voce: 'Pulizie di Cantiere',
        descrizione: 'Pulizia Locali',
        motivazione: 'Costo diretto se il servizio è per un cantiere specifico'
      },
      '6310000500': {
        voce: 'Manodopera Diretta',
        descrizione: 'Salari e Stipendi',
        motivazione: 'Il costo della manodopera che lavora sulla commessa, imputare in base alle ore lavorate'
      },
      '6320000350': {
        voce: 'Oneri su Manodopera',
        descrizione: 'Oneri Sociali',
        motivazione: 'Segue sempre l\'imputazione del costo principale (Salari e Stipendi)'
      }
    };
  }

  /**
   * Suggerimenti basati su pattern nelle note
   */
  private static suggestFromNotes(note: string, conto: string): AllocationSuggestion {
    const noteUpper = note.toUpperCase();
    
    // Pattern per fornitore specifico
    if (noteUpper.includes('VENANZPIERPA')) {
      return {
        rigaProgressivo: '',
        voceAnalitica: 'Pulizie di Cantiere',
        descrizioneVoce: 'Servizio pulizie cantiere',
        motivazione: 'Pattern riconosciuto: fornitore VENANZPIERPA associato a pulizie',
        confidenza: 70,
        importoSuggerito: 0
      };
    }
    
    if (noteUpper.includes('SORRENTO')) {
      return {
        rigaProgressivo: '',
        voceAnalitica: 'Manodopera Diretta',
        descrizioneVoce: 'Costo personale cantiere',
        motivazione: 'Pattern riconosciuto: riferimento a cantiere Piano di Sorrento',
        confidenza: 75,
        importoSuggerito: 0
      };
    }
    
    // Default fallback
    return {
      rigaProgressivo: '',
      voceAnalitica: 'Da Classificare',
      descrizioneVoce: 'Richiede classificazione manuale',
      motivazione: 'Nessun pattern automatico riconosciuto',
      confidenza: 25,
      importoSuggerito: 0
    };
  }

  /**
   * Ottieni la classe contabile principale (primo carattere del conto)
   */
  private static getClasseContabile(conto: string): string {
    if (!conto || conto.length === 0) return '0';
    return conto.charAt(0);
  }

  /**
   * Determina la motivazione per cui una scrittura/riga non è allocabile
   */
  static getMotivoNonAllocabile(tipoMovimento: MovimentoType, tipoRiga?: RigaType): string {
    if (tipoMovimento === 'MOVIMENTO_FINANZIARIO') {
      return 'Movimento finanziario: il costo è stato già registrato con la fattura, questa operazione sposta solo denaro.';
    }
    
    if (tipoMovimento === 'GIRO_CONTABILE') {
      return 'Giroconto: movimento puramente contabile che non rappresenta un costo di produzione.';
    }
    
    if (tipoRiga === 'IVA') {
      return 'Conto IVA: i costi IVA non si imputano mai alla commessa.';
    }
    
    if (tipoRiga === 'ANAGRAFICA') {
      return 'Conto cliente/fornitore: rappresenta un debito/credito, non un costo di produzione.';
    }
    
    if (tipoRiga === 'BANCA') {
      return 'Conto finanziario: movimento di liquidità, non di competenza economica.';
    }
    
    if (tipoRiga === 'COSTO_GENERALE') {
      return 'Costo generale: da imputare a "Spese Generali" piuttosto che a commesse specifiche.';
    }
    
    return 'Movimento non allocabile per natura contabile.';
  }
}