import { RigaDaRiconciliare } from '@shared-types/index';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem as UiSelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Allocazione } from '@shared-types/index';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Definiamo qui il tipo per le opzioni dei select, dato che è un tipo di UI
export interface SelectItem {
    value: string;
    label: string;
}

interface AllocationFormProps {
  scrittura: RigaDaRiconciliare;
  commesse: SelectItem[];
  vociAnalitiche: SelectItem[];
  onSave: (allocations: Allocazione[]) => void;
}

export function AllocationForm({ scrittura, commesse, vociAnalitiche, onSave }: AllocationFormProps) {
  const { toast } = useToast();
  const [allocations, setAllocations] = useState<Partial<Allocazione>[]>([]);

  useEffect(() => {
    if (scrittura) {
        setAllocations([{
            commessaId: undefined,
            voceAnaliticaId: scrittura.voceAnaliticaSuggerita?.id,
            importo: scrittura.importo,
        }]);
    }
  }, [scrittura]);

  const totalAllocated = useMemo(() => {
    return allocations.reduce((sum, alloc) => sum + (alloc.importo || 0), 0);
  }, [allocations]);

  const isTotalMismatch = Math.abs(totalAllocated - scrittura.importo) > 0.01;

  const handleAllocationChange = (index: number, field: keyof Allocazione, value: string | number) => {
    const newAllocations = allocations.map((alloc, i) => {
        if (i === index) {
            return { ...alloc, [field]: value };
        }
        return alloc;
    });
    setAllocations(newAllocations);
  };

  const handleAddSplit = () => {
    setAllocations([...allocations, {
        commessaId: undefined,
        voceAnaliticaId: undefined,
        importo: 0
    }]);
  };

  const handleRemoveSplit = (index: number) => {
    const newAllocations = allocations.filter((_, i) => i !== index);
    setAllocations(newAllocations);
  };

  const handleSave = () => {
    const completeAllocations = allocations.filter(
        a => a.commessaId && a.voceAnaliticaId && a.importo
    ) as Allocazione[];
    
    if (completeAllocations.length !== allocations.length || isTotalMismatch) {
        toast({
            title: "Dati incompleti",
            description: "Assicurati di aver compilato tutti i campi (commessa, voce, importo) per ogni allocazione e che il totale corrisponda.",
            variant: "destructive"
        });
        return;
    }

    onSave(completeAllocations);
  }

  if (!scrittura) return null;

  return (
    <div className="space-y-4">
        {allocations.map((alloc, index) => (
            <div key={index} className="space-y-3 p-3 border rounded-md relative">
                {allocations.length > 1 && (
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => handleRemoveSplit(index)}
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor={`commessa-${index}`}>Commessa</Label>
                        <Select
                            value={alloc.commessaId}
                            onValueChange={(value) => handleAllocationChange(index, 'commessaId', value)}
                        >
                            <SelectTrigger id={`commessa-${index}`}>
                                <SelectValue placeholder="Seleziona commessa..." />
                            </SelectTrigger>
                            <SelectContent>
                                {commesse.map(c => <UiSelectItem key={c.value} value={c.value}>{c.label}</UiSelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor={`voce-${index}`}>Voce Analitica</Label>
                         <Select
                            value={alloc.voceAnaliticaId}
                            onValueChange={(value) => handleAllocationChange(index, 'voceAnaliticaId', value)}
                        >
                            <SelectTrigger id={`voce-${index}`}>
                                <SelectValue placeholder="Seleziona voce..." />
                            </SelectTrigger>
                            <SelectContent>
                                {vociAnalitiche.map(v => <UiSelectItem key={v.value} value={v.value}>{v.label}</UiSelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div>
                    <Label htmlFor={`importo-${index}`}>Importo</Label>
                    <Input
                        id={`importo-${index}`}
                        type="number"
                        value={alloc.importo || 0}
                        onChange={(e) => handleAllocationChange(index, 'importo', parseFloat(e.target.value))}
                    />
                </div>
            </div>
        ))}

        <div className="flex justify-between items-center mt-4">
            <Button variant="outline" size="sm" onClick={handleAddSplit}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Aggiungi Split
            </Button>
            {isTotalMismatch && (
                <div className="text-red-500 text-sm font-semibold">
                    Totale: {totalAllocated.toFixed(2)} / {scrittura.importo.toFixed(2)}
                </div>
            )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={handleSave} disabled={isTotalMismatch}>Salva Allocazione</Button>
        </div>
    </div>
  );
} 