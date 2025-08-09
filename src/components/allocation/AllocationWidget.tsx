import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getAllocationStats } from '@/api';
import { AllocationStats } from '@shared-types/index';
import { AlertCircle, CheckCircle, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AllocationWidgetProps {
  onOpenWizard?: () => void;
}

export const AllocationWidget: React.FC<AllocationWidgetProps> = ({ onOpenWizard }) => {
  const [stats, setStats] = useState<AllocationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const data = await getAllocationStats();
      setStats(data);
    } catch (error) {
      console.error('Errore nel caricamento delle statistiche di allocazione:', error);
      toast({
        title: 'Errore caricamento statistiche',
        description: 'Impossibile caricare le statistiche di allocazione.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh ogni 30 secondi
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Stato Allocazioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Errore Caricamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Impossibile caricare le statistiche di allocazione.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (stats.unallocatedCount === 0) {
      return (
        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
          <CheckCircle className="h-3 w-3 mr-1" />
          Tutto Allocato
        </Badge>
      );
    }
    
    if (stats.allocationPercentage >= 80) {
      return (
        <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50">
          <TrendingUp className="h-3 w-3 mr-1" />
          Quasi Completo
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
        <AlertCircle className="h-3 w-3 mr-1" />
        Richiede Attenzione
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Allocazione Movimenti
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso Allocazione</span>
            <span className="font-semibold">{stats.allocationPercentage}%</span>
          </div>
          <Progress 
            value={stats.allocationPercentage} 
            className="h-2"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Movimenti da Allocare</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.unallocatedCount.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Importo Totale</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(stats.totalUnallocatedAmount)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Movimenti Totali</p>
            <p className="text-lg font-semibold">
              {stats.totalMovements.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Finalizzati</p>
            <p className="text-lg font-semibold text-green-600">
              {stats.finalizedCount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {stats.unallocatedCount > 0 && (
          <Button 
            onClick={onOpenWizard || (() => window.location.href = '/riconciliazione')}
            className="w-full"
            variant={stats.unallocatedCount > 100 ? "destructive" : "default"}
          >
            Avvia Allocazione
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}

        {/* Last Update */}
        <div className="text-xs text-muted-foreground text-center">
          Ultimo aggiornamento: {new Date().toLocaleTimeString('it-IT')}
        </div>
      </CardContent>
    </Card>
  );
};