import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/api';
import { Brain, TrendingUp, Clock, Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SmartSuggestion {
  type: 'rule' | 'historical' | 'pattern';
  commessaId: string;
  commessaNome: string;
  voceAnaliticaId: string;
  voceAnaliticaNome: string;
  percentuale?: number;
  frequency?: number;
  confidence: number;
  reasoning: string;
}

interface SmartSuggestionsProps {
  rigaId: string;
  contoId: string;
  importo: number;
  descrizione: string;
  onApplySuggestion: (suggestion: SmartSuggestion) => void;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  rigaId,
  contoId,
  importo,
  descrizione,
  onApplySuggestion
}) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/smart-allocation/suggest', {
        rigaId,
        contoId,
        importo,
        descrizione
      });
      
      setSuggestions(response.data.suggestions || []);
      setAnalyzed(true);
      
      toast({
        title: "Analisi completata",
        description: `Trovati ${response.data.suggestions.length} suggerimenti intelligenti`,
      });
    } catch (error) {
      console.error('Errore nel recupero suggerimenti:', error);
      toast({
        title: "Errore",
        description: "Impossibile generare suggerimenti intelligenti",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rule':
        return <Zap className="h-4 w-4" />;
      case 'historical':
        return <Clock className="h-4 w-4" />;
      case 'pattern':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'rule':
        return 'Regola';
      case 'historical':
        return 'Storico';
      case 'pattern':
        return 'Pattern';
      default:
        return 'Intelligente';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!analyzed) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Suggerimenti Intelligenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Analizza questa riga per suggerimenti di allocazione basati su regole e storico
            </p>
            <Button 
              onClick={fetchSuggestions}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Analisi in corso...' : 'Genera Suggerimenti'}
              <Brain className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-gray-400" />
            Nessun Suggerimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Non sono stati trovati suggerimenti intelligenti per questa riga.
              Procedi con l'allocazione manuale.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          Suggerimenti Intelligenti
          <Badge variant="outline" className="ml-auto">
            {suggestions.length} trovati
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getTypeIcon(suggestion.type)}
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel(suggestion.type)}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}
                >
                  {(suggestion.confidence * 100).toFixed(0)}% confidenza
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onApplySuggestion(suggestion)}
                className="h-8"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Applica
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-medium">Commessa:</p>
                <p className="text-muted-foreground">{suggestion.commessaNome}</p>
              </div>
              <div>
                <p className="font-medium">Voce Analitica:</p>
                <p className="text-muted-foreground">{suggestion.voceAnaliticaNome}</p>
              </div>
            </div>

            {suggestion.percentuale && (
              <div className="text-sm">
                <p className="font-medium">Allocazione Suggerita:</p>
                <p className="text-muted-foreground">
                  {suggestion.percentuale}% = {formatCurrency(importo * (suggestion.percentuale / 100))}
                </p>
              </div>
            )}

            {suggestion.frequency && (
              <div className="text-sm">
                <p className="font-medium">Frequenza:</p>
                <p className="text-muted-foreground">
                  Usato {suggestion.frequency} volte in passato
                </p>
              </div>
            )}

            <hr className="my-2" />
            
            <div className="text-xs text-muted-foreground">
              <p><strong>Motivazione:</strong> {suggestion.reasoning}</p>
            </div>
          </div>
        ))}

        <div className="text-xs text-muted-foreground text-center pt-2">
          I suggerimenti sono ordinati per confidenza. Applica quello più appropriato.
        </div>
      </CardContent>
    </Card>
  );
};