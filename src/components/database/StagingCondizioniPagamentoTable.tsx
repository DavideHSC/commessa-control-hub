import React, { useState, useEffect } from 'react';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { apiClient } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { SortingState } from '@tanstack/react-table';

interface StagingCondizionePagamento {
  id: string;
  codicePagamento: string;
  descrizione: string;
  numeroRate: string;
  ggScadenza1: string;
  ggScadenza2: string;
  ggScadenza3: string;
  tipoScadenza: string;
  fineMese: string;
  scontoPercentuale: string;
  scontoGiorni: string;
}

const columns: ColumnDef<StagingCondizionePagamento>[] = [
  {
    accessorKey: 'codicePagamento',
    header: 'Codice',
  },
  {
    accessorKey: 'descrizione',
    header: 'Descrizione',
  },
  {
    accessorKey: 'numeroRate',
    header: 'N. Rate',
    cell: ({ row }) => {
      const rate = row.getValue('numeroRate') as string;
      return <span className="font-mono">{rate || '-'}</span>;
    },
  },
  {
    accessorKey: 'ggScadenza1',
    header: 'Gg Scadenza 1',
    cell: ({ row }) => {
      const gg = row.getValue('ggScadenza1') as string;
      return <span className="font-mono">{gg || '-'}</span>;
    },
  },
  {
    accessorKey: 'ggScadenza2',
    header: 'Gg Scadenza 2',
    cell: ({ row }) => {
      const gg = row.getValue('ggScadenza2') as string;
      return <span className="font-mono">{gg || '-'}</span>;
    },
  },
  {
    accessorKey: 'tipoScadenza',
    header: 'Tipo Scadenza',
  },
  {
    accessorKey: 'fineMese',
    header: 'Fine Mese',
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.getValue('fineMese') === 'S' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {row.getValue('fineMese') === 'S' ? 'Sì' : 'No'}
      </span>
    ),
  },
  {
    accessorKey: 'scontoPercentuale',
    header: 'Sconto %',
    cell: ({ row }) => {
      const sconto = row.getValue('scontoPercentuale') as string;
      return sconto ? <span className="font-mono">{sconto}%</span> : '-';
    },
  },
];

export function StagingCondizioniPagamentoTable() {
  const { toast } = useToast();
  const [data, setData] = useState<StagingCondizionePagamento[]>([]);
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

      const response = await apiClient.get(`/staging/condizioni-pagamento?${params}`);
      setData(response.data.data || []);
      setTotalCount(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Errore nel caricamento condizioni pagamento staging:', error);
      toast({
        title: 'Errore nel caricamento',
        description: 'Impossibile caricare le condizioni di pagamento di staging.',
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
        <h2 className="text-2xl font-bold tracking-tight">Condizioni di Pagamento di Staging</h2>
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
        emptyMessage="Nessuna condizione di pagamento di staging trovata."
      />
    </div>
  );
} 