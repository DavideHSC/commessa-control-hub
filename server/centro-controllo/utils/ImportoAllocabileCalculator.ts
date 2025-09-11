/**
 * ImportoAllocabileCalculator - FIX CRITICO per BUG Imponibile
 * 
 * PROBLEMA RISOLTO: Il sistema allocava importi TOTALI (con IVA) invece degli IMPONIBILI,
 * causando distorsioni del 18-22% nel controllo di gestione.
 * 
 * SOLUZIONE: Calcola l'importo corretto da allocare escludendo sempre l'IVA.
 */

import { VirtualRigaContabile, VirtualRigaIva } from '../types/virtualEntities';

export class ImportoAllocabileCalculator {
  
  /**
   * Estrae il codice conto da string o oggetto
   * Gestisce i diversi formati di riga.conto
   */
  private static extractCodiceConto(conto: any): string {
    if (typeof conto === 'string') {
      return conto;
    }
    if (conto && typeof conto === 'object' && conto.codice) {
      return conto.codice;
    }
    return '';
  }
  
  /**
   * Calcola l'importo allocabile corretto per una riga contabile
   * REGOLA FONDAMENTALE: Solo imponibili sono allocabili, mai IVA
   */
  static calcolaImportoAllocabile(
    riga: VirtualRigaContabile, 
    righeIvaCollegate: VirtualRigaIva[] = []
  ): number {
    
    // 1. Se è una riga IVA → return 0 (mai allocabile)
    if (this.isRigaIva(riga)) {
      return 0;
    }
    
    // 2. Se è una riga allocabile → calcola importo al netto IVA
    if (this.isRigaAllocabile(riga)) {
      return this.calcolaImponibile(riga, righeIvaCollegate);
    }
    
    // 3. Altri tipi di righe → non allocabili
    return 0;
  }
  
  /**
   * Determina se una riga è di tipo IVA (mai allocabile)
   */
  private static isRigaIva(riga: VirtualRigaContabile): boolean {
    // Estrai codice conto da stringa o oggetto
    const contoIva = this.extractCodiceConto(riga.conto);
    
    if (!contoIva) return false;
    
    // Pattern comuni conti IVA
    return contoIva.startsWith('26') ||  // Debiti tributari IVA
           contoIva.startsWith('27') ||  // Crediti tributari IVA  
           contoIva.includes('IVA') ||
           contoIva.includes('IMP');
  }
  
  /**
   * Determina se una riga è allocabile (costo/ricavo operativo)
   */
  private static isRigaAllocabile(riga: VirtualRigaContabile): boolean {
    const conto = this.extractCodiceConto(riga.conto);
    if (!conto) return false;
    const classe = conto.charAt(0);
    
    // Classi allocabili: 6 (Costi), 7 (Ricavi), alcuni conti Classe 4/5
    switch (classe) {
      case '6': // Costi operativi
        return this.isCostoAllocabile(conto);
      case '7': // Ricavi operativi
        return this.isRicavoAllocabile(conto);
      case '4': // Alcuni costi in sospensione
      case '5': // Alcuni ricavi in sospensione
        return this.isSospensionAllocabile(conto);
      default:
        return false;
    }
  }
  
  /**
   * Verifica se un conto di classe 6 è allocabile
   */
  private static isCostoAllocabile(conto: string): boolean {
    // Escludi costi non allocabili
    const costiNonAllocabili = [
      '6000', // Imposte e tasse
      '6001', // Interessi passivi
      '6002', // Svalutazioni 
    ];
    
    return !costiNonAllocabili.some(exclusion => conto.startsWith(exclusion));
  }
  
  /**
   * Verifica se un conto di classe 7 è allocabile
   */
  private static isRicavoAllocabile(conto: string): boolean {
    // Tutti i ricavi sono allocabili tranne quelli finanziari
    const ricaviNonAllocabili = [
      '7001', // Interessi attivi
      '7002', // Proventi finanziari
      '7003', // Plusvalenze
    ];
    
    return !ricaviNonAllocabili.some(exclusion => conto.startsWith(exclusion));
  }
  
