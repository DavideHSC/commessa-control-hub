import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Target,
  Calendar,
  Users,
  Award,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  Maximize2
} from 'lucide-react';
import { CommessaWithPerformance } from '@/api/commessePerformance';
import { StatusBadge, MargineBadge, ProgressBadge } from '@/components/commesse/StatusIndicators';

interface ComparativeViewProps {
  commesse: CommessaWithPerformance[];
  selectedCommessaId?: string;
  onExport?: (type: 'pdf' | 'excel') => void;
}

type ComparisonType = 'performance' | 'temporal' | 'benchmark';
type MetricType = 'margine' | 'avanzamento' | 'budget' | 'roi' | 'efficienza';

interface BenchmarkData {
  settore: string;
  margineMedio: number;
  avanzamentoMedio: number;
  budgetMedio: number;
  roiMedio: number;
}

const benchmarkData: BenchmarkData[] = [
  { settore: 'Pubblica Amministrazione', margineMedio: 15.2, avanzamentoMedio: 78.5, budgetMedio: 125000, roiMedio: 12.8 },
  { settore: 'Servizi Urbani', margineMedio: 18.7, avanzamentoMedio: 82.1, budgetMedio: 98000, roiMedio: 16.3 },
  { settore: 'Infrastrutture', margineMedio: 12.9, avanzamentoMedio: 65.8, budgetMedio: 287000, roiMedio: 9.2 },
  { settore: 'Consulenza', margineMedio: 22.4, avanzamentoMedio: 88.3, budgetMedio: 75000, roiMedio: 21.7 }
];

