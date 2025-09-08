import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, FileText, Calculator, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

interface StagingTestataWithDetails {
  id: string;
  codiceUnivocoScaricamento: string;
  clienteFornitoreCodiceFiscale?: string;
  clienteFornitoreSigla?: string;
  descrizioneCausale?: string;
  dataRegistrazione?: string;
  totaleDocumento?: string;
  numeroDocumento?: string;
  righeContabili: any[];
  righeIva: any[];
  allocazioni: any[];
  stats: {
    numeroRigheContabili: number;
    numeroRigheIva: number;
    numeroAllocazioni: number;
    totaleDare: number;
    totaleAvere: number;
  };
}

interface ApiResponse {
  data: StagingTestataWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalTestate: number;
    testateInPagina: number;
    righeContabiliTotali: number;
    righeIvaTotali: number;
    allocazioniTotali: number;
  };
}

export const ScrittureContabiliMasterDetail = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Ridotto per il master-detail
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        search: search,
        sortBy: 'codiceUnivocoScaricamento',
        sortOrder: 'asc'
      });
      
      const response = await fetch(`/api/staging/scritture-complete?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: ApiResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dati');
      console.error('Errore nel fetch:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleRowExpansion = (testataId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(testataId)) {
      newExpanded.delete(testataId);
    } else {
      newExpanded.add(testataId);
    }
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (value: string | number | undefined) => {
    if (!value) return '€0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(num || 0);
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    // Formato GGMMAAAA -> GG/MM/AAAA
    if (dateStr.length === 8) {
      return `${dateStr.substring(0,2)}/${dateStr.substring(2,4)}/${dateStr.substring(4,8)}`;
    }
    return dateStr;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Caricamento scritture contabili...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">
            ❌ Errore: {error}
          </div>
          <Button onClick={fetchData} className="mt-4">
            Riprova
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header con statistiche di riepilogo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Scritture Contabili
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg">{data.summary.totalTestate}</div>
              <div className="text-gray-600">Testate Totali</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{data.summary.testateInPagina}</div>
              <div className="text-gray-600">In questa Pagina</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{data.summary.righeContabiliTotali}</div>
              <div className="text-gray-600">Righe Contabili</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{data.summary.righeIvaTotali}</div>
              <div className="text-gray-600">Righe IVA</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{data.summary.allocazioniTotali}</div>
              <div className="text-gray-600">Allocazioni</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barra di ricerca */}
      <Card>
        <CardContent className="p-4">
          <input
            type="text"
            placeholder="Cerca per codice, causale, documento, CF o sigla..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </CardContent>
      </Card>

      {/* Master-Detail Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Codice Univoco
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente/Fornitore
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sigla ⭐
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Totale
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Righe
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.data.map((testata) => (
                  <React.Fragment key={testata.id}>
                    {/* Master Row */}
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleRowExpansion(testata.id)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1"
                        >
                          {expandedRows.has(testata.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {testata.codiceUnivocoScaricamento}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="max-w-32 truncate" title={testata.clienteFornitoreCodiceFiscale || 'N/A'}>
                          {testata.clienteFornitoreCodiceFiscale || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${testata.clienteFornitoreSigla ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'} px-2 py-1 rounded`}>
                          {testata.clienteFornitoreSigla || 'Vuoto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {testata.numeroDocumento || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(testata.totaleDocumento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(testata.dataRegistrazione)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-1 text-xs">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{testata.stats.numeroRigheContabili}C</span>
                          {testata.stats.numeroRigheIva > 0 && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{testata.stats.numeroRigheIva}I</span>
                          )}
                          {testata.stats.numeroAllocazioni > 0 && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{testata.stats.numeroAllocazioni}A</span>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Detail Rows (Expanded) */}
                    {expandedRows.has(testata.id) && (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            {/* Righe Contabili */}
                            {testata.righeContabili.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                  <Calculator className="h-4 w-4" />
                                  Righe Contabili ({testata.righeContabili.length})
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-3 py-2 text-left">Prog</th>
                                        <th className="px-3 py-2 text-left">Tipo</th>
                                        <th className="px-3 py-2 text-left">CF</th>
                                        <th className="px-3 py-2 text-left">Sigla ⭐</th>
                                        <th className="px-3 py-2 text-left">Conto</th>
                                        <th className="px-3 py-2 text-left">Dare</th>
                                        <th className="px-3 py-2 text-left">Avere</th>
                                        <th className="px-3 py-2 text-left">Note</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {testata.righeContabili.map((riga, index) => (
                                        <tr key={index} className="border-b border-gray-200">
                                          <td className="px-3 py-2">{riga.progressivoRigo || (index + 1)}</td>
                                          <td className="px-3 py-2">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                              riga.tipoConto === 'C' ? 'bg-blue-100 text-blue-800' :
                                              riga.tipoConto === 'F' ? 'bg-orange-100 text-orange-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>
                                              {riga.tipoConto || 'N/A'}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2 max-w-24 truncate" title={riga.clienteFornitoreCodiceFiscale}>
                                            {riga.clienteFornitoreCodiceFiscale || 'N/A'}
                                          </td>
                                          <td className="px-3 py-2">
                                            <span className={`font-medium px-2 py-1 rounded text-xs ${
                                              riga.clienteFornitoreSigla ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                                            }`}>
                                              {riga.clienteFornitoreSigla || 'Vuoto'}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2">{riga.conto || 'N/A'}</td>
                                          <td className="px-3 py-2 text-right">{formatCurrency(riga.importoDare)}</td>
                                          <td className="px-3 py-2 text-right">{formatCurrency(riga.importoAvere)}</td>
                                          <td className="px-3 py-2 max-w-32 truncate" title={riga.note}>
                                            {riga.note || '-'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Righe IVA */}
                            {testata.righeIva.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  Righe IVA ({testata.righeIva.length})
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-3 py-2 text-left">Riga</th>
                                        <th className="px-3 py-2 text-left">Codice IVA</th>
                                        <th className="px-3 py-2 text-left">Contropartita</th>
                                        <th className="px-3 py-2 text-left">Imponibile</th>
                                        <th className="px-3 py-2 text-left">Imposta</th>
                                        <th className="px-3 py-2 text-left">Lordo</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {testata.righeIva.map((riga, index) => (
                                        <tr key={index} className="border-b border-gray-200">
                                          <td className="px-3 py-2">{riga.riga || (index + 1)}</td>
                                          <td className="px-3 py-2">{riga.codiceIva || 'N/A'}</td>
                                          <td className="px-3 py-2">{riga.contropartita || 'N/A'}</td>
                                          <td className="px-3 py-2 text-right">{formatCurrency(riga.imponibile)}</td>
                                          <td className="px-3 py-2 text-right">{formatCurrency(riga.imposta)}</td>
                                          <td className="px-3 py-2 text-right font-medium">{formatCurrency(riga.importoLordo)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Message se nessun dettaglio */}
                            {testata.righeContabili.length === 0 && testata.righeIva.length === 0 && (
                              <p className="text-gray-500 italic">Nessuna riga di dettaglio disponibile per questa testata.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Paginazione */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Pagina {data.pagination.page} di {data.pagination.totalPages} 
              ({data.pagination.total} testate totali)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Precedente
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(data.pagination.totalPages, currentPage + 1))}
                disabled={currentPage === data.pagination.totalPages}
              >
                Successiva
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};