import { useState, useCallback, useMemo } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Input } from '../ui/Input';
import { Alert, AlertDescription } from '../ui/Alert';

interface MovimentoContabile {
  id: string;
  numeroDocumento: string;
  dataDocumento: string;
  descrizione: string;
  importo: number;
  conto: { codice: string; nome: string } | null;
  allocazioni: Allocazione[];
  importoAllocato: number;
}

interface Allocazione {
  id: string;
  commessaId: string;
  voceAnaliticaId: string;
  importo: number;
  percentuale: number;
  commessa: { nome: string };
  voceAnalitica: { nome: string };
}

interface Commessa {
  id: string;
  nome: string;
  cliente: { nome: string } | null;
  stato: string;
  isAttiva: boolean;
}

interface VoceAnalitica {
  id: string;
  nome: string;
  tipo: 'costo' | 'ricavo';
  isAttiva: boolean;
}

interface AllocationItem {
  id: string;
  commessaId: string;
  voceAnaliticaId: string;
  percentuale: number;
  importo: number;
}

interface AllocationFormProps {
  movimento: MovimentoContabile;
  commesse: Commessa[];
  vociAnalitiche: VoceAnalitica[];
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
}

export const AllocationForm = ({
  movimento,
  commesse,
  vociAnalitiche,
  onSubmit,
  onCancel,
}: AllocationFormProps) => {
  const [allocations, setAllocations] = useState<AllocationItem[]>(() => {
    // Initialize with existing allocations if any
    if (movimento.allocazioni && movimento.allocazioni.length > 0) {
      return movimento.allocazioni.map((alloc, index) => ({
        id: `existing_${index}`,
        commessaId: alloc.commessaId,
        voceAnaliticaId: alloc.voceAnaliticaId,
        percentuale: alloc.percentuale,
        importo: alloc.importo,
      }));
    }
    // Start with one empty allocation
    return [{
      id: 'new_0',
      commessaId: '',
      voceAnaliticaId: '',
      percentuale: 100,
      importo: Math.abs(movimento.importo),
    }];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Format currency
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    const totalPercentage = allocations.reduce((sum, alloc) => sum + (alloc.percentuale || 0), 0);
    const totalAmount = allocations.reduce((sum, alloc) => sum + (alloc.importo || 0), 0);
    const remaining = Math.abs(movimento.importo) - totalAmount;
    return { totalPercentage, totalAmount, remaining };
  }, [allocations, movimento.importo]);

  // Add new allocation
  const addAllocation = useCallback(() => {
    const newId = `new_${Date.now()}`;
    const remainingPercentage = Math.max(0, 100 - totals.totalPercentage);
    const remainingAmount = Math.max(0, Math.abs(movimento.importo) - totals.totalAmount);
    
    setAllocations(prev => [...prev, {
      id: newId,
      commessaId: '',
      voceAnaliticaId: '',
      percentuale: remainingPercentage,
      importo: remainingAmount,
    }]);
  }, [totals, movimento.importo]);

  // Remove allocation
  const removeAllocation = useCallback((id: string) => {
    setAllocations(prev => prev.filter(alloc => alloc.id !== id));
  }, []);

  // Update allocation
  const updateAllocation = useCallback((id: string, field: keyof AllocationItem, value: unknown) => {
    setAllocations(prev => prev.map(alloc => {
      if (alloc.id !== id) return alloc;
      
      const updated = { ...alloc, [field]: value };
      
      // Auto-calculate importo from percentuale
      if (field === 'percentuale') {
        const percentage = Number(value) || 0;
        updated.importo = Math.round((Math.abs(movimento.importo) * percentage / 100) * 100) / 100;
      }
      
      // Auto-calculate percentuale from importo
      if (field === 'importo') {
        const amount = Number(value) || 0;
        if (Math.abs(movimento.importo) > 0) {
          updated.percentuale = Math.round((amount / Math.abs(movimento.importo)) * 10000) / 100;
        }
      }
      
      return updated;
    }));
  }, [movimento.importo]);

  // Auto-distribute remaining
  const distributeRemaining = useCallback(() => {
    if (allocations.length === 0) return;
    
    const equalPercentage = Math.floor(10000 / allocations.length) / 100; // Round to 2 decimals
    const equalAmount = Math.round((Math.abs(movimento.importo) * equalPercentage / 100) * 100) / 100;
    
    setAllocations(prev => prev.map((alloc, index) => {
      // Give any remaining fraction to the last allocation
      const isLast = index === prev.length - 1;
      const percentage = isLast ? (100 - (equalPercentage * (prev.length - 1))) : equalPercentage;
      const amount = isLast ? (Math.abs(movimento.importo) - (equalAmount * (prev.length - 1))) : equalAmount;
      
      return {
        ...alloc,
        percentuale: Math.round(percentage * 100) / 100,
        importo: Math.round(amount * 100) / 100,
      };
    }));
  }, [allocations.length, movimento.importo]);

  // Validate form
  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];
    
    if (allocations.length === 0) {
      errors.push('Aggiungi almeno un\'allocazione');
      return errors;
    }
    
    // Check required fields
    const incompleteAllocations = allocations.filter(alloc => 
      !alloc.commessaId || !alloc.voceAnaliticaId
    );
    if (incompleteAllocations.length > 0) {
      errors.push('Completa tutti i campi per ogni allocazione');
    }
    
    // Check percentages
    if (Math.abs(totals.totalPercentage - 100) > 0.01) {
      errors.push(`Le percentuali devono sommare a 100% (attuale: ${totals.totalPercentage.toFixed(2)}%)`);
    }
    
    // Check amounts
    const tolerance = 0.01;
    if (Math.abs(totals.remaining) > tolerance) {
      errors.push(`Gli importi devono sommare a ${formatCurrency(Math.abs(movimento.importo))} (mancano: ${formatCurrency(totals.remaining)})`);
    }
    
    return errors;
  }, [allocations, totals, movimento.importo, formatCurrency]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    const errors = validateForm();
    setValidationErrors(errors);
    
    if (errors.length > 0) return;
    
    setIsLoading(true);
    try {
      const allocationData = {
        movimentoId: movimento.id,
        allocazioni: allocations.map(alloc => ({
          commessaId: alloc.commessaId,
          voceAnaliticaId: alloc.voceAnaliticaId,
          importo: alloc.importo,
          percentuale: alloc.percentuale,
        })),
      };
      
      await onSubmit(allocationData);
    } catch (error) {
      console.error('Allocation submit error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, movimento.id, allocations, onSubmit]);

  // Filter voices by type and check if data is available
  const vociCosti = vociAnalitiche.filter(voce => voce.tipo === 'costo' && voce.isAttiva);
  const vociRicavi = vociAnalitiche.filter(voce => voce.tipo === 'ricavo' && voce.isAttiva);
  const vociToUse = movimento.importo < 0 ? vociCosti : vociRicavi;
  const commesseAttive = commesse.filter(c => c.isAttiva);

  // Check for empty dropdowns
  const hasCommesse = commesseAttive.length > 0;
  const hasVoci = vociToUse.length > 0;

  return (
    <div className="space-y-6">
      {/* Movement Info */}
      <Card>
        <CardHeader>
          <CardTitle>Dettagli Movimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">N. Documento:</span>
              <div className="font-medium">{movimento.numeroDocumento}</div>
            </div>
            <div>
              <span className="text-gray-500">Data:</span>
              <div className="font-medium">
                {(() => {
                  try {
                    const date = new Date(movimento.dataDocumento);
                    if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
                      return 'Data non disponibile';
                    }
                    return date.toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });
                  } catch {
                    return 'Data non disponibile';
                  }
                })()}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Importo:</span>
              <div className={`font-medium ${movimento.importo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(movimento.importo)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Conto:</span>
              <div className="font-medium">
                {movimento.conto ? `${movimento.conto.codice} - ${movimento.conto.nome}` : 'N/A'}
              </div>
            </div>
          </div>
          {movimento.descrizione && (
            <div className="mt-4">
              <span className="text-gray-500">Descrizione:</span>
              <div className="font-medium">{movimento.descrizione}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Availability Warnings */}
      {(!hasCommesse || !hasVoci) && (
        <Alert>
          <AlertDescription>
            <div className="space-y-1">
              {!hasCommesse && (
                <div>⚠️ Nessuna commessa attiva disponibile. Contatta l'amministratore per attivare delle commesse.</div>
              )}
              {!hasVoci && (
                <div>⚠️ Nessuna voce analitica di tipo "{movimento.importo < 0 ? 'costo' : 'ricavo'}" disponibile. Contatta l'amministratore per configurare le voci analitiche.</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Allocation Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Allocazioni</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={distributeRemaining}>
                <Calculator className="w-4 h-4 mr-1" />
                Distribuisci Equamente
              </Button>
              <Button variant="outline" size="sm" onClick={addAllocation}>
                <Plus className="w-4 h-4 mr-1" />
                Aggiungi
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allocations.map((allocation, index) => (
              <div key={allocation.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Allocazione {index + 1}</span>
                  {allocations.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAllocation(allocation.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commessa *
                    </label>
                    <Select
                      value={allocation.commessaId}
                      onValueChange={(value) => updateAllocation(allocation.id, 'commessaId', value)}
                      disabled={!hasCommesse}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !hasCommesse ? "Nessuna commessa disponibile" : "Seleziona commessa..."
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {hasCommesse ? (
                          commesseAttive.map(commessa => (
                            <SelectItem key={commessa.id} value={commessa.id}>
                              {commessa.nome}
                              {commessa.cliente && (
                                <span className="text-gray-500"> - {commessa.cliente.nome}</span>
                              )}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            Nessuna commessa attiva configurata
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Voce Analitica *
                    </label>
                    <Select
                      value={allocation.voceAnaliticaId}
                      onValueChange={(value) => updateAllocation(allocation.id, 'voceAnaliticaId', value)}
                      disabled={!hasVoci}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !hasVoci 
                            ? `Nessuna voce ${movimento.importo < 0 ? 'costo' : 'ricavo'} disponibile` 
                            : "Seleziona voce..."
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {hasVoci ? (
                          vociToUse.map(voce => (
                            <SelectItem key={voce.id} value={voce.id}>
                              {voce.nome}
                              <span className={`ml-2 text-xs px-1 py-0.5 rounded ${
                                voce.tipo === 'costo' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {voce.tipo}
                              </span>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            Nessuna voce {movimento.importo < 0 ? 'costo' : 'ricavo'} configurata
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Percentuale %
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={allocation.percentuale}
                      onChange={(e) => updateAllocation(allocation.id, 'percentuale', Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Importo €
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={allocation.importo}
                      onChange={(e) => updateAllocation(allocation.id, 'importo', Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Percentuale Totale:</span>
                <div className={`font-medium ${
                  Math.abs(totals.totalPercentage - 100) < 0.01 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totals.totalPercentage.toFixed(2)}%
                </div>
              </div>
              <div>
                <span className="text-gray-500">Importo Allocato:</span>
                <div className="font-medium">{formatCurrency(totals.totalAmount)}</div>
              </div>
              <div>
                <span className="text-gray-500">Residuo:</span>
                <div className={`font-medium ${
                  Math.abs(totals.remaining) < 0.01 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(totals.remaining)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert>
          <AlertDescription>
            <div className="space-y-1">
              {validationErrors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || validationErrors.length > 0 || !hasCommesse || !hasVoci}
        >
          {isLoading ? 'Salvataggio...' : 'Salva Allocazione'}
        </Button>
      </div>
    </div>
  );
};