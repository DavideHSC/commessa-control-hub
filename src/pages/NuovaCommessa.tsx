
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const NuovaCommessa = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    cliente: '',
    stato: 'pianificata',
    ricavi: '',
    dataInizio: '',
    dataFine: '',
    descrizione: ''
  });

  const handleSave = () => {
    // Qui implementeresti la logica di salvataggio
    console.log('Salvataggio commessa:', formData);
    // Redirect alla lista commesse
    navigate('/commesse');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/commesse')}
            className="border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alle Commesse
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nuova Commessa</h1>
            <p className="text-slate-600 mt-1">Crea una nuova commessa nel sistema</p>
          </div>
        </div>
        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
          <Save className="w-4 h-4 mr-2" />
          Salva Commessa
        </Button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome Commessa *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Inserisci il nome della commessa"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cliente">Cliente *</Label>
              <Input
                id="cliente"
                value={formData.cliente}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                placeholder="Nome del cliente"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="stato">Stato</Label>
              <Select value={formData.stato} onValueChange={(value) => setFormData(prev => ({ ...prev, stato: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pianificata">Pianificata</SelectItem>
                  <SelectItem value="in-corso">In Corso</SelectItem>
                  <SelectItem value="completata">Completata</SelectItem>
                  <SelectItem value="fatturata">Fatturata</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ricavi">Ricavi Previsti (€)</Label>
              <Input
                id="ricavi"
                type="number"
                value={formData.ricavi}
                onChange={(e) => setFormData(prev => ({ ...prev, ricavi: e.target.value }))}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="dataInizio">Data Inizio</Label>
              <Input
                id="dataInizio"
                type="date"
                value={formData.dataInizio}
                onChange={(e) => setFormData(prev => ({ ...prev, dataInizio: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dataFine">Data Fine Prevista</Label>
              <Input
                id="dataFine"
                type="date"
                value={formData.dataFine}
                onChange={(e) => setFormData(prev => ({ ...prev, dataFine: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="descrizione">Descrizione</Label>
              <Textarea
                id="descrizione"
                value={formData.descrizione}
                onChange={(e) => setFormData(prev => ({ ...prev, descrizione: e.target.value }))}
                placeholder="Descrizione dettagliata della commessa"
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuovaCommessa;
