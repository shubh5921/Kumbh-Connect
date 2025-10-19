// import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import {DataTable} from '@/components/ui/table/data-table';
import {DataTableResetFilter} from '@/components/ui/table/data-table-reset-filter';
import {DataTableSearch} from '@/components/ui/table/data-table-search';
import { columns } from './columns';
import {
  useUsersTableFilters
} from './users-filters';

export default function UsersTable({
  data,
  totalData
}) {
  const {
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery
  } = useUsersTableFilters();

  return (
    <div className="space-y-4 ">
      <div className="flex flex-wrap items-center gap-4">
        <DataTableSearch
          searchKey="name"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
        {/* <DataTableFilterBox
          filterKey="gender"
          title="Gender"
          options={GENDER_OPTIONS}
          setFilterValue={setGenderFilter}
          filterValue={genderFilter}
        /> */}
        <DataTableResetFilter
          isFilterActive={isAnyFilterActive}
          onReset={resetFilters}
        />
      </div>
      <DataTable columns={columns} data={data} totalItems={totalData} />
    </div>
  );
}