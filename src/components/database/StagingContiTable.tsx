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
    { accessorKey: "codice", header: ({ column }) => <DataTableColumnHeader column={column} title="Codice" />, cell: ({ row }) => <div className="min-w-[100px]"><Badge variant="secondary">{row.getValue("codice")}</Badge></div> },
    { accessorKey: "codiceFiscaleAzienda", header: ({ column }) => <DataTableColumnHeader column={column} title="CF Azienda" />, cell: ({ row }) => <div className="min-w-[150px]">{row.getValue("codiceFiscaleAzienda")}</div> },
    { accessorKey: "subcodiceAzienda", header: ({ column }) => <DataTableColumnHeader column={column} title="Subcodice" />, cell: ({ row }) => <div className="min-w-[100px]">{row.getValue("subcodiceAzienda")}</div> },

    // Descrittivi
    { 
      accessorKey: "descrizione", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione" />, 
      enableHiding: false,
      cell: ({ row }) => (
        <div className="min-w-[300px] truncate" title={row.getValue("descrizione")}>
          {row.getValue("descrizione")}
        </div>
      )
    },
    { 
      accessorKey: "descrizioneLocale", 
      header: ({ column }) => <DataTableColumnHeader column={column} title="Desc. Locale" />,
      cell: ({ row }) => (
        <div className="min-w-[300px] truncate" title={row.getValue("descrizioneLocale")}>
          {row.getValue("descrizioneLocale")}
        </div>
      )
    },
    
    // Classificazione
    { accessorKey: "sigla", header: ({ column }) => <DataTableColumnHeader column={column} title="Sigla" />, cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("sigla")}</div> },
    { accessorKey: "livello", header: ({ column }) => <DataTableColumnHeader column={column} title="Livello" />, cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("livello")}</div> },
    { accessorKey: "tipo", header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />, cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("tipo")}</div> },
    { accessorKey: "gruppo", header: ({ column }) => <DataTableColumnHeader column={column} title="Gruppo" />, cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("gruppo")}</div> },
    { accessorKey: "naturaConto", header: ({ column }) => <DataTableColumnHeader column={column} title="Natura" />, cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("naturaConto")}</div> },
    { accessorKey: "controlloSegno", header: ({ column }) => <DataTableColumnHeader column={column} title="Ctrl Segno" />, cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("controlloSegno")}</div> },

    // Validità
    { accessorKey: "validoImpresaOrdinaria", header: ({ column }) => <DataTableColumnHeader column={column} title="Ord." />, cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("validoImpresaOrdinaria")}</div> },
    { accessorKey: "validoImpresaSemplificata", header: ({ column }) => <DataTableColumnHeader column={column} title="Semp." />, cell: ({ row }) => <div className="min-w-[80px]">{row.getValue("validoImpresaSemplificata")}</div> },
    { accessorKey: "validoProfessionistaOrdinario", header: ({ column }) => <DataTableColumnHeader column={column} title="Prof. Ord." />, cell: ({ row }) => <div className="min-w-[100px]">{row.getValue("validoProfessionistaOrdinario")}</div> },
    { accessorKey: "validoProfessionistaSemplificato", header: ({ column }) => <DataTableColumnHeader column={column} title="Prof. Semp." />, cell: ({ row }) => <div className="min-w-[100px]">{row.getValue("validoProfessionistaSemplificato")}</div> },

    // Raccordi Fiscali
    { accessorKey: "codiceClasseIrpefIres", header: ({ column }) => <DataTableColumnHeader column={column} title="Cl. IRPEF/IRES" />, cell: ({ row }) => <div className="min-w-[120px]">{row.getValue("codiceClasseIrpefIres")}</div> },
    { accessorKey: "codiceClasseIrap", header: ({ column }) => <DataTableColumnHeader column={column} title="Cl. IRAP" />, cell: ({ row }) => <div className="min-w-[120px]">{row.getValue("codiceClasseIrap")}</div> },
    { accessorKey: "contoDareCee", header: ({ column }) => <DataTableColumnHeader column={column} title="Conto Dare CEE" />, cell: ({ row }) => <div className="min-w-[150px]">{row.getValue("contoDareCee")}</div> },
    { accessorKey: "contoAvereCee", header: ({ column }) => <DataTableColumnHeader column={column} title="Conto Avere CEE" />, cell: ({ row }) => <div className="min-w-[150px]">{row.getValue("contoAvereCee")}</div> },

    // Metadati
    { accessorKey: "sourceFileName", header: ({ column }) => <DataTableColumnHeader column={column} title="File Origine" />, cell: ({ row }) => <div className="min-w-[200px] truncate" title={row.getValue("sourceFileName")}>{row.getValue("sourceFileName")}</div> },
    { accessorKey: "importedAt", header: ({ column }) => <DataTableColumnHeader column={column} title="Importato il" />, cell: ({ row }) => <div className="min-w-[150px]">{format(new Date(row.getValue("importedAt")), "dd/MM/yyyy HH:mm:ss")}</div> },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dati Provvisori - Piano dei Conti</CardTitle>
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