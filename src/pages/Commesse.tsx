import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building, ChevronDown, ChevronRight, FileText, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CommessaWithRelations, SottocommessaWithRelations, AllocazioneWithRelations } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const fetchCommesse = async (): Promise<CommessaWithRelations[]> => {
  const res = await fetch('/api/commesse');
  if (!res.ok) throw new Error('Errore nel caricamento delle commesse');
  const data = await res.json();
  return data.data; // L'API restituisce { data: [...] }
};

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};


// --- Componente per la singola attività (allocazione) ---
const AttivitaItem = ({ allocazione }: { allocazione: AllocazioneWithRelations }) => (
  <div className="flex justify-between items-center p-3 pl-10 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
    <div className="flex flex-col">
      <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
        {allocazione.rigaScrittura.conto.nome}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Registrazione del {format(new Date(allocazione.rigaScrittura.scritturaContabile.data), 'PPP', { locale: it })}
      </span>
    </div>
    <Badge variant="secondary" className="font-mono text-sm">
      {formatCurrency(allocazione.importo)}
    </Badge>
  </div>
);

// --- Componente per la Sottocommessa ---
const SottocommessaItem = ({ sottocommessa }: { sottocommessa: SottocommessaWithRelations }) => {
  const [isOpen, setIsOpen] = useState(false);

  const totaleAllocato = useMemo(() => {
    return sottocommessa.allocazioni.reduce((acc, alloc) => acc + (alloc.importo || 0), 0);
  }, [sottocommessa.allocazioni]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group">
      <CollapsibleTrigger asChild>
        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-gray-500" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">{sottocommessa.nome}</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">Totale: {formatCurrency(totaleAllocato)}</Badge>
            {isOpen ? <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="py-1">
        {sottocommessa.allocazioni.length > 0 ? (
          sottocommessa.allocazioni.map(alloc => (
            <AttivitaItem key={alloc.id} allocazione={alloc} />
          ))
        ) : (
          <div className="p-3 pl-10 text-sm text-gray-500 italic">
            Nessuna attività registrata per questa commessa.
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};


// --- Componente per la Commessa Principale ---
const CommessaCard = ({ commessa }: { commessa: CommessaWithRelations }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="border-b dark:border-gray-700">
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center cursor-pointer">
              <div className="flex items-center gap-4">
                <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <CardTitle className="text-lg">{commessa.nome}</CardTitle>
                  <p className="text-sm text-muted-foreground">{commessa.cliente?.nome}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{commessa._count.sottocommesse} Attività</Badge>
                {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-4 space-y-3">
            {commessa.sottocommesse.length > 0 ? (
              commessa.sottocommesse.map(sub => (
                <SottocommessaItem key={sub.id} sottocommessa={sub} />
              ))
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground italic p-4 justify-center">
                <FileText className="h-5 w-5"/>
                <span>Nessuna sotto-commessa associata.</span>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// --- Componente Pagina Principale ---
export default function CommessePage() {
  const { data: commesse, isLoading, error } = useQuery<CommessaWithRelations[]>({
    queryKey: ['commesse'],
    queryFn: fetchCommesse,
  });

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Elenco Commesse</h1>
        <p className="text-muted-foreground">Visualizza le commesse principali e le relative attività operative.</p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {error && (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Errore</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Impossibile caricare i dati delle commesse. Si è verificato un errore.</p>
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          </CardContent>
        </Card>
      )}

      {commesse && commesse.length > 0 && (
        <div className="space-y-6">
          {commesse.map(commessa => (
            <CommessaCard key={commessa.id} commessa={commessa} />
          ))}
        </div>
      )}

      {commesse && commesse.length === 0 && (
        <Card>
          <CardContent className="p-10 flex flex-col items-center justify-center gap-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Nessuna Commessa Trovata</h3>
            <p className="text-muted-foreground text-center">
              Non ci sono commesse da visualizzare. <br />
              Puoi iniziare importando nuove scritture o creandone una manualmente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
