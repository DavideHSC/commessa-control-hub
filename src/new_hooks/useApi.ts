import { useState, useCallback } from 'react';

interface UseApiOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

export const useApi = <T>(endpoint: string, options?: UseApiOptions) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      options?.onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      options?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  const create = useCallback(async (item: Partial<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newItem = await response.json() as T;
      setData(prev => [...prev, newItem]);
      options?.onSuccess?.(newItem);
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Create operation failed';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  const update = useCallback(async (id: string, item: Partial<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedItem = await response.json() as T;
      setData(prev => prev.map(existing => 
        (existing as Record<string, unknown>).id === id ? updatedItem : existing
      ));
      options?.onSuccess?.(updatedItem);
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update operation failed';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setData(prev => prev.filter(item => (item as Record<string, unknown>).id !== id));
      options?.onSuccess?.({ id });
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete operation failed';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  return {
    data,
    loading,
    error,
    fetch: fetchData,
    create,
    update,
    remove,
    setData,
    setError,
  };
};