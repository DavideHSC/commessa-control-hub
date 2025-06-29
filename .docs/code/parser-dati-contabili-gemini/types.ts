export interface IMovimentoAnalitico {
  codiceUnivoco: string;
  progressivoRigo: number;
  centroDiCosto: string;
  parametro: number;
}

export interface IRigaIva {
  codiceUnivoco: string;
  codiceIva: string;
  contropartita: string;
  imponibile: number;
  imposta: number;
  note: string;
}

export interface IRigaContabile {
  codiceUnivoco: string;
  progressivoRigo: number;
  tipoConto?: string;
  codiceFiscaleCliFor: string;
  siglaCliFor: string;
  conto: string;
  importoDare: number;
  importoAvere: number;
  note: string;
  movimentiAnalitici: IMovimentoAnalitico[];
}

export interface ITestata {
  codiceFiscaleAzienda: string;
  codiceUnivoco: string;
  codiceCausale: string;
  dataRegistrazione: string;
  protocollo: string;
  codiceFiscaleCliFor: string;
  siglaCliFor: string;
  totaleDocumento: number;
  noteMovimento: string;
}

export interface IMovimentoCompleto {
  testata: ITestata;
  righeContabili: IRigaContabile[];
  righeIva: IRigaIva[];
}

export interface AppFile {
  name: string;
  content: string;
}
