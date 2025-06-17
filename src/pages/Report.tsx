
import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Download, Filter, Euro, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const ricaviMensili = [
  { mese: 'Gen', ricavi: 120000, costi: 80000, margine: 40000 },
  { mese: 'Feb', ricavi: 145000, costi: 95000, margine: 50000 },
  { mese: 'Mar', ricavi: 138000, costi: 88000, margine: 50000 },
  { mese: 'Apr', ricavi: 162000, costi: 105000, margine: 57000 },
  { mese: 'Mag', ricavi: 175000, costi: 115000, margine: 60000 },
  { mese: 'Giu', ricavi: 190000, costi: 125000, margine: 65000 }
];

const commessePerCategoria = [
  { name: 'Edilizia', value: 45, color: '#3B82F6' },
  { name: 'IT', value: 25, color: '#10B981' },
  { name: 'Impiantistica', value: 20, color: '#F59E0B' },
  { name: 'Software', value: 10, color: '#8B5CF6' }
];

const performanceCommesse = [
  { nome: 'Ristrutturazione Centro', ricavi: 85000, margine: 27.1, stato: 'In corso' },
  { nome: 'Impianto Elettrico', ricavi: 120000, margine: 35.0, stato: 'Pianificata' },
  { nome: 'Sistema CRM', ricavi: 95000, margine: 38.9, stato: 'Completata' },
  { nome: 'Consulenza IT', ricavi: 52000, margine: 28.9, stato: 'Completata' }
];

const Report: React.FC = () => {
  const [periodoFilter, setPeriodoFilter] = useState<string>('ultimo-trimestre');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const totalRicavi = ricaviMensili.reduce((sum, item) => sum + item.ricavi, 0);
  const totalCosti = ricaviMensili.reduce((sum, item) => sum + item.costi, 0);
  const marginePercentuale = ((totalRicavi - totalCosti) / totalRicavi) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Report e Analytics</h1>
          <p className="text-slate-600 mt-1">Dashboard completa per l'analisi delle performance aziendali</p>
        </div>
        <div className="flex gap-3">
          <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ultimo-mese">Ultimo Mese</SelectItem>
              <SelectItem value="ultimo-trimestre">Ultimo Trimestre</SelectItem>
              <SelectItem value="ultimo-semestre">Ultimo Semestre</SelectItem>
              <SelectItem value="ultimo-anno">Ultimo Anno</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-200">
            <Download className="w-4 h-4 mr-2" />
            Esporta Report
          </Button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Euro className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-emerald-600">
              +12.5%
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {formatCurrency(totalRicavi)}
            </h3>
            <p className="text-slate-600 text-sm font-medium">Ricavi Totali</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-sm font-medium text-red-600">
              +8.2%
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {formatCurrency(totalCosti)}
            </h3>
            <p className="text-slate-600 text-sm font-medium">Costi Totali</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-sm font-medium text-emerald-600">
              +2.1%
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {marginePercentuale.toFixed(1)}%
            </h3>
            <p className="text-slate-600 text-sm font-medium">Margine Lordo</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-sm font-medium text-emerald-600">
              +3
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">24</h3>
            <p className="text-slate-600 text-sm font-medium">Commesse Attive</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ricavi e Costi Mensili */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Ricavi e Costi Mensili</h3>
              <p className="text-sm text-slate-600">Andamento negli ultimi 6 mesi</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ricaviMensili}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="mese" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelStyle={{ color: '#334155' }}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="ricavi" fill="#3b82f6" name="Ricavi" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costi" fill="#ef4444" name="Costi" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuzione per Categoria */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Commesse per Categoria</h3>
              <p className="text-sm text-slate-600">Distribuzione percentuale</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={commessePerCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {commessePerCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Margini Mensili */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Andamento Margini</h3>
            <p className="text-sm text-slate-600">Evoluzione del margine operativo</p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ricaviMensili}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="mese" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Margine']}
                labelStyle={{ color: '#334155' }}
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="margine" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Commesse */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Performance Commesse</h3>
            <p className="text-sm text-slate-600">Top performing per ricavi e margini</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 rounded-lg">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Commessa</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 text-sm">Ricavi</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 text-sm">Margine %</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Stato</th>
                <th className="text-center py-3 px-4 font-medium text-slate-700 text-sm">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {performanceCommesse.map((commessa, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-900">{commessa.nome}</div>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-slate-900">
                    {formatCurrency(commessa.ricavi)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-medium ${
                      commessa.margine >= 35 ? 'text-emerald-600' : 
                      commessa.margine >= 25 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {commessa.margine.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      commessa.stato === 'Completata' ? 'bg-green-100 text-green-800 border-green-200' :
                      commessa.stato === 'In corso' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                      {commessa.stato}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            commessa.margine >= 35 ? 'bg-emerald-500' : 
                            commessa.margine >= 25 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(commessa.margine / 40) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Report;
