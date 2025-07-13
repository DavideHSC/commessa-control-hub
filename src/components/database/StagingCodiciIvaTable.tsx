import React, { useState, useEffect } from 'react';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { apiClient } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { SortingState } from '@tanstack/react-table';

interface StagingCodiceIva {
  id: string;
  codiceIva: string;
  descrizione: string;
  aliquota: string;
  natura: string;
  tipoOperazione: string;
  detraibile: string;
  percentualeDetraibilita: string;
  esigibilita: string;
}

const columns: ColumnDef<StagingCodiceIva>[] = [
  {
    accessorKey: 'codiceIva',
    header: 'Codice',
  },
  {
    accessorKey: 'descrizione',
    header: 'Descrizione',
  },
  {
    accessorKey: 'aliquota',
    header: 'Aliquota %',
    cell: ({ row }) => {
      const aliquota = row.getValue('aliquota') as string;
      return <span className="font-mono">{aliquota}%</span>;
    },
  },
  {
    accessorKey: 'natura',
    header: 'Natura',
  },
  {
    accessorKey: 'tipoOperazione',
    header: 'Tipo Operazione',
  },
  {
    accessorKey: 'detraibile',
    header: 'Detraibile',
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.getValue('detraibile') === 'S' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {row.getValue('detraibile') === 'S' ? 'Sì' : 'No'}
      </span>
    ),
  },
  {
    accessorKey: 'percentualeDetraibilita',
    header: '% Detraibilità',
    cell: ({ row }) => {
      const perc = row.getValue('percentualeDetraibilita') as string;
      return perc ? <span className="font-mono">{perc}%</span> : '-';
    },
  },
  {
    accessorKey: 'esigibilita',
    header: 'Esigibilità',
  },
];

export function StagingCodiciIvaTable() {
  const { toast } = useToast();
  const [data, setData] = useState<StagingCodiceIva[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchValue, setSearchValue] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchData = async (
    currentPage: number = page,
    currentPageSize: number = pageSize,
    search: string = searchValue,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentPageSize.toString(),
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
      });

      const response = await apiClient.get(`/staging/codici-iva?${params}`);
      setData(response.data.data || []);
      setTotalCount(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Errore nel caricamento codici IVA staging:', error);
      toast({
        title: 'Errore nel caricamento',
        description: 'Impossibile caricare i codici IVA di staging.',
        variant: 'destructive',
      });
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, searchValue, sorting]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
    setPage(1);
  };

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Codici IVA di Staging</h2>
      </div>
      
      <AdvancedDataTable
        columns={columns}
        data={data}
        loading={loading}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        emptyMessage="Nessun codice IVA di staging trovato."
      />
    </div>
  );
} 