  /**
   * Verifica se conti di classe 4/5 sono allocabili
   */
  private static isSospensionAllocabile(conto: string): boolean {
    // Solo alcuni conti di sospensione sono allocabili
    const sospesioniAllocabili = [
      '4100', // Ratei attivi
      '4200', // Risconti attivi
      '5100', // Ratei passivi  
      '5200', // Risconti passivi
    ];
    
    return sospesioniAllocabili.some(allocable => conto.startsWith(allocable));
  }
  
  /**
   * Calcola l'importo imponibile al netto dell'IVA collegata
   * CORE BUSINESS LOGIC - FIX del BUG principale
   */
  private static calcolaImponibile(
    riga: VirtualRigaContabile, 
    righeIvaCollegate: VirtualRigaIva[]
  ): number {
    
    const importoLordo = Math.max(riga.importoDare || 0, riga.importoAvere || 0);
    
    // Se non ci sono righe IVA collegate, l'importo è già imponibile
    if (!righeIvaCollegate.length) {
      return importoLordo;
    }
    
    // Calcola IVA totale collegata a questa riga
    const ivaCollegata = righeIvaCollegate
      .filter(rigaIva => this.isIvaCollegataARiga(rigaIva, riga))
      .reduce((totale, rigaIva) => {
        const importoIva = Math.max(rigaIva.imposta || 0, 0);
        return totale + importoIva;
      }, 0);
    
    // Importo imponibile = Importo lordo - IVA
    const imponibile = importoLordo - ivaCollegata;
    
    return Math.max(imponibile, 0); // Non può essere negativo
  }
  
  /**
   * Determina se una riga IVA è collegata a una riga contabile
   * Basato su codice movimento e altre logiche di matching
   */
  private static isIvaCollegataARiga(
    rigaIva: VirtualRigaIva, 
    rigaContabile: VirtualRigaContabile
  ): boolean {
    
    // Match per codice univoco scaricamento
    if (rigaIva.codiceUnivocoScaricamento && rigaContabile.externalId) {
      return rigaIva.codiceUnivocoScaricamento === rigaContabile.externalId;
    }
    
    // Match per progressivo riga (se disponibile)
    if (rigaIva.progressivoRiga && rigaContabile.progressivoRigo) {
      return rigaIva.progressivoRiga === rigaContabile.progressivoRigo;
    }
    
    // Match per contropartita (riga IVA collegata al conto)
    if (rigaIva.contropartita && rigaContabile.conto) {
      return rigaIva.contropartita === rigaContabile.conto;
    }
    
    return false;
  }
  
  /**
   * Utility per calcolare totale allocabile di un movimento completo
   */
  static calcolaTotaleAllocabileMovimento(
    righeContabili: VirtualRigaContabile[],
    righeIva: VirtualRigaIva[] = []
  ): {
    totaleAllocabile: number;
    totaleNonAllocabile: number;
    dettaglio: Array<{
      riga: VirtualRigaContabile;
      importoAllocabile: number;
      isAllocabile: boolean;
    }>;
  } {
    
    let totaleAllocabile = 0;
    let totaleNonAllocabile = 0;
    const dettaglio = [];
    
    for (const riga of righeContabili) {
      const importoAllocabile = this.calcolaImportoAllocabile(riga, righeIva);
      const importoTotale = Math.max(riga.importoDare || 0, riga.importoAvere || 0);
      const isAllocabile = importoAllocabile > 0;
      
      if (isAllocabile) {
        totaleAllocabile += importoAllocabile;
      } else {
        totaleNonAllocabile += importoTotale;
      }
      
      dettaglio.push({
        riga,
        importoAllocabile,
        isAllocabile
      });
    }
    
    return {
      totaleAllocabile,
      totaleNonAllocabile,
      dettaglio
    };
  }
  
  /**
   * Valida che l'allocazione sia corretta (importo allocato <= importo allocabile)
   */
  static validaAllocazione(
    importoAllocabile: number,
    importoAllocato: number,
    tolerance: number = 0.01
  ): {
    isValid: boolean;
    error?: string;
  } {
    
    if (importoAllocato < 0) {
      return {
        isValid: false,
        error: 'Importo allocato non può essere negativo'
      };
    }
    
    if (importoAllocato > importoAllocabile + tolerance) {
      return {
        isValid: false,
        error: `Importo allocato (€${importoAllocato.toFixed(2)}) supera importo allocabile (€${importoAllocabile.toFixed(2)})`
      };
    }
    
    return { isValid: true };
  }
}

export default ImportoAllocabileCalculator;