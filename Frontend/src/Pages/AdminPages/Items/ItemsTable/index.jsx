import { DataTable } from '@/components/ui/table/data-table';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { columns } from './columns';
import { useItemsTableFilters, STATUS_OPTIONS } from './items-filter';
import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';

export default function ItemsTable({
  data,
  totalData
}) {
  const {
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setSearchQuery,
    status,
    setStatus,
    setPage,
  } = useItemsTableFilters();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <DataTableSearch
          searchKey="name"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
        <DataTableFilterBox
          filterKey="status"
          title="Status"
          options={STATUS_OPTIONS}
          setFilterValue={setStatus}
          filterValue={status}
        />
        <DataTableResetFilter
          isFilterActive={isAnyFilterActive}
          onReset={resetFilters}
        />
      </div>
      <DataTable columns={columns} data={data} totalItems={totalData} />
    </div>
  );
}