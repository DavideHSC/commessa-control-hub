import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/api/vociAnalitiche';
import { getConfigurableConti } from '@/api/conti';
import { VoceAnaliticaWithRelations, ContoForUI } from '@/types';
import { MultiSelect } from '@/components/ui/multi-select';

interface ConfigurableConto {
  id: string;
  codice: string;
  nome: string;
}

interface SelectableConto extends ConfigurableConto {
    label: string;
    value: string;
}

const VociAnaliticheManager = () => {
  const [voci, setVoci] = useState<VoceAnaliticaWithRelations[]>([]);
  const [conti, setConti] = useState<SelectableConto[]>([]);
  const [selectedVoce, setSelectedVoce] = useState<VoceAnaliticaWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Chiediamo tutti i dati impostando un limite elevato, dato che questa UI non è paginata
      const [vociData, contiData] = await Promise.all([
        api.getVociAnalitiche({ page: 1, limit: 9999 }),
        getConfigurableConti(),
      ]);
      
      // Convertiamo i dati dell'API al tipo atteso, aggiungendo la proprietà conti vuota
      const vociWithRelations: VoceAnaliticaWithRelations[] = vociData.data.map(voce => ({
        ...voce,
        conti: [] // Inizializziamo con un array vuoto, verrà popolato dall'API se necessario
      }));
      
      setVoci(vociWithRelations);
      setConti(contiData.map((c: ConfigurableConto) => ({ ...c, value: c.id, label: `${c.codice} - ${c.nome}` })));
    } catch (error) {
      toast({ title: 'Errore', description: 'Impossibile caricare i dati.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectVoce = (voce: VoceAnaliticaWithRelations) => {
    setSelectedVoce(voce);
  };

  const handleAddNew = () => {
    setSelectedVoce({
      id: '',
      nome: '',
      descrizione: '',
      tipo: 'Costo',
      conti: [],
    });
  };
  
  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
        await api.deleteVoceAnalitica(id);
        toast({ title: 'Successo', description: 'Voce analitica eliminata.' });
        setSelectedVoce(null);
        fetchData();
    } catch (error) {
        toast({ title: 'Errore', description: "Impossibile eliminare la voce analitica.", variant: 'destructive' });
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedVoce) return;

    const { id, ...data } = selectedVoce;
    const payload = {
        ...data,
        contiIds: selectedVoce.conti.map(c => c.id),
    };

    try {
      if (id) {
        await api.updateVoceAnalitica(id, payload);
        toast({ title: 'Successo', description: 'Voce analitica aggiornata.' });
      } else {
        await api.createVoceAnalitica(payload);
        toast({ title: 'Successo', description: 'Voce analitica creata.' });
      }
      setSelectedVoce(null);
      fetchData();
    } catch (error) {
      toast({ title: 'Errore', description: "Salvataggio fallito.", variant: 'destructive' });
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Voci Analitiche</CardTitle>
          <Button size="sm" onClick={handleAddNew} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Aggiungi Nuova
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {voci.map(voce => (
              <li key={voce.id}>
                <Button
                  variant={selectedVoce?.id === voce.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => handleSelectVoce(voce)}
                >
                  {voce.nome}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        {selectedVoce && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedVoce.id ? 'Modifica Voce Analitica' : 'Nuova Voce Analitica'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" value={selectedVoce.nome} onChange={e => setSelectedVoce({ ...selectedVoce, nome: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descrizione">Descrizione</Label>
                  <Input id="descrizione" value={selectedVoce.descrizione || ''} onChange={e => setSelectedVoce({ ...selectedVoce, descrizione: e.target.value })}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={selectedVoce.tipo} onValueChange={(value) => setSelectedVoce({ ...selectedVoce, tipo: value as 'Costo' | 'Ricavo' })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Costo">Costo</SelectItem>
                      <SelectItem value="Ricavo">Ricavo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                    <Label>Conti Associati</Label>
                    <MultiSelect
                        options={conti}
                        defaultValue={selectedVoce.conti?.map(c => c.id) || []}
                        onValueChange={(selectedIds) => {
                            const selectedConti = conti.filter(c => selectedIds.includes(c.id));
                            // Convertiamo i SelectableConto in ContoForUI
                            const contiForState: ContoForUI[] = selectedConti.map(c => ({
                                id: c.id,
                                codice: c.codice,
                                nome: c.nome,
                            }));
                            setSelectedVoce({ ...selectedVoce, conti: contiForState });
                        }}
                        className="w-full"
                    />
                </div>
                <div className="flex justify-between">
                    <Button type="submit">Salva</Button>
                    {selectedVoce.id && (
                        <Button variant="destructive" type="button" onClick={() => handleDelete(selectedVoce.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VociAnaliticheManager; 