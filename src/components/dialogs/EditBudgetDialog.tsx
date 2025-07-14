import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calculator, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { CommessaWithPerformance } from '@/api/commessePerformance';

interface EditBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commessa: CommessaWithPerformance;
  onSave: (budgetData: BudgetItem[]) => void;
}

interface BudgetItem {
  id?: string;
  voceAnaliticaId: string;
  voceAnaliticaNome: string;
  importo: number;
  note?: string;
}

export const EditBudgetDialog: React.FC<EditBudgetDialogProps> = ({
  open,
  onOpenChange,
  commessa,
  onSave
}) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    {
      voceAnaliticaId: '1',
      voceAnaliticaNome: 'Costi Diretti',
      importo: commessa.budget * 0.6,
      note: 'Budget per costi diretti del progetto'
    },
    {
      voceAnaliticaId: '2',
      voceAnaliticaNome: 'Costi Indiretti',
      importo: commessa.budget * 0.4,
      note: 'Budget per costi indiretti e overhead'
    }
  ]);

  const [newItem, setNewItem] = useState<Partial<BudgetItem>>({
    voceAnaliticaId: '',
    voceAnaliticaNome: '',
    importo: 0,
    note: ''
  });

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.importo, 0);
  const budgetDifference = totalBudget - commessa.budget;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const handleAddItem = () => {
    if (newItem.voceAnaliticaId && newItem.voceAnaliticaNome && newItem.importo) {
      setBudgetItems([...budgetItems, {
        ...newItem,
        id: Date.now().toString()
      } as BudgetItem]);
      setNewItem({
        voceAnaliticaId: '',
        voceAnaliticaNome: '',
        importo: 0,
        note: ''
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    setBudgetItems(budgetItems.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof BudgetItem, value: string | number) => {
    const updated = [...budgetItems];
    updated[index] = { ...updated[index], [field]: value };
    setBudgetItems(updated);
  };

  const handleSave = () => {
    onSave(budgetItems);
    onOpenChange(false);
  };

  const getBudgetStatusColor = () => {
    if (Math.abs(budgetDifference) < 100) return 'text-green-600';
    if (Math.abs(budgetDifference) < 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBudgetStatusIcon = () => {
    if (Math.abs(budgetDifference) < 100) return CheckCircle;
    return AlertTriangle;
  };

  const vociAnalitiche = [
    { id: '1', nome: 'Costi Diretti' },
    { id: '2', nome: 'Costi Indiretti' },
    { id: '3', nome: 'Materiali' },
    { id: '4', nome: 'Manodopera' },
    { id: '5', nome: 'Consulenze' },
    { id: '6', nome: 'Spese Generali' },
    { id: '7', nome: 'Margine Operativo' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Modifica Budget - {commessa.nome}
          </DialogTitle>
          <DialogDescription>
            Modifica la ripartizione del budget per le diverse voci analitiche della commessa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Riepilogo Budget */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-slate-600">Budget Originale</div>
                <div className="font-bold text-lg">{formatCurrency(commessa.budget)}</div>
              </div>
              <div>
                <div className="text-slate-600">Budget Ripartito</div>
                <div className="font-bold text-lg">{formatCurrency(totalBudget)}</div>
              </div>
              <div>
                <div className="text-slate-600">Differenza</div>
                <div className={`font-bold text-lg flex items-center gap-1 ${getBudgetStatusColor()}`}>
                  {React.createElement(getBudgetStatusIcon(), { className: "h-4 w-4" })}
                  {formatCurrency(budgetDifference)}
                </div>
              </div>
            </div>
          </div>

          {/* Voci Budget Esistenti */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Voci Budget</h3>
            <div className="space-y-3">
              {budgetItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <Label className="text-sm font-medium">Voce Analitica</Label>
                      <Select
                        value={item.voceAnaliticaId}
                        onValueChange={(value) => {
                          const voce = vociAnalitiche.find(v => v.id === value);
                          handleUpdateItem(index, 'voceAnaliticaId', value);
                          handleUpdateItem(index, 'voceAnaliticaNome', voce?.nome || '');
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {vociAnalitiche.map((voce) => (
                            <SelectItem key={voce.id} value={voce.id}>
                              {voce.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-3">
                      <Label className="text-sm font-medium">Importo</Label>
                      <Input
                        type="number"
                        value={item.importo}
                        onChange={(e) => handleUpdateItem(index, 'importo', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="col-span-4">
                      <Label className="text-sm font-medium">Note</Label>
                      <Input
                        value={item.note || ''}
                        onChange={(e) => handleUpdateItem(index, 'note', e.target.value)}
                        className="mt-1"
                        placeholder="Note opzionali"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aggiungi Nuova Voce */}
          <div className="border-dashed border-2 border-slate-300 rounded-lg p-4">
            <h4 className="font-medium mb-3">Aggiungi Nuova Voce</h4>
            <div className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-4">
                <Label className="text-sm font-medium">Voce Analitica</Label>
                <Select
                  value={newItem.voceAnaliticaId}
                  onValueChange={(value) => {
                    const voce = vociAnalitiche.find(v => v.id === value);
                    setNewItem({
                      ...newItem,
                      voceAnaliticaId: value,
                      voceAnaliticaNome: voce?.nome || ''
                    });
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleziona voce..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vociAnalitiche.map((voce) => (
                      <SelectItem key={voce.id} value={voce.id}>
                        {voce.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-3">
                <Label className="text-sm font-medium">Importo</Label>
                <Input
                  type="number"
                  value={newItem.importo}
                  onChange={(e) => setNewItem({ ...newItem, importo: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-4">
                <Label className="text-sm font-medium">Note</Label>
                <Input
                  value={newItem.note || ''}
                  onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                  className="mt-1"
                  placeholder="Note opzionali"
                />
              </div>
              
              <div className="col-span-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  disabled={!newItem.voceAnaliticaId || !newItem.importo}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Avvisi */}
          {Math.abs(budgetDifference) >= 100 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-800">Attenzione</div>
                  <div className="text-sm text-yellow-700">
                    Il budget ripartito non corrisponde al budget totale della commessa.
                    Differenza: {formatCurrency(budgetDifference)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleSave}>
            Salva Modifiche
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBudgetDialog;