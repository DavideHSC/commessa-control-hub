import React from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useTable } from '../../new_hooks/useTable';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface UnifiedTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
  onView?: (row: T) => void;
  customActions?: (row: T) => React.ReactNode;
  showActions?: boolean;
  searchable?: boolean;
  paginated?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowClassName?: (row: T) => string;
  editLabel?: string;
  editIcon?: any;
  showDelete?: boolean;
  showView?: boolean;
}

interface TableRowProps<T> {
  row: T;
  columns: Column<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
  onView?: (row: T) => void;
  customActions?: (row: T) => React.ReactNode;
  showActions: boolean;
  rowClassName?: (row: T) => string;
  editLabel?: string;
  editIcon?: any;
  showDelete?: boolean;
  showView?: boolean;
}

const TableRow = <T extends Record<string, unknown>>({
  row,
  columns,
  onEdit,
  onDelete,
  onView,
  customActions,
  showActions,
  rowClassName,
  editLabel = "Modifica",
  editIcon,
  showDelete = true,
  showView = true,
}: TableRowProps<T>) => {
  const handleDelete = () => {
    const id = row.id as string;
    if (id && onDelete && confirm('Sei sicuro di voler eliminare questo elemento?')) {
      onDelete(id);
    }
  };

  return (
    <tr className={`hover:bg-gray-50 transition-colors ${rowClassName ? rowClassName(row) : ''}`}>
      {columns.map((column) => {
        const value = row[column.key];
        return (
          <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {column.render ? column.render(value, row) : String(value || '')}
          </td>
        );
      })}
      {showActions && (
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
          {customActions && customActions(row)}
          {onView && showView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(row)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              Visualizza
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row)}
              className="text-green-600 hover:text-green-900"
            >
              {editIcon && React.createElement(editIcon, { className: "h-4 w-4 mr-1" })}
              {editLabel}
            </Button>
          )}
          {onDelete && showDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-900"
            >
              Elimina
            </Button>
          )}
        </td>
      )}
    </tr>
  );
};

const LoadingRows = ({ columns }: { columns: number }) => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <tr key={index}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </td>
        ))}
      </tr>
    ))}
  </>
);

const EmptyRow = ({ message, colspan }: { message: string; colspan: number }) => (
  <tr>
    <td colSpan={colspan} className="px-6 py-12 text-center">
      <div className="text-gray-500">
        <div className="text-4xl mb-2">📭</div>
        <p className="text-lg font-medium">{message}</p>
      </div>
    </td>
  </tr>
);

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
  totalItems: number;
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisiblePages = 5;
  
  let visiblePages = pages;
  if (totalPages > maxVisiblePages) {
    const start = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2) - 1);
    const end = Math.min(totalPages, start + maxVisiblePages);
    visiblePages = pages.slice(start, end);
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-700">
          Mostrando {startItem}-{endItem} di {totalItems} elementi
        </div>
        
        {onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Elementi per pagina:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={totalItems}>Tutti</option>
            </select>
          </div>
        )}
      </div>
      
      <div className="flex space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Precedente
        </Button>
        
        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Successiva
        </Button>
      </div>
    </div>
  );
};

export const UnifiedTable = <T extends Record<string, unknown>>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  customActions,
  showActions = true,
  searchable = true,
  paginated = true,
  loading = false,
  emptyMessage = "Nessun dato disponibile",
  className = "",
  rowClassName,
  editLabel = "Modifica",
  editIcon,
  showDelete = true,
  showView = true,
}: UnifiedTableProps<T>) => {
  const {
    searchTerm,
    setSearchTerm,
    paginatedData,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    handleSort,
    sortConfig,
  } = useTable(data, 5); // Default page size of 5

  const totalColumns = columns.length + (showActions ? 1 : 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      {searchable && (
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Cerca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          {searchTerm && (
            <Badge variant="secondary">
              {data.filter(item => 
                Object.values(item).some(value =>
                  String(value || '').toLowerCase().includes(searchTerm.toLowerCase())
                )
              ).length} risultati
            </Badge>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:text-gray-700' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sortConfig.key === column.key && (
                      <span className="text-indigo-600">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <LoadingRows columns={totalColumns} />
            ) : paginatedData.length === 0 ? (
              <EmptyRow message={emptyMessage} colspan={totalColumns} />
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={(row.id as string) || index}
                  row={row}
                  columns={columns}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  customActions={customActions}
                  showActions={showActions}
                  rowClassName={rowClassName}
                  editLabel={editLabel}
                  editIcon={editIcon}
                  showDelete={showDelete}
                  showView={showView}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && !loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalItems={totalItems}
        />
      )}
    </div>
  );
};