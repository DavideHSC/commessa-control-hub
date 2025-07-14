import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Activity, 
  Building2, 
  ChevronRight,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import type { CommessaDashboard } from '../../types';

interface HierarchicalCommesseTableProps {
  commesse: CommessaDashboard[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

const formatPercent = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 1 }).format(value / 100);
};

const getMargineColor = (margine: number) => {
  if (margine > 15) return 'text-green-700 bg-green-50';
  if (margine > 5) return 'text-yellow-700 bg-yellow-50';
  if (margine >= 0) return 'text-orange-700 bg-orange-50';
  return 'text-red-700 bg-red-50';
};

export const HierarchicalCommesseTable: React.FC<HierarchicalCommesseTableProps> = ({ commesse }) => {
  const handleViewDetails = (id: string) => {
    window.location.assign(`/commesse/${id}`);
  };

  // Separa le commesse padre da quelle che potrebbero non avere figlie
  const commessePadre = commesse.filter(c => c.isParent);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Panoramica Commesse
          </CardTitle>
          <Badge variant="outline">{commessePadre.length} comuni</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {commessePadre.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <div className="text-lg font-medium">Nessuna commessa trovata</div>
            <div className="text-sm">Importa i dati o crea una nuova commessa per iniziare.</div>
          </div>
        ) : (
          <Accordion type="multiple" className="w-full space-y-2">
            {commessePadre.map(comune => (
              <AccordionItem key={comune.id} value={comune.id} className="border border-slate-200 rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center justify-between w-full pr-4">
                    
                    {/* Info Comune */}
                    <div className="flex items-center gap-4">
                      <Building2 className="h-6 w-6 text-slate-600" />
                      <div className="text-left">
                        <div className="font-bold text-lg text-slate-900">{comune.nome}</div>
                        <div className="text-sm text-slate-500">{comune.cliente.nome}</div>
                      </div>
                    </div>

                    {/* KPI Riassuntivi del Comune */}
                    <div className="flex items-center gap-6 text-sm">
                      
                      {/* Ricavi */}
                      <div className="text-center">
                        <div className="font-medium text-green-700">{formatCurrency(comune.ricavi)}</div>
                        <div className="text-xs text-slate-500">Ricavi</div>
                      </div>

                      {/* Costi */}
                      <div className="text-center">
                        <div className="font-medium text-red-700">{formatCurrency(comune.costi)}</div>
                        <div className="text-xs text-slate-500">Costi</div>
                      </div>

                      {/* Margine */}
                      <div className="text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMargineColor(comune.margine)}`}>
                          {formatPercent(comune.margine)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Margine</div>
                      </div>

                      {/* Attività */}
                      <div className="text-center">
                        <div className="font-medium text-slate-700">{comune.figlie?.length || 0}</div>
                        <div className="text-xs text-slate-500">Attività</div>
                      </div>

                      {/* Azione - Usando span invece di Button per evitare button dentro button */}
                      <span
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 cursor-pointer transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(comune.id);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Dettagli
                      </span>

                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-2 pb-4">
                  {comune.figlie && comune.figlie.length > 0 ? (
                    <div className="pl-10">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold">Attività</TableHead>
                            <TableHead className="font-semibold text-right">Ricavi</TableHead>
                            <TableHead className="font-semibold text-right">Costi</TableHead>
                            <TableHead className="font-semibold text-right">Margine</TableHead>
                            <TableHead className="font-semibold text-right">Budget</TableHead>
                            <TableHead className="font-semibold text-center">Azioni</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {comune.figlie.map(attivita => (
                            <TableRow key={attivita.id} className="hover:bg-slate-50">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <ChevronRight className="h-4 w-4 text-slate-400" />
                                  <div>
                                    <div className="font-medium text-slate-800">{attivita.nome}</div>
                                    <div className="text-xs text-slate-500">
                                      {attivita.cliente.nome}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(attivita.ricavi)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(attivita.costi)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMargineColor(attivita.margine)}`}>
                                  {formatPercent(attivita.margine)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right text-slate-600">
                                {formatCurrency(attivita.budget)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(attivita.id)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Dettagli
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-slate-500 py-4 pl-10">
                      Nessuna attività associata a questo comune.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};