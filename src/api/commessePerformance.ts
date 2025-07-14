interface CommessaWithPerformance {
  id: string;
  nome: string;
  descrizione?: string;
  cliente: {
    id: string;
    nome: string;
  };
  parentId?: string;
  stato: string;
  dataInizio?: Date;
  dataFine?: Date;
  ricavi: number;
  costi: number;
  budget: number;
  margine: number;
  percentualeAvanzamento: number;
  figlie?: CommessaWithPerformance[];
}

interface CommessePerformanceResponse {
  commesse: CommessaWithPerformance[];
  clienti: Array<{ id: string; nome: string; externalId?: string }>;
}

export const getCommesseWithPerformance = async (): Promise<CommessePerformanceResponse> => {
  const response = await fetch('/api/commesse-performance');
  if (!response.ok) {
    throw new Error('Errore nel caricamento delle commesse con performance');
  }
  return response.json();
};

export type { CommessaWithPerformance, CommessePerformanceResponse };