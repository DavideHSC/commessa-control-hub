import React, { useEffect, useState } from 'react';
import { CheckCircle, CircleDashed, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface FinalizationEvent {
  step: string;
  status?: 'running' | 'completed' | 'skipped' | 'error' | 'pending';
  message: string;
  count?: number;
}

const STEPS = [
  { key: 'anagrafiche', label: 'Anagrafiche Clienti/Fornitori' },
  { key: 'causali', label: 'Causali Contabili' },
  { key: 'codici_iva', label: 'Codici IVA' },
  { key: 'condizioni_pagamento', label: 'Condizioni di Pagamento' },
  { key: 'conti', label: 'Piano dei Conti' },
  { key: 'scritture', label: 'Scritture Contabili' },
];

export const FinalizationStatus: React.FC<{ onComplete: () => void; onError: () => void; }> = ({ onComplete, onError }) => {
  const [events, setEvents] = useState<FinalizationEvent[]>([]);
  const [stepStatus, setStepStatus] = useState<Record<string, FinalizationEvent>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('/api/staging/events');
    
    eventSource.onopen = () => {
      console.log('SSE connection opened.');
      setStepStatus(STEPS.reduce((acc, step) => ({ ...acc, [step.key]: { step: step.key, message: 'In attesa...', status: 'pending' } }), {}));
    };

    eventSource.onmessage = (event) => {
      const data: FinalizationEvent = JSON.parse(event.data);
      setEvents(prev => [...prev, data]);
      
      setStepStatus(prev => ({ ...prev, [data.step]: data }));

      if (data.step === 'end') {
        setIsCompleted(true);
        eventSource.close();
      }
      if (data.step === 'error') {
        setHasError(true);
        eventSource.close();
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      setHasError(true);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleComplete = () => {
    onComplete();
  };

  const handleError = () => {
    onError();
  };

  const getStepIcon = (status?: string) => {
    switch (status) {
      case 'running': return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'skipped': return <CircleDashed className="h-5 w-5 text-gray-400" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <CircleDashed className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stato della Finalizzazione</CardTitle>
        <CardDescription>
          {isCompleted 
            ? "Finalizzazione completata con successo! Puoi chiudere questa finestra."
            : hasError 
            ? "Si è verificato un errore durante la finalizzazione."
            : "Il sistema sta trasferendo i dati dalle tabelle di staging a quelle di produzione."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 w-full pr-4">
          <ul className="space-y-4">
            {STEPS.map(step => (
              <li key={step.key} className="flex items-center space-x-4">
                {getStepIcon(stepStatus[step.key]?.status)}
                <div className="flex-grow">
                  <p className="font-semibold">{step.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {stepStatus[step.key]?.message || 'In attesa...'}
                  </p>
                </div>
                {stepStatus[step.key]?.status === 'completed' && stepStatus[step.key]?.count !== undefined && (
                   <span className="text-sm font-medium text-gray-500">{stepStatus[step.key]?.count} records</span>
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
        
        {(isCompleted || hasError) && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            {isCompleted && (
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Chiudi - Completato
              </Button>
            )}
            {hasError && (
              <Button onClick={handleError} variant="destructive">
                Chiudi - Errore
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 