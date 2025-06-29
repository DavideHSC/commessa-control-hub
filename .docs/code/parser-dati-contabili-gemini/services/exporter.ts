import type { IMovimentoCompleto } from '../types';

declare const XLSX: any; // From the script tag in index.html

function escapeCsvCell(cellData: any): string {
  const cell = String(cellData ?? '');
  if (cell.includes(';') || cell.includes('"') || cell.includes('\n')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

export function exportToCsv(data: IMovimentoCompleto[]): void {
  const headers = [
    'Tipo Riga', 'Codice Univoco', 'Data Reg.', 'Causale', 'Descrizione/Note', 'Totale Doc.', 'Conto', 'Dare', 'Avere', 'Codice IVA', 'Imponibile', 'Imposta'
  ];
  
  const rows = [headers.join(';')];

  data.forEach(mov => {
    // Testata row
    const testataRow = [
      'TESTATA',
      escapeCsvCell(mov.testata.codiceUnivoco),
      escapeCsvCell(mov.testata.dataRegistrazione),
      escapeCsvCell(mov.testata.codiceCausale),
      escapeCsvCell(mov.testata.siglaCliFor || mov.testata.noteMovimento),
      escapeCsvCell(mov.testata.totaleDocumento.toFixed(2)),
      '', '', '', '', '', ''
    ];
    rows.push(testataRow.join(';'));

    // Righe Contabili
    mov.righeContabili.forEach(rc => {
      const rigaContabileRow = [
        'RIGA_CONTABILE',
         escapeCsvCell(rc.codiceUnivoco),
        '', '', '', '',
        escapeCsvCell(rc.conto),
        escapeCsvCell(rc.importoDare.toFixed(2)),
        escapeCsvCell(rc.importoAvere.toFixed(2)),
        '', '', ''
      ];
      rows.push(rigaContabileRow.join(';'));
    });
    
    // Righe IVA
     mov.righeIva.forEach(ri => {
      const rigaIvaRow = [
        'RIGA_IVA',
         escapeCsvCell(ri.codiceUnivoco),
        '', '', '', '', '', '', '',
        escapeCsvCell(ri.codiceIva),
        escapeCsvCell(ri.imponibile.toFixed(2)),
        escapeCsvCell(ri.imposta.toFixed(2))
      ];
      rows.push(rigaIvaRow.join(';'));
    });
  });

  const csvContent = rows.join('\n');
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'movimenti_contabili.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


export function exportToXlsx(data: IMovimentoCompleto[]): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Testate
  const testateData = data.map(mov => ({
    'Codice Univoco': mov.testata.codiceUnivoco,
    'Data Registrazione': mov.testata.dataRegistrazione,
    'Codice Causale': mov.testata.codiceCausale,
    'Protocollo': mov.testata.protocollo,
    'Sigla Cliente/Fornitore': mov.testata.siglaCliFor,
    'Codice Fiscale C/F': mov.testata.codiceFiscaleCliFor,
    'Note': mov.testata.noteMovimento,
    'Totale Documento': mov.testata.totaleDocumento,
  }));
  const wsTestate = XLSX.utils.json_to_sheet(testateData);
  XLSX.utils.book_append_sheet(wb, wsTestate, 'Movimenti');

  // Sheet 2: Righe Contabili
  const righeContabiliData = data.flatMap(mov => mov.righeContabili.map(rc => ({
    'Codice Univoco': rc.codiceUnivoco,
    'Rigo': rc.progressivoRigo,
    'Conto': rc.conto,
    'Codice Fiscale C/F': rc.codiceFiscaleCliFor,
    'Sigla C/F': rc.siglaCliFor,
    'Note': rc.note,
    'Importo Dare': rc.importoDare,
    'Importo Avere': rc.importoAvere,
  })));
   const wsRigheContabili = XLSX.utils.json_to_sheet(righeContabiliData);
  XLSX.utils.book_append_sheet(wb, wsRigheContabili, 'Dettagli Contabili');

  // Sheet 3: Righe IVA
  const righeIvaData = data.flatMap(mov => mov.righeIva.map(ri => ({
    'Codice Univoco': ri.codiceUnivoco,
    'Codice IVA': ri.codiceIva,
    'Contropartita': ri.contropartita,
    'Imponibile': ri.imponibile,
    'Imposta': ri.imposta,
    'Note': ri.note,
  })));
  const wsRigheIva = XLSX.utils.json_to_sheet(righeIvaData);
  XLSX.utils.book_append_sheet(wb, wsRigheIva, 'Dettagli IVA');
  
    // Sheet 4: Movimenti Analitici
  const movAnaliticiData = data.flatMap(mov => mov.righeContabili.flatMap(rc => rc.movimentiAnalitici.map(ma => ({
    'Codice Univoco': ma.codiceUnivoco,
    'Rigo Contabile': ma.progressivoRigo,
    'Centro di Costo': ma.centroDiCosto,
    'Parametro': ma.parametro,
  }))));
   if (movAnaliticiData.length > 0) {
    const wsMovAnalitici = XLSX.utils.json_to_sheet(movAnaliticiData);
    XLSX.utils.book_append_sheet(wb, wsMovAnalitici, 'Dettagli Analitici');
  }


  XLSX.writeFile(wb, 'movimenti_contabili.xlsx');
}
