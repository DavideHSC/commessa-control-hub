import { useState, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../new_components/ui/Card';
import { Button } from '../../../new_components/ui/Button';
import { Badge } from '../../../new_components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../new_components/ui/Table';
import { 
  ChevronRight, 
  ChevronDown, 
  Database,
  DollarSign,
  User,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye
} from 'lucide-react';
import { MovimentoAllocabile, AllocationSuggestion } from '../../types/stagingAnalysisTypes';

interface MovimentiAllocabiliTableProps {
  movimenti: MovimentoAllocabile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onMovimentoSelect: (movimento: MovimentoAllocabile) => void;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export const MovimentiAllocabiliTable = ({ 
  movimenti, 
  pagination, 
  onMovimentoSelect, 
  onPageChange,
  loading 
}: MovimentiAllocabiliTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
      'Draft': { color: 'bg-orange-100 text-orange-800', text: 'Bozza', IconComponent: Clock },
      'Posted': { color: 'bg-blue-100 text-blue-800', text: 'Registrato', IconComponent: CheckCircle2 },
      'Validated': { color: 'bg-green-100 text-green-800', text: 'Validato', IconComponent: Eye }
    };
    
    return config[stato];
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

  const getSuggerimentiSummary = (movimento: MovimentoAllocabile) => {
    const totalMOVANAC = movimento.suggerimentiMOVANAC.length;
    const totalRegole = movimento.suggerimentiRegole.length;
    const highConfidence = movimento.suggerimentiRegole.filter(s => s.confidenza >= 70).length;
    
    return { totalMOVANAC, totalRegole, highConfidence };
  };

  const renderExpandedContent = (movimento: MovimentoAllocabile) => {
    const isExpanded = expandedRows.has(movimento.testata.codiceUnivocoScaricamento);
    if (!isExpanded) return null;

    const { totalMOVANAC, totalRegole, highConfidence } = getSuggerimentiSummary(movimento);

    return (
      <div className="bg-gray-50 p-6 border-t">
        <div className="space-y-6">
          {/* Righe Allocabili */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Database size={16} />
              Righe Allocabili ({movimento.righeLavorabili.length})
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-24">Conto</TableHead>
                    <TableHead className="w-60">Denominazione</TableHead>
                    <TableHead className="w-28 text-right">Dare</TableHead>
                    <TableHead className="w-28 text-right">Avere</TableHead>
                    <TableHead className="w-20 text-center">Allocabile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimento.righeLavorabili.map((riga, index) => (
                    <TableRow key={`${movimento.testata.codiceUnivocoScaricamento}-riga-allocabile-${index}`}>
                      <TableCell className="font-mono text-sm">
                        {(riga.conto && typeof riga.conto === 'object' ? (riga.conto as any).codice : riga.conto) || riga.siglaConto || 'N/D'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {riga.contoDenominazione || 'N/D'}
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
                      <TableCell className="text-center">
                        {riga.isAllocabile && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle2 size={12} className="mr-1" />
                            Sì
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Suggerimenti Disponibili */}
          {(totalMOVANAC > 0 || totalRegole > 0) && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Lightbulb size={16} />
                Suggerimenti Disponibili
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MOVANAC */}
                {totalMOVANAC > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-green-100">
                            <CheckCircle2 size={14} className="text-green-600" />
                          </div>
                          <span className="font-medium text-sm">MOVANAC Predefinite</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">{totalMOVANAC}</Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        Allocazioni già definite nei dati staging
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Regole DETTANAL */}
                {totalRegole > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-blue-100">
                            <Database size={14} className="text-blue-600" />
                          </div>
                          <span className="font-medium text-sm">Regole DETTANAL</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">{totalRegole}</Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {highConfidence} ad alta confidenza (≥70%)
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Azione per procedere */}
          <div className="flex justify-end">
            <Button 
              onClick={() => onMovimentoSelect(movimento)}
              className="flex items-center gap-2"
            >
              <Lightbulb size={16} />
              Procedi con Allocazione
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    
    // Previous button
    pages.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        disabled={pagination.page === 1}
        onClick={() => onPageChange(pagination.page - 1)}
      >
        ← Prec
      </Button>
    );
    
    // Page numbers (show up to 5 pages around current)
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.totalPages, pagination.page + 2);
    
    for (let p = startPage; p <= endPage; p++) {
      pages.push(
        <Button
          key={p}
          variant={p === pagination.page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(p)}
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
        disabled={pagination.page === pagination.totalPages}
        onClick={() => onPageChange(pagination.page + 1)}
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Database className="animate-pulse mr-3" size={20} />
            <span>Caricamento movimenti allocabili...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (movimenti.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Database className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun movimento allocabile</h3>
          <p className="text-gray-500">
            Nessun movimento corrisponde ai filtri o tutti sono già completamente allocati.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Movimenti Allocabili ({pagination.total})</span>
          <div className="text-sm font-normal text-gray-500">
            Pagina {pagination.page} di {pagination.totalPages}
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
                <TableHead className="w-32">Documento</TableHead>
                <TableHead className="w-44">Soggetto</TableHead>
                <TableHead className="w-32 text-right">Totale Doc.</TableHead>
                <TableHead className="w-20 text-center">Righe</TableHead>
                <TableHead className="w-24 text-center">Suggerimenti</TableHead>
                <TableHead className="w-24 text-center">Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimenti.map((movimento) => {
                const isExpanded = expandedRows.has(movimento.testata.codiceUnivocoScaricamento);
                const { color, text, IconComponent } = getStatoBadge(movimento.statoDocumento);
                const { totalMOVANAC, totalRegole } = getSuggerimentiSummary(movimento);
                
                return (
                  <Fragment key={movimento.testata.codiceUnivocoScaricamento}>
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
                        {formatDate(movimento.testata.dataRegistrazione)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium truncate">{movimento.testata.numeroDocumento || 'N/D'}</div>
                          {movimento.testata.dataDocumento && (
                            <div className="text-xs text-gray-500 font-mono">
                              {formatDate(movimento.testata.dataDocumento)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-0">
                          <User size={12} className="text-gray-400 flex-shrink-0" />
                          <div className="text-sm min-w-0 flex-1">
                            <div className="font-medium truncate" title={movimento.testata.soggettoResolve.denominazione || ''}>
                              {movimento.testata.soggettoResolve.denominazione || 'Non Presente'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-mono font-medium text-sm">
                          {formatCurrency(Math.max(movimento.totaliDare, movimento.totaliAvere))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          {movimento.righeLavorabili.length}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          {totalMOVANAC > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              M:{totalMOVANAC}
                            </Badge>
                          )}
                          {totalRegole > 0 && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              R:{totalRegole}
                            </Badge>
                          )}
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
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {renderPagination()}
      </CardContent>
    </Card>
  );
};
