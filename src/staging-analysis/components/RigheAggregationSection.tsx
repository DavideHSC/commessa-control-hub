import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../new_components/ui/Card';
import { Button } from '../../new_components/ui/Button';
import { Badge } from '../../new_components/ui/Badge';
import { Alert, AlertDescription } from '../../new_components/ui/Alert';
import { UnifiedTable } from '../../new_components/tables/UnifiedTable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../new_components/ui/Table';
import { 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Target,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { useStagingAnalysis } from '../hooks/useStagingAnalysis';

interface RigheAggregationSectionProps {
  refreshTrigger?: number;
}

export const RigheAggregationSection = ({ refreshTrigger }: RigheAggregationSectionProps) => {
  const { 
    fetchRigheAggregation, 
    getSectionState 
  } = useStagingAnalysis();

  const { loading, error, data, hasData } = getSectionState('righe');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandedRighe, setExpandedRighe] = useState<Set<string>>(new Set());

  // Auto-refresh quando cambia refreshTrigger
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchRigheAggregation();
    }
  }, [refreshTrigger, fetchRigheAggregation]);

  // Load data on mount
  useEffect(() => {
    if (!hasData && !loading) {
      fetchRigheAggregation();
    }
  }, [hasData, loading, fetchRigheAggregation]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  // Helper function per badge tipo riga
  const getTipoRigaBadge = (isAllocabile: boolean) => {
    if (isAllocabile) {
      return { label: '📊 Allocabile', color: 'bg-green-100 text-green-800' };
    }
    return { label: '⚠️ Non Allocabile', color: 'bg-red-100 text-red-800' };
  };

  // Prepare table data
  const tableData = useMemo(() => {
    if (!data?.scritture) return [];

    return data.scritture.map((scrittura: any) => ({
      id: scrittura.codiceUnivocoScaricamento,
      codiceUnivocoScaricamento: scrittura.codiceUnivocoScaricamento,
      dataRegistrazione: scrittura.dataRegistrazione,
      descrizione: scrittura.descrizione,
      causale: scrittura.causale,
      totaliDare: scrittura.totaliDare,
      totaliAvere: scrittura.totaliAvere,
      isQuadrata: scrittura.isQuadrata,
      allocationStatus: scrittura.allocationStatus,
      righeContabiliCount: scrittura.righeContabili?.length || 0,
      righeIvaCount: scrittura.righeIva?.length || 0,
      allocazioniCount: scrittura.allocazioni?.length || 0,
      righeContabili: scrittura.righeContabili || [],
      righeIva: scrittura.righeIva || [],
      allocazioni: scrittura.allocazioni || [],
      tipoMovimento: scrittura.tipoMovimento || 'ALTRO',
      causaleInterpretata: scrittura.causaleInterpretata || 'ALTRO',
      motivoNonAllocabile: scrittura.motivoNonAllocabile,
      suggerimentiAllocazione: scrittura.suggerimentiAllocazione || [],
      createdAt: new Date().toISOString(), // Placeholder
      updatedAt: new Date().toISOString(), // Placeholder
    }));
  }, [data]);

  // Table columns configuration
  const tableColumns = [
    {
      key: 'expand',
      header: '',
      sortable: false,
      width: '50px',
      render: (_: unknown, record: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleRowExpansion(record.id)}
          className="p-1"
        >
          {expandedRows.has(record.id) ? 
            <ChevronDown size={16} /> : 
            <ChevronRight size={16} />
          }
        </Button>
      )
    },
    {
      key: 'codiceUnivocoScaricamento',
      header: 'Codice Scrittura',
      sortable: true,
      render: (value: unknown) => {
        const codice = value as string;
        return (
          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
            {codice}
          </code>
        );
      }
    },
    {
      key: 'dataRegistrazione',
      header: 'Data',
      sortable: true,
      render: (value: unknown) => {
        const dateString = value as string;
        return (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm">{formatDate(dateString)}</span>
          </div>
        );
      }
    },
    {
      key: 'descrizione',
      header: 'Descrizione',
      sortable: true,
      render: (value: unknown) => {
        const descrizione = value as string;
        return (
          <div className="max-w-xs truncate" title={descrizione}>
            {descrizione}
          </div>
        );
      }
    },
    {
      key: 'tipoMovimento',
      header: 'Tipo Movimento',
      sortable: true,
      render: (value: unknown, record: any) => {
        const tipo = value as string;
        const tipoConfig = {
          'FATTURA_ACQUISTO': { color: 'bg-blue-100 text-blue-800', icon: TrendingDown, text: 'Fatt. Acq.' },
          'FATTURA_VENDITA': { color: 'bg-green-100 text-green-800', icon: TrendingUp, text: 'Fatt. Vend.' },
          'MOVIMENTO_FINANZIARIO': { color: 'bg-orange-100 text-orange-800', icon: DollarSign, text: 'Finanz.' },
          'ASSESTAMENTO': { color: 'bg-purple-100 text-purple-800', icon: Calendar, text: 'Assest.' },
          'GIRO_CONTABILE': { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: 'Giro' },
          'NOTA_CREDITO': { color: 'bg-yellow-100 text-yellow-800', icon: FileText, text: 'Nota C.' },
          'ALTRO': { color: 'bg-gray-100 text-gray-800', icon: FileText, text: 'Altro' }
        };
        
        const config = tipoConfig[tipo as keyof typeof tipoConfig] || tipoConfig.ALTRO;
        const IconComponent = config.icon;
        
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={config.color}>
              <IconComponent size={12} className="mr-1" />
              {config.text}
            </Badge>
            {!record.isAllocabile && (
              <div title={record.motivoNonAllocabile}>
                <AlertCircle size={12} className="text-red-500" />
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'totaliDare',
      header: 'Totale Dare',
      sortable: true,
      render: (value: unknown) => {
        const amount = value as number;
        return (
          <div className="text-right font-mono text-sm">
            {formatCurrency(amount)}
          </div>
        );
      }
    },
    {
      key: 'totaliAvere',
      header: 'Totale Avere',
      sortable: true,
      render: (value: unknown) => {
        const amount = value as number;
        return (
          <div className="text-right font-mono text-sm">
            {formatCurrency(amount)}
          </div>
        );
      }
    },
    {
      key: 'isQuadrata',
      header: 'Quadratura',
      sortable: true,
      render: (value: unknown) => {
        const isQuadrata = value as boolean;
        return (
          <Badge 
            variant="secondary" 
            className={isQuadrata ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
          >
            {isQuadrata ? <CheckCircle2 size={12} className="mr-1" /> : <AlertTriangle size={12} className="mr-1" />}
            {isQuadrata ? 'OK' : 'KO'}
          </Badge>
        );
      }
    },
    {
      key: 'allocationStatus',
      header: 'Allocazione',
      sortable: true,
      render: (value: unknown) => {
        const status = value as string;
        const statusConfig = {
          'non_allocato': { color: 'bg-red-100 text-red-800', text: 'Non Allocato' },
          'parzialmente_allocato': { color: 'bg-yellow-100 text-yellow-800', text: 'Parziale' },
          'completamente_allocato': { color: 'bg-green-100 text-green-800', text: 'Completo' }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { color: 'bg-gray-100 text-gray-800', text: status };
        
        return (
          <Badge variant="secondary" className={config.color}>
            {config.text}
          </Badge>
        );
      }
    },
    {
      key: 'righeContabiliCount',
      header: 'Dettagli',
      sortable: false,
      render: (_: unknown, record: any) => (
        <div className="text-xs text-gray-600">
          <div>{record.righeContabiliCount} righe</div>
          <div>{record.righeIvaCount} IVA</div>
          <div>{record.allocazioniCount} alloc.</div>
        </div>
      )
    },
    {
      key: 'suggerimentiAllocazione',
      header: 'Suggerimenti',
      sortable: false,
      render: (_: unknown, record: any) => {
        const suggerimenti = record.suggerimentiAllocazione || [];
        const hasHighConfidence = suggerimenti.some((s: any) => s.confidenza > 70);
        
        if (suggerimenti.length === 0) {
          return (
            <span className="text-xs text-gray-400">Nessuno</span>
          );
        }
        
        return (
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={hasHighConfidence ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
            >
              <Lightbulb size={10} className="mr-1" />
              {suggerimenti.length}
            </Badge>
            {hasHighConfidence && (
              <span className="text-xs text-green-600 font-medium">Alta</span>
            )}
          </div>
        );
      }
    }
  ];

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

  const toggleRigaExpansion = (recordId: string, rigaIndex: number) => {
    const rigaId = `${recordId}-${rigaIndex}`;
    setExpandedRighe(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rigaId)) {
        newSet.delete(rigaId);
      } else {
        newSet.add(rigaId);
      }
      return newSet;
    });
  };

  // Render expanded row content
  const renderExpandedContent = (record: any) => {
    if (!expandedRows.has(record.id)) return null;

    return (
      <div className="bg-gray-50 p-4 border-t">
        {/* Sezione suggerimenti in evidenza */}
        {record.suggerimentiAllocazione && record.suggerimentiAllocazione.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Lightbulb size={16} className="text-yellow-600" />
              Suggerimenti di Allocazione ({record.suggerimentiAllocazione.length})
            </h4>
            <div className="bg-white p-3 rounded border">
              <div className="space-y-2">
                {record.suggerimentiAllocazione.slice(0, 3).map((sugg: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Riga {sugg.rigaProgressivo}
                      </Badge>
                      <span className="font-medium">{sugg.voceAnalitica}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{sugg.motivazione}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${sugg.confidenza > 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {sugg.confidenza}%
                      </Badge>
                    </div>
                  </div>
                ))}
                {record.suggerimentiAllocazione.length > 3 && (
                  <div className="text-xs text-gray-500 text-center pt-2">
                    ... e altri {record.suggerimentiAllocazione.length - 3} suggerimenti
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT VERTICALE PROFESSIONALE */}
        <div className="space-y-6">
          {/* Righe Contabili - Tabella Semplificata */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <FileText size={16} />
              Righe Contabili ({record.righeContabili.length})
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Conto</TableHead>
                    <TableHead>Denominazione</TableHead>
                    <TableHead className="text-right">Dare</TableHead>
                    <TableHead className="text-right">Avere</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {record.righeContabili.map((riga: any, index: number) => {
                    const hasDetails = riga.voceAnaliticaSuggerita || !riga.isAllocabile || riga.contoDescrizione;
                    return (
                      <>
                        <TableRow key={index} className={hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}>
                          <TableCell>
                            {hasDetails && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRigaExpansion(record.id, index)}
                                className="p-1"
                              >
                                {expandedRighe.has(`${record.id}-${index}`) ? 
                                  <ChevronDown size={14} /> : 
                                  <ChevronRight size={14} />
                                }
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {riga.conto || riga.siglaConto}
                          </TableCell>
                          <TableCell className="font-medium">
                            {riga.contoDenominazione || 'N/D'}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {riga.importoDare > 0 ? formatCurrency(riga.importoDare) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {riga.importoAvere > 0 ? formatCurrency(riga.importoAvere) : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {riga.note || '-'}
                          </TableCell>
                        </TableRow>
                        {/* Riga espandibile per dettagli */}
                        {hasDetails && expandedRighe.has(`${record.id}-${index}`) && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-gray-50 p-4">
                              <div className="space-y-3">
                                {/* Tipo e Allocabilità */}
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Tipo:</span>
                                    <Badge variant="secondary" className={`text-xs ${getTipoRigaBadge(riga.isAllocabile).color}`}>
                                      {getTipoRigaBadge(riga.isAllocabile).label}
                                    </Badge>
                                  </div>
                                  {!riga.isAllocabile && riga.motivoNonAllocabile && (
                                    <div className="flex items-center gap-2">
                                      <AlertCircle size={14} className="text-red-500" />
                                      <span className="text-sm text-red-600">{riga.motivoNonAllocabile}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Descrizione aggiuntiva */}
                                {riga.contoDescrizione && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Descrizione:</span>
                                    <span className="text-sm text-gray-600">{riga.contoDescrizione}</span>
                                  </div>
                                )}
                                
                                {/* Suggerimenti */}
                                {riga.voceAnaliticaSuggerita && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Suggerimento:</span>
                                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                      <Lightbulb size={12} className="mr-1" />
                                      {riga.voceAnaliticaSuggerita}
                                    </Badge>
                                  </div>
                                )}

                                {/* Dati CONTIGEN (se disponibili) */}
                                {riga.contigenData && (
                                  <div className="border-t pt-3 mt-3">
                                    <h5 className="text-sm font-medium mb-2 text-blue-700">Tracciabilità CONTIGEN</h5>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">Codifica:</span>
                                        <code className="text-xs bg-blue-100 px-2 py-1 rounded">{riga.contigenData.codifica}</code>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">Tipo:</span>
                                        <Badge variant="secondary" className="text-xs">
                                          {riga.contigenData.tipo === 'P' ? 'Patrimoniale' : 
                                           riga.contigenData.tipo === 'E' ? 'Economico' :
                                           riga.contigenData.tipo === 'C' ? 'Cliente' :
                                           riga.contigenData.tipo === 'F' ? 'Fornitore' : 
                                           riga.contigenData.tipo}
                                        </Badge>
                                      </div>
                                      {riga.contigenData.sigla && (
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">Sigla:</span>
                                          <span className="text-gray-600">{riga.contigenData.sigla}</span>
                                        </div>
                                      )}
                                      {riga.contigenData.gruppo && (
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">Gruppo:</span>
                                          <Badge variant="secondary" className="text-xs">
                                            {riga.contigenData.gruppo === 'A' ? 'Attività' :
                                             riga.contigenData.gruppo === 'C' ? 'Costo' :
                                             riga.contigenData.gruppo === 'P' ? 'Passività' :
                                             riga.contigenData.gruppo === 'R' ? 'Ricavo' :
                                             riga.contigenData.gruppo === 'N' ? 'Patrimonio Netto' :
                                             riga.contigenData.gruppo}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Match Quality (se disponibile) */}
                                {(riga.matchType || riga.matchConfidence !== undefined) && (
                                  <div className="border-t pt-3 mt-3">
                                    <h5 className="text-sm font-medium mb-2 text-purple-700">Qualità Matching</h5>
                                    <div className="flex items-center gap-3">
                                      {riga.matchType && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">Tipo:</span>
                                          <Badge 
                                            variant="secondary" 
                                            className={`text-xs ${
                                              riga.matchType === 'exact' ? 'bg-green-100 text-green-800' :
                                              riga.matchType === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                              riga.matchType === 'fallback' ? 'bg-orange-100 text-orange-800' :
                                              'bg-red-100 text-red-800'
                                            }`}
                                          >
                                            {riga.matchType === 'exact' ? 'Esatto' :
                                             riga.matchType === 'partial' ? 'Parziale' :
                                             riga.matchType === 'fallback' ? 'Fallback' : 
                                             'Nessuno'}
                                          </Badge>
                                        </div>
                                      )}
                                      {riga.matchConfidence !== undefined && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">Confidenza:</span>
                                          <div className="flex items-center gap-1">
                                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                                              <div 
                                                className={`h-2 rounded-full ${
                                                  riga.matchConfidence >= 80 ? 'bg-green-500' :
                                                  riga.matchConfidence >= 60 ? 'bg-yellow-500' :
                                                  'bg-red-500'
                                                }`}
                                                style={{ width: `${riga.matchConfidence}%` }}
                                              ></div>
                                            </div>
                                            <span className="text-xs text-gray-600">{riga.matchConfidence}%</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                  
                  {/* Riga Totali in calce */}
                  <TableRow className="bg-gray-100 font-medium border-t-2">
                    <TableCell></TableCell>
                    <TableCell colSpan={2} className="font-semibold">TOTALI:</TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(record.righeContabili.reduce((sum: number, r: any) => sum + r.importoDare, 0))}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(record.righeContabili.reduce((sum: number, r: any) => sum + r.importoAvere, 0))}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const totaleDare = record.righeContabili.reduce((sum: number, r: any) => sum + r.importoDare, 0);
                        const totaleAvere = record.righeContabili.reduce((sum: number, r: any) => sum + r.importoAvere, 0);
                        const sbilancio = Math.abs(totaleDare - totaleAvere);
                        const isQuadrata = sbilancio < 0.01;
                        
                        return (
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className={isQuadrata ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {isQuadrata ? <CheckCircle2 size={12} className="mr-1" /> : <AlertTriangle size={12} className="mr-1" />}
                              {isQuadrata ? 'OK' : `Sbil. ${formatCurrency(sbilancio)}`}
                            </Badge>
                          </div>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Righe IVA - Layout Professionale */}
          {record.righeIva.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <DollarSign size={16} />
                Righe IVA ({record.righeIva.length})
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Codice IVA</TableHead>
                      <TableHead>Denominazione</TableHead>
                      <TableHead>Aliquota</TableHead>
                      <TableHead>Contropartita</TableHead>
                      <TableHead className="text-right">Imponibile</TableHead>
                      <TableHead className="text-right">Imposta</TableHead>
                      <TableHead className="text-right">Totale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {record.righeIva.map((riga: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">
                          {riga.codiceIva}
                        </TableCell>
                        <TableCell>
                          {riga.matchedCodiceIva?.descrizione || 'N/D'}
                        </TableCell>
                        <TableCell>
                          {riga.matchedCodiceIva?.aliquota ? `${riga.matchedCodiceIva.aliquota}%` : 'N/D'}
                        </TableCell>
                        <TableCell>
                          {riga.contropartita || '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(riga.imponibile)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(riga.imposta)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatCurrency(riga.importoLordo)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Allocazioni - Layout Migliorato */}
          {record.allocazioni.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Target size={16} />
                Allocazioni ({record.allocazioni.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {record.allocazioni.map((alloc: any, index: number) => (
                  <div key={index} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">{alloc.centroDiCosto}</div>
                      <Badge variant="secondary" className="text-xs">
                        Riga {alloc.progressivoRigoContabile}
                      </Badge>
                    </div>
                    <div className="text-gray-600 text-sm">{alloc.parametro}</div>
                    {alloc.importo && (
                      <div className="text-right mt-2 font-mono text-sm">
                        {formatCurrency(alloc.importo)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleRefresh = () => {
    fetchRigheAggregation();
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
            onClick={handleRefresh}
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
      {/* Header con statistiche */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-green-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold">Aggregazione Righe Contabili</h3>
            <p className="text-sm text-gray-600">
              Aggregazione virtuale dei dati staging per formare scritture complete
            </p>
          </div>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Aggregando...' : 'Aggiorna'}
        </Button>
      </div>

      {/* Statistiche */}
      {data && (
        <>
          {/* Statistiche principali */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Scritture Totali</p>
                    <p className="text-2xl font-bold">{data.totalScrittureCount}</p>
                  </div>
                  <FileText className="text-gray-400" size={24} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Quadrate</p>
                    <p className="text-2xl font-bold text-green-600">{data.quadrateScrittureCount}</p>
                  </div>
                  <CheckCircle2 className="text-green-400" size={24} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Righe Allocabili</p>
                    <p className="text-2xl font-bold text-blue-600">{data.totalRigheAllocabili || 0}</p>
                    <p className="text-xs text-gray-500">
                      {data.percentualeAllocabilita?.toFixed(1) || 0}% del totale
                    </p>
                  </div>
                  <Target className="text-blue-400" size={24} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Righe Totali</p>
                    <p className="text-2xl font-bold text-purple-600">{data.totalRigheCount}</p>
                  </div>
                  <FileText className="text-purple-400" size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistiche per tipologia movimento */}
          {data.movimentiAggregati && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-600" />
                  Analisi per Tipologia Movimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Fatture Acquisto */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="text-blue-600" size={16} />
                      <h4 className="font-medium text-blue-900">Fatture Acquisto</h4>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Scritture:</span>
                        <span className="font-medium">{data.movimentiAggregati.fattureAcquisto?.count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Allocabili:</span>
                        <span className="font-medium text-blue-600">{data.movimentiAggregati.fattureAcquisto?.allocabili || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Totale:</span>
                        <span className="font-medium">{formatCurrency(data.movimentiAggregati.fattureAcquisto?.totaleImporto || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fatture Vendita */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="text-green-600" size={16} />
                      <h4 className="font-medium text-green-900">Fatture Vendita</h4>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Scritture:</span>
                        <span className="font-medium">{data.movimentiAggregati.fattureVendita?.count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Allocabili:</span>
                        <span className="font-medium text-green-600">{data.movimentiAggregati.fattureVendita?.allocabili || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Totale:</span>
                        <span className="font-medium">{formatCurrency(data.movimentiAggregati.fattureVendita?.totaleImporto || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Movimenti Finanziari */}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="text-orange-600" size={16} />
                      <h4 className="font-medium text-orange-900">Mov. Finanziari</h4>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Scritture:</span>
                        <span className="font-medium">{data.movimentiAggregati.movimentiFinanziari?.count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Allocabili:</span>
                        <span className="font-medium text-gray-500">0 (Mai)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Totale:</span>
                        <span className="font-medium">{formatCurrency(data.movimentiAggregati.movimentiFinanziari?.totaleImporto || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assestamenti */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="text-purple-600" size={16} />
                      <h4 className="font-medium text-purple-900">Assestamenti</h4>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Scritture:</span>
                        <span className="font-medium">{data.movimentiAggregati.assestamenti?.count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Allocabili:</span>
                        <span className="font-medium text-purple-600">{data.movimentiAggregati.assestamenti?.allocabili || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Totale:</span>
                        <span className="font-medium">{formatCurrency(data.movimentiAggregati.assestamenti?.totaleImporto || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Giro Contabili */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="text-gray-600" size={16} />
                      <h4 className="font-medium text-gray-900">Giro Contabili</h4>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Scritture:</span>
                        <span className="font-medium">{data.movimentiAggregati.giroContabili?.count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Allocabili:</span>
                        <span className="font-medium text-gray-500">0 (Mai)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Totale:</span>
                        <span className="font-medium">{formatCurrency(data.movimentiAggregati.giroContabili?.totaleImporto || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <Lightbulb className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Aggregazione Intelligente:</strong> Le scritture sono classificate automaticamente per tipo movimento (Fatture, Pagamenti, Giroconti). 
          Il sistema identifica righe allocabili e suggerisce voci analitiche basandosi sui pattern del documento esempi-registrazioni.md.
          Cliccare su una riga per espandere dettagli e suggerimenti.
        </AlertDescription>
      </Alert>

      {/* Tabella dati */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Scritture Aggregate ({tableData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UnifiedTable
              data={tableData}
              columns={tableColumns}
              loading={loading}
              emptyMessage="Nessuna scrittura trovata nei dati staging"
              className="min-h-[400px]"
              expandedContent={renderExpandedContent}
              showActions={false}
            />
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && !hasData && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="animate-spin mr-3" size={20} />
              <span>Aggregando righe contabili da staging...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};