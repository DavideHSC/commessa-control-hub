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
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, BarChart3, PieChart } from 'lucide-react';

interface MainChartsSectionProps {
  trends: {
    ricaviMensili: Array<{ mese: string; ricavi: number; costi: number; margine: number }>;
    topCommesse: Array<{ nome: string; margine: number; ricavi: number }>;
  };
  kpi: {
    ricaviTotali: number;
    costiTotali: number;
    margineLordoMedio: number;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export const MainChartsSection: React.FC<MainChartsSectionProps> = ({ trends, kpi }) => {
  return (
    <div className="space-y-6">
      
      {/* Grafico principale - Trend Performance */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <CardTitle>Performance Finanziaria - Ultimi 6 Mesi</CardTitle>
            </div>
            <div className="text-sm text-slate-500">
              Analisi trend ricavi, costi e marginalità
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={trends.ricaviMensili}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="mese" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="money"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <YAxis 
                yAxisId="percent"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'margine') {
                    return [formatPercent(value), 'Margine %'];
                  }
                  return [formatCurrency(value), name === 'ricavi' ? 'Ricavi' : 'Costi'];
                }}
              />
              
              {/* Area per i ricavi */}
              <Area
                yAxisId="money"
                type="monotone"
                dataKey="ricavi"
                fill="#dbeafe"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={0.6}
              />
              
              {/* Barre per i costi */}
              <Bar
                yAxisId="money"
                dataKey="costi"
                fill="#fecaca"
                opacity={0.8}
                radius={[2, 2, 0, 0]}
              />
              
              {/* Linea per il margine */}
              <Line 
                yAxisId="percent"
                type="monotone" 
                dataKey="margine" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sezione grafici secondari */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Top Commesse */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <CardTitle>Top Commesse per Marginalità</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trends.topCommesse} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="nome" 
                  width={100}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'margine') {
                      return [formatPercent(value), 'Margine %'];
                    }
                    return [formatCurrency(value), 'Ricavi'];
                  }}
                />
                <Bar 
                  dataKey="margine" 
                  fill="#10b981"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuzione Finanziaria */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              <CardTitle>Distribuzione Finanziaria</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              {/* Indicatori principali */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    {formatCurrency(kpi.ricaviTotali)}
                  </div>
                  <div className="text-sm text-blue-600">Ricavi Totali</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">
                    {formatCurrency(kpi.costiTotali)}
                  </div>
                  <div className="text-sm text-red-600">Costi Totali</div>
                </div>
              </div>

              {/* Barra di margine */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Margine Complessivo</span>
                  <span className="font-medium">{formatPercent(kpi.margineLordoMedio)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      kpi.margineLordoMedio > 20 ? 'bg-green-500' : 
                      kpi.margineLordoMedio > 10 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(kpi.margineLordoMedio * 3, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Margine assoluto */}
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className={`text-3xl font-bold ${
                  (kpi.ricaviTotali - kpi.costiTotali) > 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {formatCurrency(kpi.ricaviTotali - kpi.costiTotali)}
                </div>
                <div className="text-sm text-slate-600">Profitto Netto</div>
                <div className="text-xs text-slate-500 mt-1">
                  {((kpi.ricaviTotali - kpi.costiTotali) / kpi.ricaviTotali * 100).toFixed(1)}% del fatturato
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};