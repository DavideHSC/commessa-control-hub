import { useState, useEffect, useCallback } from 'react';
import { SortingState } from '@tanstack/react-table';
import qs from 'qs';
import { useDebounce } from 'use-debounce';

interface UseAdvancedTableProps<T> {
  endpoint: string;
  initialSorting?: SortingState;
  initialPageSize?: number;
  filters?: Record<string, string | number | boolean | undefined>;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useAdvancedTable<T>({ 
  endpoint, 
  initialSorting = [],
  initialPageSize = 5,
  filters = {},
}: UseAdvancedTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [loading, setLoading] = useState(true);

  const [debouncedSearch] = useDebounce(search, 500);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
          const params: Record<string, string | number | boolean | undefined> = {
      ...filters,
      page,
      limit: pageSize,
    };

    // Only add search if it's not empty
    if (debouncedSearch && debouncedSearch.trim()) {
      params.search = debouncedSearch;
    }

    // Only add sorting if it exists
    if (sorting[0]?.id) {
      params.sortBy = sorting[0].id;
      params.sortOrder = sorting[0].desc ? 'desc' : 'asc';
    }
    
    const query = qs.stringify(params, { skipNulls: true });
      const response = await fetch(`${endpoint}?${query}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${endpoint}`);
      }
      const result: PaginatedResponse<T> = await response.json();
      
      setData(result.data);
      setTotalCount(result.pagination.total);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, pageSize, debouncedSearch, sorting, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    totalCount,
    page,
    pageSize,
    search,
    sorting,
    loading,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    onSearchChange: setSearch,
    onSortingChange: setSorting,
    fetchData,
  };
} 