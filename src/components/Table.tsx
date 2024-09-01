import { useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Pagination, Sorting } from '../interface';

interface TableColumn {
  accessor: string;
  header: string;
  sort?: boolean;
}

interface Table {
  column: TableColumn[];
  data: { [key: string]: number | string }[];
  pageSize: number;
  pageCount: number;
  isLoading: boolean;
  onPaginationChange: (pagination: Pagination, sorting: Sorting[]) => void;
  onSortingChange: (pagination: Pagination, sorting: Sorting[]) => void;
}

export default function Table({ column, data, pageSize, pageCount, isLoading, onPaginationChange, onSortingChange }:Table) {
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  const columnHelper = createColumnHelper();

  const columns = column.map((col: TableColumn) => {
    return columnHelper.accessor(col.accessor, {
      cell: info => info.getValue(),
      header: () => col.header,
      enableSorting: col?.sort || false,
  })});

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: (newSorting) => {
      setSorting(newSorting);
      onSortingChange(pagination, newSorting(sorting));
    },
    onPaginationChange: (newPagination) => {
      setPagination(newPagination);
      onPaginationChange(newPagination(pagination), sorting);
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableMultiSort: false,
  });

  return (
    <div className="py-4">
      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${header.column.getCanSort() ? 'cursor-pointer' : ''}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {
        pageCount !== 0 && 
        <div className="mt-4 flex justify-between items-center">
          <span className='mx-auto'>
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <div>
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage() || isLoading}
              className="mr-2 px-2 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {'<<'}
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || isLoading}
              className="mr-2 px-2 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {'<'}
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || isLoading}
              className="mr-2 px-2 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {'>'}
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage() || isLoading}
              className="mr-2 px-2 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {'>>'}
            </button>
          </div>
        </div>
      }
    </div>
  );
};