import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { VoceAnalitica } from '@prisma/client';

const formSchema = z.object({
  nome: z.string().min(1, 'Il nome è obbligatorio'),
  descrizione: z.string().optional(),
  tipo: z.enum(['Costo', 'Ricavo']),
});

type VoceAnaliticaFormData = z.infer<typeof formSchema>;

interface VoceAnaliticaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VoceAnaliticaFormData) => void;
  initialData: VoceAnalitica | null;
}

export const VoceAnaliticaForm: React.FC<VoceAnaliticaFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<VoceAnaliticaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      descrizione: '',
      tipo: 'Costo',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        nome: initialData.nome,
        descrizione: initialData.descrizione ?? undefined,
        tipo: initialData.tipo as 'Costo' | 'Ricavo',
      });
    } else {
      reset({ nome: '', descrizione: '', tipo: 'Costo' });
    }
  }, [initialData, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Modifica Voce Analitica' : 'Nuova Voce Analitica'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Controller
              name="nome"
              control={control}
              render={({ field }) => <Input {...field} id="nome" />}
            />
            {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
          </div>
          <div>
            <Label htmlFor="descrizione">Descrizione</Label>
            <Controller
              name="descrizione"
              control={control}
              render={({ field }) => <Input {...field} id="descrizione" value={field.value ?? ''} />}
            />
          </div>
          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Costo">Costo</SelectItem>
                    <SelectItem value="Ricavo">Ricavo</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Annulla</Button>
            <Button type="submit">Salva</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 