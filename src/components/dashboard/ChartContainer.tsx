import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface TrendData {
  ricaviMensili: Array<{ mese: string; ricavi: number; costi: number; margine: number }>;
  topCommesse: Array<{ nome: string; margine: number; ricavi: number }>;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

// Colori per i grafici
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface TrendChartProps {
  data: TrendData['ricaviMensili'];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Trend Ricavi e Margini (Ultimi 6 Mesi)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mese" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              labelFormatter={(value) => `Mese: ${value}`}
              formatter={(value: number, name: string) => {
                if (name === 'margine') {
                  return [formatPercent(value), 'Margine %'];
                }
                return [formatCurrency(value), name === 'ricavi' ? 'Ricavi' : 'Costi'];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="ricavi" fill="#0088FE" name="Ricavi" />
            <Bar yAxisId="left" dataKey="costi" fill="#FF8042" name="Costi" />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="margine" 
              stroke="#00C49F" 
              strokeWidth={3}
              name="Margine %"
              dot={{ fill: '#00C49F', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

interface TopCommesseChartProps {
  data: TrendData['topCommesse'];
}

export const TopCommesseChart: React.FC<TopCommesseChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Commesse per Margine</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="nome" width={80} />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'margine') {
                  return [formatPercent(value), 'Margine %'];
                }
                return [formatCurrency(value), 'Ricavi'];
              }}
            />
            <Bar dataKey="margine" fill="#00C49F" name="Margine %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

interface KpiComparisonProps {
  ricaviTotali: number;
  costiTotali: number;
  margineLordoMedio: number;
}

export const KpiComparisonChart: React.FC<KpiComparisonProps> = ({ 
  ricaviTotali, 
  costiTotali, 
  margineLordoMedio 
}) => {
  const data = [
    { name: 'Ricavi', value: ricaviTotali, color: '#0088FE' },
    { name: 'Costi', value: costiTotali, color: '#FF8042' },
  ];

  const margineAssoluto = ricaviTotali - costiTotali;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuzione Ricavi vs Costi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="text-center space-y-2">
            <div className="text-sm font-medium">Margine Assoluto</div>
            <div className={`text-lg font-bold ${margineAssoluto > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(margineAssoluto)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatPercent(margineLordoMedio)} del fatturato
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ChartsGridProps {
  trends: TrendData;
  kpi: {
    ricaviTotali: number;
    costiTotali: number;
    margineLordoMedio: number;
  };
}

export const ChartsGrid: React.FC<ChartsGridProps> = ({ trends, kpi }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <TrendChart data={trends.ricaviMensili} />
      <TopCommesseChart data={trends.topCommesse} />
      <KpiComparisonChart 
        ricaviTotali={kpi.ricaviTotali}
        costiTotali={kpi.costiTotali}
        margineLordoMedio={kpi.margineLordoMedio}
      />
    </div>
  );
};