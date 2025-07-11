export * from '@prisma/client';

import { Commessa, Cliente, ScritturaContabile, RigaScrittura, Conto, StagingConto, VoceAnalitica } from "@prisma/client";

// Tipi personalizzati che estendono i modelli Prisma
export type CommessaWithRelations = Commessa & {
  cliente: Cliente | null;
  padre: Commessa | null;
  figlie: Commessa[];
  totale_costi: number;
  totale_ricavi: number;
};

export type StagingContoWithRelations = StagingConto;

export type RegistrazioneWithRelations = ScritturaContabile & {
    righe: (RigaScrittura & {
        conto: Conto;
    })[];
};

// Tipo semplificato per i conti nell'interfaccia utente
export interface ContoForUI {
  id: string;
  codice: string;
  nome: string;
}

export type VoceAnaliticaWithRelations = VoceAnalitica & {
  conti: ContoForUI[];
};

export interface TableStats {
  [tableName: string]: {
    count: number;
    name: string;
  };
} 