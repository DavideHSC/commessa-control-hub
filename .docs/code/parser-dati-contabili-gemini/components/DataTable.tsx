import React, { useState, useCallback } from 'react';
import type { IMovimentoCompleto } from '../types';
import { exportToCsv, exportToXlsx } from '../services/exporter';
import { ChevronDownIcon, DownloadIcon } from './icons';

interface DataTableProps {
  data: IMovimentoCompleto[];
}

const DataTableRow: React.FC<{ movimento: IMovimentoCompleto }> = ({ movimento }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { testata, righeContabili, righeIva } = movimento;

  const toggleExpansion = () => setIsExpanded(!isExpanded);

  return (
    <>
      <tr 
        onClick={toggleExpansion} 
        className="bg-gray-800 hover:bg-gray-700/50 cursor-pointer border-b border-gray-700 transition-colors duration-200"
      >
        <td className="p-4 whitespace-nowrap text-sm font-medium text-cyan-400">{testata.codiceUnivoco}</td>
        <td className="p-4 whitespace-nowrap text-sm text-gray-300">{testata.dataRegistrazione}</td>
        <td className="p-4 whitespace-nowrap text-sm text-gray-300">{testata.codiceCausale}</td>
        <td className="p-4 text-sm text-gray-300 truncate max-w-xs">{testata.siglaCliFor || testata.noteMovimento}</td>
        <td className="p-4 whitespace-nowrap text-sm text-gray-300 font-mono text-right">{testata.totaleDocumento.toFixed(2)}</td>
        <td className="p-4 whitespace-nowrap text-sm text-gray-300">
          <ChevronDownIcon className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="p-0 bg-gray-900/60">
            <div className="p-4 space-y-4">
              {righeContabili.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Righe Contabili</h4>
                  <div className="overflow-x-auto rounded-md border border-gray-700">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-700/50">
                        <tr>
                          <th className="p-2 text-left">Rigo</th>
                          <th className="p-2 text-left">Conto</th>
                          <th className="p-2 text-left">Codice Fiscale</th>
                          <th className="p-2 text-left">Sigla C/F</th>
                          <th className="p-2 text-right">Dare</th>
                          <th className="p-2 text-right">Avere</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {righeContabili.map((riga, i) => (
                          <tr key={i} className="bg-gray-800/70">
                            <td className="p-2">{riga.progressivoRigo}</td>
                            <td className="p-2 font-mono">{riga.conto}</td>
                            <td className="p-2 font-mono">{riga.codiceFiscaleCliFor}</td>
                            <td className="p-2 font-mono">{riga.siglaCliFor}</td>
                            <td className="p-2 text-right font-mono">{riga.importoDare > 0 ? riga.importoDare.toFixed(2) : '-'}</td>
                            <td className="p-2 text-right font-mono">{riga.importoAvere > 0 ? riga.importoAvere.toFixed(2) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {righeIva.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Righe IVA</h4>
                   <div className="overflow-x-auto rounded-md border border-gray-700">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-700/50">
                        <tr>
                          <th className="p-2 text-left">Cod. IVA</th>
                          <th className="p-2 text-left">Contropartita</th>
                          <th className="p-2 text-right">Imponibile</th>
                          <th className="p-2 text-right">Imposta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {righeIva.map((riga, i) => (
                          <tr key={i} className="bg-gray-800/70">
                            <td className="p-2">{riga.codiceIva}</td>
                            <td className="p-2">{riga.contropartita}</td>
                            <td className="p-2 text-right font-mono">{riga.imponibile.toFixed(2)}</td>
                            <td className="p-2 text-right font-mono">{riga.imposta.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};


export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [exporting, setExporting] = useState<'' | 'csv' | 'xlsx'>('');

  const handleExport = useCallback(async (format: 'csv' | 'xlsx') => {
    setExporting(format);
    await new Promise(resolve => setTimeout(resolve, 100)); // allow UI to update
    try {
        if (format === 'csv') {
            exportToCsv(data);
        } else {
            exportToXlsx(data);
        }
    } catch(e) {
        console.error("Esportazione fallita", e);
    } finally {
        setExporting('');
    }
  }, [data]);

  return (
    <div className="bg-gray-800/50 rounded-2xl shadow-2xl shadow-black/20 backdrop-blur-sm border border-white/5 p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Movimenti Elaborati ({data.length})</h3>
            <div className="flex space-x-2">
                 <button onClick={() => handleExport('csv')} disabled={!!exporting} className="flex items-center space-x-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-500 text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    <DownloadIcon className="h-4 w-4"/>
                    <span>{exporting === 'csv' ? 'Esportando...' : 'Esporta CSV'}</span>
                 </button>
                 <button onClick={() => handleExport('xlsx')} disabled={!!exporting} className="flex items-center space-x-2 text-sm bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    <DownloadIcon className="h-4 w-4"/>
                    <span>{exporting === 'xlsx' ? 'Esportando...' : 'Esporta XLSX'}</span>
                 </button>
            </div>
        </div>
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
            <tr>
              <th scope="col" className="p-4">Codice Univoco</th>
              <th scope="col" className="p-4">Data Reg.</th>
              <th scope="col" className="p-4">Causale</th>
              <th scope="col" className="p-4">Descrizione/Note</th>
              <th scope="col" className="p-4 text-right">Totale</th>
              <th scope="col" className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((movimento) => (
              <DataTableRow key={movimento.testata.codiceUnivoco} movimento={movimento} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