export const ComparativeView: React.FC<ComparativeViewProps> = ({ 
  commesse, 
  selectedCommessaId,
  onExport 
}) => {
  const [comparisonType, setComparisonType] = useState<ComparisonType>('performance');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('margine');
  const [selectedCommesse, setSelectedCommesse] = useState<string[]>(
    selectedCommessaId ? [selectedCommessaId] : commesse.slice(0, 5).map(c => c.id)
  );
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m'>('6m');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Calcola ROI per ogni commessa
  const calculateROI = (commessa: CommessaWithPerformance) => {
    if (commessa.budget === 0) return 0;
    return ((commessa.ricavi - commessa.costi) / commessa.budget) * 100;
  };

  // Calcola efficienza budget
  const calculateEfficiency = (commessa: CommessaWithPerformance) => {
    if (commessa.budget === 0) return 0;
    return (commessa.costi / commessa.budget) * 100;
  };

  // Prepara dati per confronto performance
  const performanceData = useMemo(() => {
    const filtered = commesse.filter(c => selectedCommesse.includes(c.id));
    
    return filtered.map(c => ({
      nome: c.nome.length > 20 ? c.nome.substring(0, 20) + '...' : c.nome,
      nomeCompleto: c.nome,
      margine: c.margine,
      avanzamento: c.percentualeAvanzamento,
      budget: c.budget,
      costi: c.costi,
      ricavi: c.ricavi,
      roi: calculateROI(c),
      efficienza: calculateEfficiency(c),
      cliente: c.cliente.nome,
      id: c.id
    }));
  }, [commesse, selectedCommesse]);

  // Prepara dati temporali simulati
  const temporalData = useMemo(() => {
    const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
    const data = [];
    
    for (let i = 0; i < months; i++) {
      const monthData: any = {
        mese: `Mese ${i + 1}`,
        periodo: new Date(Date.now() - (months - i - 1) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT', { month: 'short' })
      };
      
      selectedCommesse.forEach(commessaId => {
        const commessa = commesse.find(c => c.id === commessaId);
        if (commessa) {
          const progress = Math.min((i + 1) / months * commessa.percentualeAvanzamento, 100);
          monthData[commessa.nome] = progress;
        }
      });
      
      data.push(monthData);
    }
    
    return data;
  }, [commesse, selectedCommesse, timeRange]);

  // Prepara dati radar per benchmark
  const radarData = useMemo(() => {
    const selectedCommessa = commesse.find(c => c.id === selectedCommessaId);
    if (!selectedCommessa) return [];

    const metrics = [
      { 
        subject: 'Margine',
        commessa: selectedCommessa.margine,
        benchmark: benchmarkData.find(b => b.settore === 'Pubblica Amministrazione')?.margineMedio || 15,
        fullMark: 30
      },
      { 
        subject: 'Avanzamento',
        commessa: selectedCommessa.percentualeAvanzamento,
        benchmark: benchmarkData.find(b => b.settore === 'Pubblica Amministrazione')?.avanzamentoMedio || 78,
        fullMark: 100
      },
      { 
        subject: 'ROI',
        commessa: calculateROI(selectedCommessa),
        benchmark: benchmarkData.find(b => b.settore === 'Pubblica Amministrazione')?.roiMedio || 12,
        fullMark: 25
      },
      { 
        subject: 'Efficienza',
        commessa: 100 - calculateEfficiency(selectedCommessa),
        benchmark: 100 - 85,
        fullMark: 100
      }
    ];

    return metrics;
  }, [commesse, selectedCommessaId]);

  // Componente per la tabella comparativa
  const ComparisonTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Commessa</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead className="text-right">Margine</TableHead>
          <TableHead className="text-right">Avanzamento</TableHead>
          <TableHead className="text-right">Budget</TableHead>
          <TableHead className="text-right">ROI</TableHead>
          <TableHead className="text-right">Efficienza</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {performanceData.map((commessa) => (
          <TableRow key={commessa.id}>
            <TableCell className="font-medium">{commessa.nomeCompleto}</TableCell>
            <TableCell>{commessa.cliente}</TableCell>
            <TableCell>
              <StatusBadge margine={commessa.margine} percentuale={commessa.avanzamento} size="sm" />
            </TableCell>
            <TableCell className="text-right">
              <MargineBadge margine={commessa.margine} size="sm" />
            </TableCell>
            <TableCell className="text-right">
              <ProgressBadge percentuale={commessa.avanzamento} size="sm" />
            </TableCell>
            <TableCell className="text-right">{formatCurrency(commessa.budget)}</TableCell>
            <TableCell className="text-right">
              <Badge variant={commessa.roi >= 15 ? 'default' : commessa.roi >= 5 ? 'secondary' : 'destructive'}>
                {formatPercentage(commessa.roi)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Badge variant={commessa.efficienza <= 80 ? 'default' : commessa.efficienza <= 95 ? 'secondary' : 'destructive'}>
                {formatPercentage(commessa.efficienza)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Vista Comparativa</h2>
          <p className="text-slate-600">Confronta performance e andamenti tra commesse</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => onExport?.('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Esporta Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport?.('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Esporta PDF
          </Button>
        </div>
      </div>

      {/* Filtri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtri e Selezione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo Confronto</label>
              <Select value={comparisonType} onValueChange={(value: ComparisonType) => setComparisonType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="temporal">Andamento Temporale</SelectItem>
                  <SelectItem value="benchmark">Benchmark Settoriale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Metrica Principale</label>
              <Select value={selectedMetric} onValueChange={(value: MetricType) => setSelectedMetric(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="margine">Margine %</SelectItem>
                  <SelectItem value="avanzamento">Avanzamento %</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="roi">ROI %</SelectItem>
                  <SelectItem value="efficienza">Efficienza Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {comparisonType === 'temporal' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Periodo</label>
                <Select value={timeRange} onValueChange={(value: '3m' | '6m' | '12m') => setTimeRange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">Ultimi 3 mesi</SelectItem>
                    <SelectItem value="6m">Ultimi 6 mesi</SelectItem>
                    <SelectItem value="12m">Ultimo anno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contenuto Comparativo */}
      <Tabs value={comparisonType} onValueChange={(value: ComparisonType) => setComparisonType(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="temporal">Andamento Temporale</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Confronto {selectedMetric === 'margine' ? 'Margini' : 
                           selectedMetric === 'avanzamento' ? 'Avanzamenti' :
                           selectedMetric === 'budget' ? 'Budget' :
                           selectedMetric === 'roi' ? 'ROI' : 'Efficienza'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip formatter={(value) => 
                      selectedMetric === 'budget' ? formatCurrency(Number(value)) : 
                      `${Number(value).toFixed(1)}${selectedMetric === 'margine' || selectedMetric === 'avanzamento' || selectedMetric === 'roi' || selectedMetric === 'efficienza' ? '%' : ''}`
                    } />
                    <Bar dataKey={selectedMetric} fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Scatter Plot - Margine vs Avanzamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="avanzamento" name="Avanzamento" unit="%" />
                    <YAxis type="number" dataKey="margine" name="Margine" unit="%" />
                    <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]} />
                    <Scatter name="Commesse" dataKey="margine" fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tabella Comparativa Dettagliata</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparisonTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temporal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Andamento Temporale - Ultimi {timeRange === '3m' ? '3 mesi' : timeRange === '6m' ? '6 mesi' : '12 mesi'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={temporalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedCommesse.map((commessaId, index) => {
                    const commessa = commesse.find(c => c.id === commessaId);
                    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];
                    return (
                      <Line 
                        key={commessaId}
                        type="monotone" 
                        dataKey={commessa?.nome} 
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmark" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Radar Chart - Confronto con Benchmark
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar name="Commessa" dataKey="commessa" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Radar name="Benchmark" dataKey="benchmark" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benchmark Settoriali</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {benchmarkData.map((benchmark, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{benchmark.settore}</h4>
                        <Badge variant="outline">{formatPercentage(benchmark.margineMedio)}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Avanzamento:</span>
                          <span className="ml-2 font-medium">{formatPercentage(benchmark.avanzamentoMedio)}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">ROI:</span>
                          <span className="ml-2 font-medium">{formatPercentage(benchmark.roiMedio)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComparativeView;