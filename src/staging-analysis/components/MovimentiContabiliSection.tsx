import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../new_components/ui/Card';
import { Button } from '../../new_components/ui/Button';
import { Badge } from '../../new_components/ui/Badge';
import { Alert, AlertDescription } from '../../new_components/ui/Alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../new_components/ui/Table';
import { Input } from '../../new_components/ui/Input';
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  DollarSign,
  ChevronRight,
  ChevronDown,
  FileText,
  User,
  Search,
  Filter,
  Eye,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';
import { 
  MovimentiContabiliFilters,
  MovimentiContabiliResponse,
  MovimentoContabileCompleto,
  StagingAnalysisApiResponse
} from '../types/stagingAnalysisTypes';

interface MovimentiContabiliSectionProps {
  refreshTrigger?: number;
}

export const MovimentiContabiliSection = ({ refreshTrigger }: MovimentiContabiliSectionProps) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MovimentiContabiliResponse | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Filters state
  const [filters, setFilters] = useState<MovimentiContabiliFilters>({
    page: 1,
    limit: 20,
    stato: 'ALL'
  });
  const [pendingFilters, setPendingFilters] = useState<MovimentiContabiliFilters>(filters);

  // Auto-refresh quando cambia refreshTrigger
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchMovimentiContabili();
    }
  }, [refreshTrigger]);

  // Load data on mount
  useEffect(() => {
    fetchMovimentiContabili();
  }, [filters]);

  const fetchMovimentiContabili = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.dataDa) queryParams.append('dataDa', filters.dataDa);
      if (filters.dataA) queryParams.append('dataA', filters.dataA);
      if (filters.soggetto) queryParams.append('soggetto', filters.soggetto);
      if (filters.stato) queryParams.append('stato', filters.stato);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const response = await fetch(`/api/staging-analysis/movimenti-contabili?${queryParams}`);
      const result: StagingAnalysisApiResponse<MovimentiContabiliResponse> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch movimenti contabili');
      }
      
      setData(result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching movimenti contabili:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setFilters({ ...pendingFilters, page: 1 }); // Reset to first page when filtering
  };

  const handleResetFilters = () => {
    const resetFilters: MovimentiContabiliFilters = {
      page: 1,
      limit: 20,
      stato: 'ALL'
    };
    setPendingFilters(resetFilters);
    setFilters(resetFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const getStatoBadge = (stato: 'Draft' | 'Posted' | 'Validated') => {
    const config = {
      'Draft': { color: 'bg-orange-100 text-orange-800', text: 'Bozza', icon: Clock },
      'Posted': { color: 'bg-blue-100 text-blue-800', text: 'Registrato', icon: CheckCircle2 },
      'Validated': { color: 'bg-green-100 text-green-800', text: 'Validato', icon: Eye }
    };
    
    const { color, text, icon: IconComponent } = config[stato];
    return { color, text, IconComponent };
  };

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Render expanded row content (dettaglio movimento)
  const renderExpandedContent = (movimento: MovimentoContabileCompleto) => {
    const isExpanded = expandedRows.has(movimento.testata.codiceUnivocoScaricamento);
    if (!isExpanded) return null;

    return (
      <div className="bg-gray-50 p-6 border-t">
        <div className="space-y-6">
          {/* Informazioni Testata Dettagliate */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <FileText size={16} />
              Dettaglio Documento
            </h4>
            <div className="bg-white p-4 rounded-lg border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Causale:</span>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {movimento.testata.codiceCausale}
                    </Badge>
                    <div className="text-gray-700 mt-1">
                      {movimento.testata.causaleDecodificata}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Documento:</span>
                  <div className="text-gray-700 mt-1">
                    {movimento.testata.numeroDocumento || 'N/D'}
                  </div>
                  {movimento.testata.dataDocumento && (
                    <div className="text-xs text-gray-500 mt-1">
                      del {formatDate(movimento.testata.dataDocumento)}
                    </div>
                  )}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Soggetto:</span>
                  <div className="text-gray-700 mt-1">
                    {movimento.testata.soggettoResolve.denominazione || movimento.testata.soggettoResolve.sigla || 'N/D'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {movimento.testata.soggettoResolve.tipo}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Stato:</span>
                  <div className="mt-1">
                    {(() => {
                      const { color, text, IconComponent } = getStatoBadge(movimento.statoDocumento);
                      return (
                        <Badge variant="secondary" className={color}>
                          <IconComponent size={12} className="mr-1" />
                          {text}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Righe Contabili */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Database size={16} />
              Scrittura Contabile ({movimento.righeDettaglio.length} righe)
            </h4>
            <div className="border rounded-lg overflow-hidden w-full">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-24">Conto</TableHead>
                    <TableHead className="w-80">Denominazione</TableHead>
                    <TableHead className="w-28 text-right">Dare</TableHead>
                    <TableHead className="w-28 text-right">Avere</TableHead>
                    <TableHead className="w-40">Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimento.righeDettaglio.map((riga, index) => (
                    <TableRow key={`${movimento.testata.codiceUnivocoScaricamento}-riga-${index}`}>
                      <TableCell className="font-mono text-sm font-medium">
                        {(() => {
                          // Logica Sottoconto Intelligente per Cliente/Fornitore/Entrambi
                          if (riga.tipoConto === 'C' || riga.tipoConto === 'F' || riga.tipoConto === 'E') {
                            // Se abbiamo l'anagrafica risolta, usiamo il sottoconto appropriato
                            if (riga.anagrafica) {
                              if (riga.tipoConto === 'C') {
                                return riga.anagrafica.sottocontoCliente || riga.conto || riga.siglaConto || 'N/D';
                              } else if (riga.tipoConto === 'F') {
                                return riga.anagrafica.sottocontoFornitore || riga.conto || riga.siglaConto || 'N/D';
                              } else if (riga.tipoConto === 'E') {
                                // Per tipo "E" (Entrambi), determiniamo dal contesto
                                const importoDare = parseFloat((riga.importoDare || 0).toString());
                                const importoAvere = parseFloat((riga.importoAvere || 0).toString());
                                
                                // Se ha importo in DARE, agisce come Cliente (credito)
                                if (importoDare > 0 && importoAvere === 0) {
                                  return riga.anagrafica.sottocontoCliente || riga.conto || riga.siglaConto || 'N/D';
                                }
                                // Se ha importo in AVERE, agisce come Fornitore (debito)
                                if (importoAvere > 0 && importoDare === 0) {
                                  return riga.anagrafica.sottocontoFornitore || riga.conto || riga.siglaConto || 'N/D';
                                }
                                
                                // Fallback: usa sottoconto fornitore come default per tipo E
                                return riga.anagrafica.sottocontoFornitore || riga.anagrafica.sottocontoCliente || riga.conto || riga.siglaConto || 'N/D';
                              }
                            }
                            
                            // Fallback se non abbiamo anagrafica risolta
                            return riga.conto || riga.siglaConto || 'N/D';
                          }
                          
                          // Per righe normali, usa la logica esistente per piano dei conti
                          return (riga.conto && typeof riga.conto === 'object' ? (riga.conto as any).codice : riga.conto) || riga.siglaConto || 'N/D';
                        })()}
                      </TableCell>
                      <TableCell className="font-medium text-sm" title={riga.contoDenominazione}>
                        <div className="truncate">
                          {riga.contoDenominazione || 'Denominazione non disponibile'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {riga.importoDare > 0 ? 
                          <span className="font-semibold">{formatCurrency(riga.importoDare)}</span> : 
                          <span className="text-gray-400">-</span>
                        }
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {riga.importoAvere > 0 ? 
                          <span className="font-semibold">{formatCurrency(riga.importoAvere)}</span> : 
                          <span className="text-gray-400">-</span>
                        }
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-40">
                        <div className="truncate" title={riga.note || '-'}>
                          {riga.note || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Riga Totali */}
                  <TableRow className="bg-blue-50 font-bold border-t-2 border-blue-200">
                    <TableCell colSpan={2} className="font-bold text-blue-900">
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} />
                        TOTALI SCRITTURA:
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-blue-900">
                      {formatCurrency(movimento.totaliDare)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-blue-900">
                      {formatCurrency(movimento.totaliAvere)}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const sbilancio = Math.abs(movimento.totaliDare - movimento.totaliAvere);
                        const isQuadrata = sbilancio < 0.01;
                        return (
                          <Badge 
                            variant="secondary" 
                            className={isQuadrata ? 'bg-green-100 text-green-800 font-semibold' : 'bg-red-100 text-red-800 font-semibold'}
                          >
                            {isQuadrata ? <CheckCircle2 size={12} className="mr-1" /> : <AlertTriangle size={12} className="mr-1" />}
                            {isQuadrata ? 'Quadrata' : `Sbilanc. ${formatCurrency(sbilancio)}`}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Righe IVA */}
          {movimento.righeIva.length > 0 ? (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <DollarSign size={16} />
                Dettaglio IVA ({movimento.righeIva.length} righe)
              </h4>
              <div className="border rounded-lg overflow-hidden w-full">
                <Table className="w-full table-fixed">
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="w-20">Codice IVA</TableHead>
                      <TableHead className="w-40">Descrizione</TableHead>
                      <TableHead className="w-16 text-center">Aliquota</TableHead>
                      <TableHead className="w-20">Cod. Contropartita</TableHead>
                      <TableHead className="w-40">Desc. Contropartita</TableHead>
                      <TableHead className="w-24 text-right">Imponibile</TableHead>
                      <TableHead className="w-24 text-right">Imposta</TableHead>
                      <TableHead className="w-24 text-right">Totale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimento.righeIva.map((riga, index) => (
                      <TableRow key={`${movimento.testata.codiceUnivocoScaricamento}-iva-${index}`}>
                        <TableCell className="font-mono text-sm">
                          {riga.codiceIva}
                        </TableCell>
                        <TableCell>
                          {riga.matchedCodiceIva?.descrizione || 'N/D'}
                        </TableCell>
                        <TableCell className="text-center">
                          {riga.matchedCodiceIva?.aliquota ? `${riga.matchedCodiceIva.aliquota}%` : 'N/D'}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {riga.matchedContropartita?.codice || 'N/D'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {riga.matchedContropartita?.descrizione || 'N/D'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(riga.imponibile)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(riga.imposta)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(riga.importoLordo)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Nessuna riga IVA trovata</strong> per questo movimento contabile. 
                Verificare che i dati PNRIGIVA.TXT siano stati importati correttamente e che il 
                codice univoco di scaricamento sia consistente tra i file.
              </AlertDescription>
            </Alert>
          )}

          {/* Allocazioni Analitiche */}
          {movimento.allocazioni && movimento.allocazioni.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <TrendingUp size={16} />
                Centri di Costo ({movimento.allocazioni.length} allocazioni)
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <Table className="w-full table-fixed">
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="w-24">Rif. Riga</TableHead>
                      <TableHead>Centro di Costo</TableHead>
                      <TableHead>Parametro (Voce Analitica)</TableHead>
                      <TableHead>Commessa Rilevata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimento.allocazioni.map((alloc, index) => (
                      <TableRow key={`${movimento.testata.codiceUnivocoScaricamento}-alloc-${index}`}>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-xs">
                            {alloc.progressivoRigoContabile}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-gray-500">
                              {alloc.centroDiCosto}
                            </span>
                            <span className="text-sm">
                              {alloc.matchedCentroCosto?.descrizione || 'Centro di costo non trovato'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {alloc.parametro}
                        </TableCell>
                        <TableCell className="text-sm text-blue-600">
                          {alloc.matchedCommessa?.nome || <span className="text-gray-400">-</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render pagination controls
  const renderPagination = () => {
    if (!data?.pagination || data.pagination.totalPages <= 1) return null;

    const { page, totalPages } = data.pagination;
    const pages = [];
    
    // Previous button
    pages.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => handlePageChange(page - 1)}
      >
        ← Prec
      </Button>
    );
    
    // Page numbers (show up to 5 pages around current)
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);
    
    for (let p = startPage; p <= endPage; p++) {
      pages.push(
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(p)}
        >
          {p}
        </Button>
      );
    }
    
    // Next button
    pages.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => handlePageChange(page + 1)}
      >
        Succ →
      </Button>
    );

    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        {pages}
      </div>
    );
  };

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Errore nel caricamento:</strong> {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchMovimentiContabili}
            className="ml-3"
          >
            Riprova
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controlli */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="text-pink-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold">Movimenti Contabili Completi</h3>
            <p className="text-sm text-gray-600">
              Prima nota digitale con visualizzazione tipo gestionale tradizionale
            </p>
          </div>
        </div>
        <Button 
          onClick={fetchMovimentiContabili}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Caricando...' : 'Aggiorna'}
        </Button>
      </div>

      {/* Filtri */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter size={20} />
            Filtri di Ricerca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro Data Da */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Data Da
              </label>
              <Input
                type="date"
                value={pendingFilters.dataDa || ''}
                onChange={(e) => setPendingFilters(prev => ({ ...prev, dataDa: e.target.value || undefined }))}
                className="w-full"
              />
            </div>
            
            {/* Filtro Data A */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Data A
              </label>
              <Input
                type="date"
                value={pendingFilters.dataA || ''}
                onChange={(e) => setPendingFilters(prev => ({ ...prev, dataA: e.target.value || undefined }))}
                className="w-full"
              />
            </div>
            
            {/* Filtro Soggetto */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Soggetto
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  type="text"
                  placeholder="Cerca cliente/fornitore..."
                  value={pendingFilters.soggetto || ''}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, soggetto: e.target.value || undefined }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filtro Stato */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Stato
              </label>
              <select
                value={pendingFilters.stato || 'ALL'}
                onChange={(e) => setPendingFilters(prev => ({ ...prev, stato: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tutti</option>
                <option value="D">Bozze</option>
                <option value="P">Registrati</option>
                <option value="V">Validati</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button onClick={handleApplyFilters}>
              Applica Filtri
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiche */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tot. Movimenti</p>
                  <p className="text-2xl font-bold">{data.statistiche.totalMovimenti}</p>
                </div>
                <Database className="text-gray-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valore Totale</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(data.statistiche.totalImporto)}
                  </p>
                </div>
                <DollarSign className="text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Quadrati</p>
                  <p className="text-2xl font-bold text-green-600">{data.statistiche.movimentiQuadrati}</p>
                  <p className="text-xs text-gray-500">
                    {data.statistiche.totalMovimenti > 0 ? 
                      Math.round(data.statistiche.movimentiQuadrati / data.statistiche.totalMovimenti * 100) 
                      : 0}%
                  </p>
                </div>
                <CheckCircle2 className="text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Allocabili</p>
                  <p className="text-2xl font-bold text-purple-600">{data.statistiche.movimentiAllocabili}</p>
                  <p className="text-xs text-gray-500">
                    {data.statistiche.totalMovimenti > 0 ? 
                      Math.round(data.statistiche.movimentiAllocabili / data.statistiche.totalMovimenti * 100) 
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="text-purple-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabella Movimenti */}
      {data && data.movimenti.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Prima Nota - Movimenti Contabili ({data.pagination.total})</span>
              <div className="text-sm font-normal text-gray-500">
                Pagina {data.pagination.page} di {data.pagination.totalPages}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto w-full min-w-0">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-12 text-center"></TableHead>
                    <TableHead className="w-28">Data Reg.</TableHead>
                    <TableHead className="w-24">Protocollo</TableHead>
                    <TableHead className="w-32">Documento</TableHead>
                    <TableHead className="w-40">Causale</TableHead>
                    <TableHead className="w-44">Soggetto</TableHead>
                    <TableHead className="w-32 text-right">Totale Doc.</TableHead>
                    <TableHead className="w-24 text-center">Stato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.movimenti.map((movimento) => {
                    const isExpanded = expandedRows.has(movimento.testata.codiceUnivocoScaricamento);
                    const { color, text, IconComponent } = getStatoBadge(movimento.statoDocumento);
                    
                    return (
                      <React.Fragment key={movimento.testata.codiceUnivocoScaricamento}>
                        <TableRow 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleRowExpansion(movimento.testata.codiceUnivocoScaricamento)}
                        >
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6"
                            >
                              {isExpanded ? 
                                <ChevronDown size={14} /> : 
                                <ChevronRight size={14} />
                              }
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {formatDate(movimento.testata.dataRegistrazione)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                              {movimento.testata.codiceUnivocoScaricamento}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm min-w-0">
                              <div className="font-medium truncate">{movimento.testata.numeroDocumento || 'N/D'}</div>
                              {movimento.testata.dataDocumento && (
                                <div className="text-xs text-gray-500 font-mono">
                                  {formatDate(movimento.testata.dataDocumento)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm min-w-0">
                              <Badge variant="secondary" className="text-xs mb-1 font-mono">
                                {movimento.testata.codiceCausale}
                              </Badge>
                              <div className="text-gray-600 text-xs truncate" title={movimento.testata.causaleDecodificata}>
                                {movimento.testata.causaleDecodificata}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-0">
                              <User size={12} className="text-gray-400 flex-shrink-0" />
                              <div className="text-sm min-w-0 flex-1">
                                <div className="font-medium truncate" title={movimento.testata.soggettoResolve.denominazione || ''}>
                                  {movimento.testata.soggettoResolve.denominazione || 'Non Presente'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {(movimento.testata.soggettoResolve.tipo === 'CLIENTE' && 'CLI') ||
                                  (movimento.testata.soggettoResolve.tipo === 'FORNITORE' && 'FOR') ||
                                  null}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-mono font-medium text-sm">
                              {formatCurrency(Math.max(movimento.totaliDare, movimento.totaliAvere))}
                            </div>
                            <div className="text-xs">
                              {Math.abs(movimento.totaliDare - movimento.totaliAvere) < 0.01 ? 
                                <span className="text-green-600 font-medium">Quadrato</span> : 
                                <span className="text-red-600 font-medium">Sbilanciato</span>
                              }
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className={`${color} text-xs font-medium`}>
                              <IconComponent size={10} className="mr-1" />
                              {text}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        {/* Expanded content row */}
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={8} className="p-0 !border-t-4 !border-blue-200">
                              <div className="overflow-x-auto">
                                {renderExpandedContent(movimento)}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {renderPagination()}
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="animate-spin mr-3" size={20} />
              <span>Caricamento movimenti contabili...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {data && data.movimenti.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun movimento trovato</h3>
            <p className="text-gray-500 mb-4">
              Nessun movimento contabile corrisponde ai filtri selezionati.
            </p>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset Filtri
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Alert informativo */}
      <Alert className="border-pink-200 bg-pink-50">
        <Database className="h-4 w-4 text-pink-600" />
        <AlertDescription className="text-pink-800">
          <strong>Prima Nota Digitale:</strong> Questa sezione replica l'interfaccia di prima nota dei gestionali tradizionali. 
          Cliccare su una riga per espandere il dettaglio completo con Scrittura Contabile, IVA e Contabilità Analitica.
          I dati sono processati direttamente dallo staging per testing sicuro.
        </AlertDescription>
      </Alert>
    </div>
  );
};