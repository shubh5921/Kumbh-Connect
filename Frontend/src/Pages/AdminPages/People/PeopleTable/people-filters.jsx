import { searchParams } from '@/lib/searchParams';
import { useQueryState } from 'nuqs';
import { useCallback, useMemo } from 'react';

export const STATUS_OPTIONS = [
  { label: 'Lost', value: 'lost' },
  { label: 'Found', value: 'found' },
  { label: 'Returned', value: 'returned' },
];


export function usePeopleTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    'q',
    searchParams.q
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault('')
  );

  const [page, setPage] = useQueryState(
    'page',
    searchParams.page.withDefault(1)
  );

  const [status, setStatus] = useQueryState(
    'status',
    searchParams.status.withDefault('')
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setStatus(null);
    setPage(1);
  }, [setSearchQuery, setStatus, setPage]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!status;
  }, [searchQuery, status]);

  return {
    searchQuery,
    setSearchQuery,
    status,
    setStatus,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive
  };
}