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

interface RegolaRipartizione {
  id: string;
  descrizione: string;
  commessaId: string;
  percentuale: number;
  contoId: string;
  voceAnaliticaId: string;
  createdAt: string;
  // Relations
  commessa?: {
    id: string;
    nome: string;
  };
  conto?: {
    id: string;
    nome: string;
  };
  voceAnalitica?: {
    id: string;
    nome: string;
  };
}

interface RegolaRipartizioneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regola?: RegolaRipartizione;
  onSave: (data: RegolaRipartizioneFormData) => void;
  loading?: boolean;
}

interface RegolaRipartizioneFormData {
  descrizione: string;
  commessaId: string;
  percentuale: number;
  contoId: string;
  voceAnaliticaId: string;
}

interface DropdownOption {
  id: string;
  nome: string;
}

export const RegolaRipartizioneDialog: React.FC<RegolaRipartizioneDialogProps> = ({
  open,
  onOpenChange,
  regola,
  onSave,
  loading = false
}) => {
  const [formData, setFormData] = useState<RegolaRipartizioneFormData>({
    descrizione: '',
    commessaId: '',
    percentuale: 0,
    contoId: '',
    voceAnaliticaId: ''
  });

  const [errors, setErrors] = useState<Partial<RegolaRipartizioneFormData>>({});
  const [commesse, setCommesse] = useState<DropdownOption[]>([]);
  const [conti, setConti] = useState<DropdownOption[]>([]);
  const [vociAnalitiche, setVociAnalitiche] = useState<DropdownOption[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const isEdit = !!regola;

  // Fetch dropdown data
  useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  const fetchDropdownData = async () => {
    setLoadingData(true);
    try {
      // Fetch in parallel - Using more efficient endpoints
      const [commesseRes, contiRes, vociRes] = await Promise.all([
        fetch('/api/commesse'),
        fetch('/api/conti/select'), // More efficient endpoint for dropdowns
        fetch('/api/voci-analitiche')
      ]);

      if (commesseRes.ok) {
        const commesseData = await commesseRes.json();
        const commesseArray = Array.isArray(commesseData) ? commesseData : commesseData.data || [];
        setCommesse(commesseArray.map((c: any) => ({ id: c.id, nome: c.nome })));
      }

      if (contiRes.ok) {
        const contiData = await contiRes.json();
        // /api/conti/select returns array directly
        const contiArray = Array.isArray(contiData) ? contiData : [];
        setConti(contiArray.map((c: any) => ({ 
          id: c.id, 
          nome: c.codice ? `${c.codice} - ${c.nome}` : c.nome 
        })));
      }

      if (vociRes.ok) {
        const vociData = await vociRes.json();
        const vociArray = Array.isArray(vociData) ? vociData : vociData.data || [];
        setVociAnalitiche(vociArray.map((v: any) => ({ id: v.id, nome: v.nome })));
      }
    } catch (error) {
      console.error('Errore nel caricamento dati dropdown:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Reset form when dialog opens/closes or regola changes
  useEffect(() => {
    if (open) {
      if (regola) {
        setFormData({
          descrizione: regola.descrizione,
          commessaId: regola.commessaId,
          percentuale: regola.percentuale,
          contoId: regola.contoId,
          voceAnaliticaId: regola.voceAnaliticaId
        });
      } else {
        setFormData({
          descrizione: '',
          commessaId: '',
          percentuale: 0,
          contoId: '',
          voceAnaliticaId: ''
        });
      }
      setErrors({});
    }
  }, [open, regola]);

  const validateForm = (): boolean => {
    const newErrors: Partial<RegolaRipartizioneFormData> = {};

    if (!formData.descrizione.trim()) {
      newErrors.descrizione = 'La descrizione è obbligatoria';
    } else if (formData.descrizione.trim().length < 2) {
      newErrors.descrizione = 'La descrizione deve contenere almeno 2 caratteri';
    }

    if (!formData.commessaId) {
      newErrors.commessaId = 'La commessa è obbligatoria' as any;
    }

    if (!formData.contoId) {
      newErrors.contoId = 'Il conto è obbligatorio' as any;
    }

    if (!formData.voceAnaliticaId) {
      newErrors.voceAnaliticaId = 'La voce analitica è obbligatoria' as any;
    }

    if (formData.percentuale <= 0 || formData.percentuale > 100) {
      newErrors.percentuale = 'La percentuale deve essere tra 1 e 100' as any;
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
                Modifica Regola di Ripartizione
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Nuova Regola di Ripartizione
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Modifica i dettagli della regola di ripartizione selezionata.'
              : 'Crea una nuova regola per l\'allocazione automatica dei costi.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Descrizione */}
          <div className="space-y-2">
            <Label htmlFor="descrizione">Descrizione *</Label>
            <Textarea
              id="descrizione"
              value={formData.descrizione}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setFormData(prev => ({ ...prev, descrizione: e.target.value }))
              }
              placeholder="Es. Ripartizione carburanti per Comune di Sorrento"
              rows={2}
              className={errors.descrizione ? 'border-red-500' : ''}
            />
            {errors.descrizione && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.descrizione}
              </div>
            )}
          </div>

          {/* Commessa */}
          <div className="space-y-2">
            <Label htmlFor="commessa">Commessa *</Label>
            <Select
              value={formData.commessaId}
              onValueChange={(value: string) => 
                setFormData(prev => ({ ...prev, commessaId: value }))
              }
              disabled={loadingData}
            >
              <SelectTrigger className={errors.commessaId ? 'border-red-500' : ''}>
                <SelectValue placeholder={loadingData ? "Caricamento..." : "Seleziona commessa..."} />
              </SelectTrigger>
              <SelectContent>
                {commesse.map(commessa => (
                  <SelectItem key={commessa.id} value={commessa.id}>
                    {commessa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.commessaId && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.commessaId}
              </div>
            )}
          </div>

          {/* Conto */}
          <div className="space-y-2">
            <Label htmlFor="conto">Conto *</Label>
            
            {/* Messaggio informativo quando non ci sono conti */}
            {!loadingData && conti.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Nessun conto disponibile</p>
                    <p className="mt-1">
                      Prima di creare regole di ripartizione, importa il <strong>Piano dei Conti</strong> dalla sezione "Importazione Dati".
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Select
              value={formData.contoId}
              onValueChange={(value: string) => 
                setFormData(prev => ({ ...prev, contoId: value }))
              }
              disabled={loadingData || conti.length === 0}
            >
              <SelectTrigger className={errors.contoId ? 'border-red-500' : ''}>
                <SelectValue placeholder={
                  loadingData 
                    ? "Caricamento..." 
                    : conti.length === 0 
                      ? "Importa prima il Piano dei Conti..." 
                      : "Seleziona conto..."
                } />
              </SelectTrigger>
              <SelectContent>
                {conti.map(conto => (
                  <SelectItem key={conto.id} value={conto.id}>
                    {conto.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.contoId && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.contoId}
              </div>
            )}
          </div>

          {/* Voce Analitica */}
          <div className="space-y-2">
            <Label htmlFor="voceAnalitica">Voce Analitica *</Label>
            <Select
              value={formData.voceAnaliticaId}
              onValueChange={(value: string) => 
                setFormData(prev => ({ ...prev, voceAnaliticaId: value }))
              }
              disabled={loadingData}
            >
              <SelectTrigger className={errors.voceAnaliticaId ? 'border-red-500' : ''}>
                <SelectValue placeholder={loadingData ? "Caricamento..." : "Seleziona voce analitica..."} />
              </SelectTrigger>
              <SelectContent>
                {vociAnalitiche.map(voce => (
                  <SelectItem key={voce.id} value={voce.id}>
                    {voce.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.voceAnaliticaId && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.voceAnaliticaId}
              </div>
            )}
          </div>

          {/* Percentuale */}
          <div className="space-y-2">
            <Label htmlFor="percentuale">Percentuale (%) *</Label>
            <Input
              id="percentuale"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.percentuale}
              onChange={(e) => setFormData(prev => ({ ...prev, percentuale: parseFloat(e.target.value) || 0 }))}
              placeholder="Es. 25.50"
              className={errors.percentuale ? 'border-red-500' : ''}
            />
            {errors.percentuale && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.percentuale}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading || loadingData}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={loading || loadingData}>
            {loading ? 'Salvataggio...' : (isEdit ? 'Salva Modifiche' : 'Crea Regola')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegolaRipartizioneDialog;
