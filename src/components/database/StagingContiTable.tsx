import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StagingConto } from '@prisma/client';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import { format } from 'date-fns';

export const StagingContiTable = () => {
  const {
    data,
    totalCount,
    page,
    pageSize,
    search,
    sorting,
    loading,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onSortingChange,
  } = useAdvancedTable<StagingConto>({
    endpoint: '/api/staging/conti',
    initialSorting: [{ id: 'importedAt', desc: true }]
  });

  const columns: ColumnDef<StagingConto>[] = [
    // Identificativi
    { accessorKey: "codice", header: ({ column }) => <DataTableColumnHeader column={column} title="Codice" />, cell: ({ row }) => <Badge variant="secondary">{row.getValue("codice")}</Badge> },
    { accessorKey: "codiceFiscaleAzienda", header: ({ column }) => <DataTableColumnHeader column={column} title="CF Azienda" /> },
    { accessorKey: "subcodiceAzienda", header: ({ column }) => <DataTableColumnHeader column={column} title="Subcodice" /> },

    // Descrittivi
    { accessorKey: "descrizione", header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione" />, enableHiding: false },
    { accessorKey: "descrizioneLocale", header: ({ column }) => <DataTableColumnHeader column={column} title="Desc. Locale" /> },
    
    // Classificazione
    { accessorKey: "sigla", header: ({ column }) => <DataTableColumnHeader column={column} title="Sigla" /> },
    { accessorKey: "livello", header: ({ column }) => <DataTableColumnHeader column={column} title="Livello" /> },
    { accessorKey: "tipo", header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" /> },
    { accessorKey: "gruppo", header: ({ column }) => <DataTableColumnHeader column={column} title="Gruppo" /> },
    { accessorKey: "naturaConto", header: ({ column }) => <DataTableColumnHeader column={column} title="Natura" /> },
    { accessorKey: "controlloSegno", header: ({ column }) => <DataTableColumnHeader column={column} title="Ctrl Segno" /> },

    // Validità
    { accessorKey: "validoImpresaOrdinaria", header: ({ column }) => <DataTableColumnHeader column={column} title="Ord." /> },
    { accessorKey: "validoImpresaSemplificata", header: ({ column }) => <DataTableColumnHeader column={column} title="Semp." /> },
    { accessorKey: "validoProfessionistaOrdinario", header: ({ column }) => <DataTableColumnHeader column={column} title="Prof. Ord." /> },
    { accessorKey: "validoProfessionistaSemplificato", header: ({ column }) => <DataTableColumnHeader column={column} title="Prof. Semp." /> },

    // Raccordi Fiscali
    { accessorKey: "codiceClasseIrpefIres", header: ({ column }) => <DataTableColumnHeader column={column} title="Cl. IRPEF/IRES" /> },
    { accessorKey: "codiceClasseIrap", header: ({ column }) => <DataTableColumnHeader column={column} title="Cl. IRAP" /> },
    { accessorKey: "contoDareCee", header: ({ column }) => <DataTableColumnHeader column={column} title="Conto Dare CEE" /> },
    { accessorKey: "contoAvereCee", header: ({ column }) => <DataTableColumnHeader column={column} title="Conto Avere CEE" /> },

    // Metadati
    { accessorKey: "sourceFileName", header: ({ column }) => <DataTableColumnHeader column={column} title="File Origine" /> },
    { accessorKey: "importedAt", header: ({ column }) => <DataTableColumnHeader column={column} title="Importato il" />, cell: ({ row }) => format(new Date(row.getValue("importedAt")), "dd/MM/yyyy HH:mm:ss")},
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dati di Staging - Piano dei Conti</CardTitle>
        <CardDescription>
          Contenuto grezzo importato dai file. Usa la barra di ricerca e la gestione colonne (nel toolbar della tabella) per analizzare i dati.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AdvancedDataTable
          columns={columns}
          data={data}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          searchValue={search}
          sorting={sorting}
          loading={loading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onSearchChange={onSearchChange}
          onSortingChange={onSortingChange}
        />
      </CardContent>
    </Card>
  );
}; 