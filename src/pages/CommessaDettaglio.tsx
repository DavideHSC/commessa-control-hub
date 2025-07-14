import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, FileText, Landmark, DollarSign, Calculator, 
         TrendingUp, TrendingDown, AlertTriangle, BarChart3, PieChart, Calendar,
         Target, Activity, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Commessa, VoceAnalitica, ScritturaContabile } from '@prisma/client';
import { getCommesse, getVociAnalitiche } from '@/api';
import { getRegistrazioni } from '@/api/registrazioni';
import { getCommesseWithPerformance, CommessaWithPerformance } from '@/api/commessePerformance';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CommessaDettaglio = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [commessa, setCommessa] = useState<Commessa | null>(null);
  const [commessaPerformance, setCommessaPerformance] = useState<CommessaWithPerformance | null>(null);
  const [vociAnalitiche, setVociAnalitiche] = useState<VoceAnalitica[]>([]);
  const [registrazioni, setRegistrazioni] = useState<ScritturaContabile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [commesseData, vociAnaliticheData, registrazioniData, performanceData] = await Promise.all([
          getCommesse(),
          getVociAnalitiche(),
          getRegistrazioni(),
          getCommesseWithPerformance()
        ]);
        
        const currentCommessa = commesseData.find(c => c.id === id);
        setCommessa(currentCommessa || null);
        setVociAnalitiche(vociAnaliticheData);
        setRegistrazioni(registrazioniData);
        
        // Trova la commessa con performance (può essere padre o figlia)
        const currentPerformance = performanceData.commesse.find(c => c.id === id) ||
          performanceData.commesse.find(c => c.figlie?.some(f => f.id === id))?.figlie?.find(f => f.id === id);
        setCommessaPerformance(currentPerformance || null);
        
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getNomeVoceAnalitica = (id: string) => {
    return vociAnalitiche.find(c => c.id === id)?.nome || 'N/D';
  };

  const getHealthStatus = () => {
    if (!commessaPerformance) return { color: 'text-gray-500', icon: AlertTriangle, text: 'Dati non disponibili' };
    
    const { margine, percentualeAvanzamento } = commessaPerformance;
    
    if (margine >= 15 && percentualeAvanzamento <= 90) {
      return { color: 'text-green-600', icon: CheckCircle, text: 'Eccellente' };
    } else if (margine >= 10 && percentualeAvanzamento <= 95) {
      return { color: 'text-blue-600', icon: TrendingUp, text: 'Buono' };
    } else if (margine >= 5) {
      return { color: 'text-yellow-600', icon: Clock, text: 'Attenzione' };
    } else {
      return { color: 'text-red-600', icon: AlertTriangle, text: 'Critico' };
    }
  };

  // Prepara dati per i grafici
  const prepareChartData = () => {
    if (!commessaPerformance) return { trendData: [], budgetData: [], movimentiData: [] };

    const budgetData = commessa?.budget?.map(b => ({
      name: getNomeVoceAnalitica(b.voceAnaliticaId),
      value: b.importo,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    })) || [];

    // Simula dati trend mensili (in un'app reale verrebbero dal backend)
    const trendData = Array.from({ length: 6 }, (_, i) => ({
      mese: `Mese ${i + 1}`,
      budget: commessaPerformance.budget / 6,
      speso: (commessaPerformance.costi / 6) * (i + 1),
      ricavi: (commessaPerformance.ricavi / 6) * (i + 1)
    }));

    const movimentiData = movimentiAllocati.reduce((acc, movimento) => {
      const mese = new Date(movimento.dataRegistrazione).toLocaleDateString('it-IT', { month: 'short' });
      const existing = acc.find(item => item.mese === mese);
      if (existing) {
        existing.importo += (movimento.dare || movimento.avere || 0);
      } else {
        acc.push({ mese, importo: movimento.dare || movimento.avere || 0 });
      }
      return acc;
    }, [] as { mese: string; importo: number }[]);

    return { trendData, budgetData, movimentiData };
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Caricamento dettagli commessa...</p></div>;
  }

  if (!commessa) {
    return <div className="text-center py-12"><p>Commessa non trovata.</p></div>;
  }

  const totalBudget = commessa?.budget?.reduce((sum, item) => sum + (item.importo || 0), 0) || 0;
  
  const movimentiAllocati = registrazioni
    .flatMap(r => 
      r.righe.map(riga => ({ ...riga, dataRegistrazione: r.data, descrizioneRegistrazione: r.descrizione, idRegistrazione: r.id }))
    )
    .filter(riga => 
      riga.allocazioni && riga.allocazioni.some(a => a.commessaId === commessa?.id)
    );

  const healthStatus = getHealthStatus();
  const { trendData, budgetData, movimentiData } = prepareChartData();
  const HealthIcon = healthStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header Enhanced */}
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
            <h1 className="text-3xl font-bold text-slate-900">{commessa?.nome}</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-slate-600">Commessa #{commessa?.id}</p>
              {commessaPerformance && (
                <div className="flex items-center gap-2">
                  <HealthIcon className={`w-4 h-4 ${healthStatus.color}`} />
                  <span className={`text-sm font-medium ${healthStatus.color}`}>{healthStatus.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Dashboard Cards */}
      {commessaPerformance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Totale</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(commessaPerformance.budget)}</div>
              <p className="text-xs text-muted-foreground">
                Speso: {formatCurrency(commessaPerformance.costi)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margine</CardTitle>
              {commessaPerformance.margine >= 0 ? 
                <TrendingUp className="h-4 w-4 text-green-500" /> : 
                <TrendingDown className="h-4 w-4 text-red-500" />
              }
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${commessaPerformance.margine >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(commessaPerformance.margine)}
              </div>
              <p className="text-xs text-muted-foreground">
                Ricavi: {formatCurrency(commessaPerformance.ricavi)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avanzamento</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(commessaPerformance.percentualeAvanzamento)}</div>
              <Progress value={commessaPerformance.percentualeAvanzamento} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cliente</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{commessaPerformance.cliente.nome}</div>
              <p className="text-xs text-muted-foreground">
                {commessa?.descrizione || 'Nessuna descrizione'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabbed Interface for Drill-Down */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="financial">Analisi Finanziaria</TabsTrigger>
          <TabsTrigger value="budget">Budget Dettaglio</TabsTrigger>
          <TabsTrigger value="movements">Movimenti</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Trend Finanziario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mese" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="budget" stroke="#8884d8" name="Budget" />
                    <Line type="monotone" dataKey="speso" stroke="#82ca9d" name="Speso" />
                    <Line type="monotone" dataKey="ricavi" stroke="#ffc658" name="Ricavi" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Budget Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuzione Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <RechartsPieChart data={budgetData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
                      {budgetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analisi Costi vs Ricavi</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Budget', value: commessaPerformance?.budget || 0 },
                    { name: 'Costi', value: commessaPerformance?.costi || 0 },
                    { name: 'Ricavi', value: commessaPerformance?.ricavi || 0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicatori di Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>ROI Stimato</span>
                  <span className="font-bold">{formatPercentage((commessaPerformance?.ricavi || 0) / (commessaPerformance?.budget || 1) * 100 - 100)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Efficienza Budget</span>
                  <span className="font-bold">{formatPercentage((commessaPerformance?.budget || 0) > 0 ? (commessaPerformance?.costi || 0) / (commessaPerformance?.budget || 1) * 100 : 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Burn Rate</span>
                  <span className="font-bold">{formatCurrency((commessaPerformance?.costi || 0) / 6)}/mese</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>Dettaglio Budget per Voce Analitica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-200">
                {commessa?.budget?.map((budgetItem) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Movimenti Allocati</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommessaDettaglio;
