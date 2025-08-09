import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle, AlertTriangle, Clock, Activity, Server, Database } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Progress } from '../ui/Progress';
import { Card, CardContent } from '../ui/Card';

interface FinalizationStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  description?: string;
  count?: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
}

interface FinalizationMonitorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export const FinalizationMonitor = ({
  open,
  onOpenChange,
  onComplete,
  onError
}: FinalizationMonitorProps) => {
  const [steps, setSteps] = useState<FinalizationStep[]>([
    { id: 'clean_slate', label: 'Eliminazione Dati Esistenti', status: 'pending', description: 'Pulizia completa dati di produzione' },
    { id: 'anagrafiche', label: 'Anagrafiche', status: 'pending', description: 'Clienti e Fornitori' },
    { id: 'causali', label: 'Causali Contabili', status: 'pending', description: 'Tipologie di movimenti' },
    { id: 'codici_iva', label: 'Codici IVA', status: 'pending', description: 'Aliquote e regimi IVA' },
    { id: 'condizioni_pagamento', label: 'Condizioni Pagamento', status: 'pending', description: 'Termini di pagamento' },
    { id: 'conti', label: 'Piano dei Conti', status: 'pending', description: 'Struttura contabile aziendale' },
    { id: 'scritture', label: 'Scritture Contabili', status: 'pending', description: 'Movimenti contabili' },
    { id: 'righe_iva', label: 'Righe IVA', status: 'pending', description: 'Dettagli imposte' },
    { id: 'allocazioni', label: 'Allocazioni Costi', status: 'pending', description: 'Distribuzioni su commesse' },
  ]);
  
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [totalRecords, setTotalRecords] = useState({ processed: 0, total: 0 });
  const [estimatedTime, setEstimatedTime] = useState<string>('');

  // Initialize SSE connection and start monitoring
  const startMonitoring = useCallback(async () => {
    if (!open) return;

    setStartTime(new Date());
    setIsConnected(false);
    
    try {
      // Start finalization process
      const response = await fetch('/api/staging/finalize', { method: 'POST' });
      
      if (!response.ok) {
        const errorText = await response.text();
        onError?.(`Errore nell'avvio del processo: ${errorText}`);
        return;
      }

      // Setup SSE for real-time updates
      const eventSource = new EventSource('/api/staging/events');
      setIsConnected(true);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📊 Finalization Monitor SSE:', data);
          
          // Update current step
          setCurrentStep(data.step);
          
          // Update steps status
          setSteps(current => 
            current.map(step => {
              if (step.id === data.step) {
                const updatedStep: FinalizationStep = {
                  ...step,
                  status: data.status || 'running',
                  description: data.message || step.description,
                  count: data.count,
                };
                
                // Add timing information
                if (data.status === 'running' && !step.startTime) {
                  updatedStep.startTime = new Date().toISOString();
                } else if (data.status === 'completed' && step.startTime && !step.endTime) {
                  updatedStep.endTime = new Date().toISOString();
                  updatedStep.duration = new Date().getTime() - new Date(step.startTime).getTime();
                }
                
                return updatedStep;
              }
              return step;
            })
          );

          // Calculate progress
          const completedSteps = steps.filter(s => s.status === 'completed').length;
          const totalSteps = steps.length;
          const progressPercent = Math.round((completedSteps / totalSteps) * 100);
          setProgress(progressPercent);
          
          // Update estimated time
          if (startTime && completedSteps > 0) {
            const elapsed = new Date().getTime() - startTime.getTime();
            const avgTimePerStep = elapsed / completedSteps;
            const remainingSteps = totalSteps - completedSteps;
            const estimatedRemaining = (remainingSteps * avgTimePerStep) / 1000 / 60; // in minutes
            setEstimatedTime(estimatedRemaining > 1 ? `~${Math.ceil(estimatedRemaining)} min` : '<1 min');
          }

          // Handle completion
          if (data.step === 'end') {
            setProgress(100);
            setIsConnected(false);
            eventSource.close();
            
            setTimeout(() => {
              onComplete?.();
            }, 2000); // Show completed state for 2 seconds
            return;
          }

          // Handle errors
          if (data.step === 'error') {
            setIsConnected(false);
            eventSource.close();
            onError?.(data.message);
            return;
          }

        } catch (parseError) {
          console.error('Error parsing SSE data:', parseError);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Connection Error:', error);
        setIsConnected(false);
        eventSource.close();
        
        // Fallback to polling
        startFallbackPolling();
      };

      // Cleanup on dialog close
      const cleanup = () => {
        eventSource.close();
        setIsConnected(false);
      };

      // Store cleanup function
      (window as any).__finalizationCleanup = cleanup;

    } catch (error) {
      console.error('Error starting monitoring:', error);
      onError?.('Errore nell\'avvio del monitoraggio');
    }
  }, [open, onComplete, onError, startTime, steps]);

  // Fallback polling when SSE fails
  const startFallbackPolling = useCallback(() => {
    const poll = async () => {
      try {
        const response = await fetch('/api/staging/stats');
        if (response.ok) {
          const stats = await response.json();
          const totalRecords = Object.values(stats).reduce((sum: number, count: any) => sum + (count || 0), 0);
          
          if (totalRecords === 0) {
            setProgress(100);
            setTimeout(() => onComplete?.(), 2000);
            return;
          }
          
          // Simple progress based on remaining records
          const progressPercent = Math.max(10, 100 - (totalRecords / 100));
          setProgress(Math.min(95, progressPercent));
        }
      } catch (error) {
        console.error('Fallback polling error:', error);
      }
      
      // Continue polling
      setTimeout(poll, 5000);
    };

    setTimeout(poll, 5000);
  }, [onComplete]);

  // Start monitoring when dialog opens
  useEffect(() => {
    if (open) {
      startMonitoring();
    }

    // Cleanup on unmount
    return () => {
      if ((window as any).__finalizationCleanup) {
        (window as any).__finalizationCleanup();
        delete (window as any).__finalizationCleanup;
      }
    };
  }, [open, startMonitoring]);

  const getStepIcon = (step: FinalizationStep) => {
    switch (step.status) {
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStepClassName = (step: FinalizationStep) => {
    switch (step.status) {
      case 'running':
        return 'text-blue-600 font-semibold border-l-4 border-blue-500 bg-blue-50';
      case 'completed':
        return 'text-green-600 border-l-4 border-green-500 bg-green-50';
      case 'error':
        return 'text-red-600 border-l-4 border-red-500 bg-red-50';
      default:
        return 'text-gray-500 border-l-4 border-gray-200';
    }
  };

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const elapsedTime = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-blue-500" />
            <span>Monitoraggio Finalizzazione</span>
            {isConnected && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-normal">Real-time</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Progress Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Progresso Complessivo</span>
                  <span className="font-bold text-blue-600">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{completedSteps}/{totalSteps}</div>
                    <div className="text-gray-500">Passi</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{elapsedTime}m</div>
                    <div className="text-gray-500">Trascorso</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{estimatedTime || '--'}</div>
                    <div className="text-gray-500">Rimanente</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Server className={`w-4 h-4 ${isConnected ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm font-medium">
                Connessione Server: {isConnected ? 'Attiva' : 'Polling'}
              </span>
            </div>
            <Database className="w-4 h-4 text-gray-400" />
          </div>

          {/* Steps Detail */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Passi di Finalizzazione:</h4>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg transition-all ${getStepClassName(step)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStepIcon(step)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{step.label}</div>
                        <div className="text-xs text-gray-500">#{index + 1}</div>
                      </div>
                      <div className="text-xs mt-1 opacity-75">
                        {step.description}
                      </div>
                      {step.count !== undefined && (
                        <div className="text-xs mt-2 font-medium">
                          📊 {step.count.toLocaleString()} record processati
                        </div>
                      )}
                      {step.duration && (
                        <div className="text-xs mt-1 opacity-60">
                          ⏱️ Completato in {Math.round(step.duration / 1000)}s
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              💡 Questo processo è irreversibile e sostituisce tutti i dati di produzione
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={progress > 0 && progress < 100}
            >
              {progress === 100 ? 'Chiudi' : 'Minimizza'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};