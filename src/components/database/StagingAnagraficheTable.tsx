import React, { useState, useEffect } from 'react';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { apiClient } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { SortingState } from '@tanstack/react-table';

interface StagingAnagrafica {
  id: string;
  tipo: string;
  ragioneSociale: string;
  nome: string;
  cognome: string;
  codiceFiscale: string;
  partitaIva: string;
  indirizzo: string;
  cap: string;
  citta: string;
  provincia: string;
  telefono: string;
  email: string;
}

const columns: ColumnDef<StagingAnagrafica>[] = [
  {
    accessorKey: 'tipo',
    header: 'Tipo',
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.getValue('tipo') === 'C' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
      }`}>
        {row.getValue('tipo') === 'C' ? 'Cliente' : 'Fornitore'}
      </span>
    ),
  },
  {
    accessorKey: 'ragioneSociale',
    header: 'Ragione Sociale',
  },
  {
    accessorKey: 'nome',
    header: 'Nome',
  },
  {
    accessorKey: 'cognome',
    header: 'Cognome',
  },
  {
    accessorKey: 'codiceFiscale',
    header: 'Codice Fiscale',
  },
  {
    accessorKey: 'partitaIva',
    header: 'P.IVA',
  },
  {
    accessorKey: 'citta',
    header: 'Città',
  },
  {
    accessorKey: 'provincia',
    header: 'Provincia',
  },
];

export function StagingAnagraficheTable() {
  const { toast } = useToast();
  const [data, setData] = useState<StagingAnagrafica[]>([]);
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

      const response = await apiClient.get(`/staging/anagrafiche?${params}`);
      setData(response.data.data || []);
      setTotalCount(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Errore nel caricamento anagrafiche staging:', error);
      toast({
        title: 'Errore nel caricamento',
        description: 'Impossibile caricare le anagrafiche di staging.',
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
    setPage(1); // Reset to first page when changing page size
  };

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
    setPage(1); // Reset to first page when searching
  };

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    setPage(1); // Reset to first page when sorting
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Anagrafiche di Staging</h2>
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
        emptyMessage="Nessuna anagrafica di staging trovata."
      />
    </div>
  );
} 