import React, { useState, useEffect } from 'react';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { apiClient } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { SortingState } from '@tanstack/react-table';

interface StagingCausaleContabile {
  id: string;
  codiceCausale: string;
  descrizione: string;
  tipoMovimento: string;
  tipoAggiornamento: string;
  bloccoRegistrazioni: string;
  stampaGiornale: string;
  stampaRegistroIva: string;
  stampaLiquidazioneIva: string;
}

const columns: ColumnDef<StagingCausaleContabile>[] = [
  {
    accessorKey: 'codiceCausale',
    header: 'Codice',
  },
  {
    accessorKey: 'descrizione',
    header: 'Descrizione',
  },
  {
    accessorKey: 'tipoMovimento',
    header: 'Tipo Movimento',
  },
  {
    accessorKey: 'tipoAggiornamento',
    header: 'Tipo Aggiornamento',
  },
  {
    accessorKey: 'bloccoRegistrazioni',
    header: 'Blocco Registrazioni',
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.getValue('bloccoRegistrazioni') === 'S' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
      }`}>
        {row.getValue('bloccoRegistrazioni') === 'S' ? 'Sì' : 'No'}
      </span>
    ),
  },
  {
    accessorKey: 'stampaGiornale',
    header: 'Stampa Giornale',
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.getValue('stampaGiornale') === 'S' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {row.getValue('stampaGiornale') === 'S' ? 'Sì' : 'No'}
      </span>
    ),
  },
];

export function StagingCausaliTable() {
  const { toast } = useToast();
  const [data, setData] = useState<StagingCausaleContabile[]>([]);
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

      const response = await apiClient.get(`/staging/causali?${params}`);
      setData(response.data.data || []);
      setTotalCount(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Errore nel caricamento causali staging:', error);
      toast({
        title: 'Errore nel caricamento',
        description: 'Impossibile caricare le causali di staging.',
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
        <h2 className="text-2xl font-bold tracking-tight">Causali Contabili di Staging</h2>
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
        emptyMessage="Nessuna causale contabile di staging trovata."
      />
    </div>
  );
} 