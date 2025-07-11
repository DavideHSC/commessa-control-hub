import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, FileText, Landmark, DollarSign, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Commessa, VoceAnalitica, ScritturaContabile } from '@prisma/client';
import { getCommesse, getVociAnalitiche } from '@/api';
import { getRegistrazioni } from '@/api/registrazioni';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const CommessaDettaglio = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [commessa, setCommessa] = useState<Commessa | null>(null);
  const [vociAnalitiche, setVociAnalitiche] = useState<VoceAnalitica[]>([]);
  const [registrazioni, setRegistrazioni] = useState<ScritturaContabile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [commesseData, vociAnaliticheData, registrazioniData] = await Promise.all([
          getCommesse(),
          getVociAnalitiche(),
          getRegistrazioni()
        ]);
        const currentCommessa = commesseData.find(c => c.id === id);
        setCommessa(currentCommessa || null);
        setVociAnalitiche(vociAnaliticheData);
        setRegistrazioni(registrazioniData);
      } catch (error) {
        console.error("Errore nel caricamento dei dati di dettaglio:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };
  
  const getNomeVoceAnalitica = (id: string) => {
    return vociAnalitiche.find(c => c.id === id)?.nome || 'N/D';
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Caricamento dettagli commessa...</p></div>;
  }

  if (!commessa) {
    return <div className="text-center py-12"><p>Commessa non trovata.</p></div>;
  }

  const totalBudget = commessa.budget?.reduce((sum, item) => sum + (item.importo || 0), 0) || 0;
  
  const movimentiAllocati = registrazioni
    .flatMap(r => 
      r.righe.map(riga => ({ ...riga, dataRegistrazione: r.data, descrizioneRegistrazione: r.descrizione, idRegistrazione: r.id }))
    )
    .filter(riga => 
      riga.allocazioni && riga.allocazioni.some(a => a.commessaId === commessa.id)
    );

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
            <h1 className="text-3xl font-bold text-slate-900">{commessa.nome}</h1>
            <p className="text-slate-600 mt-1">Commessa #{commessa.id}</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Descrizione</h3>
            <p className="text-slate-700 text-sm">{commessa.descrizione || 'Nessuna descrizione.'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Budget Totale</h3>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalBudget)}</p>
          </div>
        </div>
      </div>

      {/* Dettaglio Budget */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Dettaglio Budget per Voce Analitica</h3>
          <p className="text-sm text-slate-500 mt-1">
            Suddivisione del budget allocato alle diverse voci analitiche per questa commessa.
          </p>
        </div>
        <div className="divide-y divide-slate-200">
          {commessa.budget?.map((budgetItem) => (
            <div key={budgetItem.voceAnaliticaId} className="flex items-center justify-between p-4 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <Landmark className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-slate-800">{getNomeVoceAnalitica(budgetItem.voceAnaliticaId)}</span>
              </div>
              <div className="flex items-center gap-3">
                 <DollarSign className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-slate-900 text-lg">{formatCurrency(budgetItem.importo)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Movimenti Allocati */}
      <div className="bg-white rounded-xl border border-slate-200 mt-6">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Movimenti Allocati</h3>
          <p className="text-sm text-slate-500 mt-1">
            Dettaglio dei costi e ricavi imputati a questa commessa.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Conto</TableHead>
              <TableHead>Descrizione Registrazione</TableHead>
              <TableHead className="text-right">Importo Allocato</TableHead>
              <TableHead className="text-center">Rif. Registrazione</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimentiAllocati.length > 0 ? (
              movimentiAllocati.map(riga => {
                const importoAllocato = (riga.dare || 0) > 0 ? riga.dare : riga.avere;
                // Trova il conto corretto dal piano dei conti
                const contoAssociato = vociAnalitiche.find(c => c.id === riga.contoId);

                return (
                  <TableRow key={riga.id}>
                    <TableCell>{new Date(riga.dataRegistrazione).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {contoAssociato ? <Badge variant="outline">{contoAssociato.nome}</Badge> : 'N/D'}
                    </TableCell>
                    <TableCell>{riga.descrizioneRegistrazione}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(importoAllocato || 0)}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/prima-nota/registrazione/${riga.idRegistrazione}`)}>
                        #{riga.idRegistrazione}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                  Nessun movimento allocato a questa commessa.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CommessaDettaglio;
