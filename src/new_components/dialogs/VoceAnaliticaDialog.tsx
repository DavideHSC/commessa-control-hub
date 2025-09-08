import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import { Textarea } from '../ui/Textarea.tsx';
import { Plus, Edit, AlertCircle } from 'lucide-react';

interface VoceAnalitica {
  id: string;
  nome: string;
  descrizione?: string;
  tipo: 'costo' | 'ricavo';
  isAttiva: boolean;
}

interface VoceAnaliticaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voce?: VoceAnalitica;
  onSave: (data: VoceAnaliticaFormData) => void;
  loading?: boolean;
}

interface VoceAnaliticaFormData {
  nome: string;
  descrizione?: string;
  tipo: 'costo' | 'ricavo';
}

export const VoceAnaliticaDialog: React.FC<VoceAnaliticaDialogProps> = ({
  open,
  onOpenChange,
  voce,
  onSave,
  loading = false
}) => {
  const [formData, setFormData] = useState<VoceAnaliticaFormData>({
    nome: '',
    descrizione: '',
    tipo: 'costo'
  });

  const [errors, setErrors] = useState<Partial<VoceAnaliticaFormData>>({});

  const isEdit = !!voce;

  // Reset form when dialog opens/closes or voce changes
  useEffect(() => {
    if (open) {
      if (voce) {
        // Normalize the tipo value to ensure it matches our expected values
        let normalizedTipo: 'costo' | 'ricavo' = 'costo';
        if (voce.tipo) {
          const tipoLowerCase = String(voce.tipo).toLowerCase();
          if (tipoLowerCase === 'costo' || tipoLowerCase === 'ricavo') {
            normalizedTipo = tipoLowerCase as 'costo' | 'ricavo';
          }
        }
        
        setFormData({
          nome: voce.nome,
          descrizione: voce.descrizione || '',
          tipo: normalizedTipo
        });
      } else {
        setFormData({
          nome: '',
          descrizione: '',
          tipo: 'costo'
        });
      }
      setErrors({});
    }
  }, [open, voce]);

  const validateForm = (): boolean => {
    const newErrors: Partial<VoceAnaliticaFormData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Il nome è obbligatorio';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Il nome deve contenere almeno 2 caratteri';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Il tipo è obbligatorio' as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? (
              <>
                <Edit className="h-5 w-5" />
                Modifica Voce Analitica
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Nuova Voce Analitica
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Modifica i dettagli della voce analitica selezionata.'
              : 'Crea una nuova voce analitica per l\'allocazione dei costi.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Es. Carburanti e Lubrificanti"
              className={errors.nome ? 'border-red-500' : ''}
            />
            {errors.nome && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.nome}
              </div>
            )}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              key={`tipo-select-${open}-${voce?.id || 'new'}`}
              value={formData.tipo}
              onValueChange={(value: 'costo' | 'ricavo') => 
                setFormData(prev => ({ ...prev, tipo: value }))
              }
            >
              <SelectTrigger className={errors.tipo ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleziona il tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="costo">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></div>
                    Costo
                  </div>
                </SelectItem>
                <SelectItem value="ricavo">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div>
                    Ricavo
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.tipo}
              </div>
            )}
          </div>

          {/* Descrizione */}
          <div className="space-y-2">
            <Label htmlFor="descrizione">Descrizione</Label>
            <Textarea
              id="descrizione"
              value={formData.descrizione}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, descrizione: e.target.value }))}
              placeholder="Descrizione opzionale della voce analitica..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvataggio...' : (isEdit ? 'Salva Modifiche' : 'Crea Voce')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VoceAnaliticaDialog;
