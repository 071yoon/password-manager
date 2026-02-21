import * as React from 'react';
import { debounce } from 'es-toolkit';

import { EntryMeta } from '../../shared/types';
import { PAGE_SIZE, filterEntriesByQuery } from '../lib/vault-utils';

type UseVaultPaginationReturn = {
  filteredEntries: EntryMeta[];
  visibleEntries: EntryMeta[];
  page: number;
  totalPages: number;
  pageStart: number;
  pageEnd: number;
  goToPrevious: () => void;
  goToNext: () => void;
};

export function useVaultPagination(
  entries: EntryMeta[],
  query: string,
  isKorean: boolean,
): UseVaultPaginationReturn {
  const [filteredEntries, setFilteredEntries] = React.useState<EntryMeta[]>([]);
  const [page, setPage] = React.useState(0);

  const applyFilter = React.useMemo(
    () =>
      debounce((nextQuery: string) => {
        setFilteredEntries(filterEntriesByQuery(entries, nextQuery, isKorean));
      }, 220),
    [entries, isKorean],
  );

  React.useEffect(() => {
    applyFilter(query);
    return () => {
      const canceller = applyFilter as { cancel?: () => void };
      if (typeof canceller.cancel === 'function') {
        canceller.cancel();
      }
    };
  }, [applyFilter, query]);

  React.useEffect(() => {
    setPage(0);
  }, [query, entries]);

  const totalPages = React.useMemo(
    () => Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE)),
    [filteredEntries.length],
  );

  React.useEffect(() => {
    setPage((current) => (current >= totalPages ? totalPages - 1 : current));
  }, [filteredEntries.length, totalPages]);

  const visibleEntries = React.useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredEntries.slice(start, start + PAGE_SIZE);
  }, [filteredEntries, page]);

  const pageStart = filteredEntries.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const pageEnd = Math.min(filteredEntries.length, page * PAGE_SIZE + PAGE_SIZE);

  const goToPrevious = React.useCallback(() => {
    setPage((current) => Math.max(0, current - 1));
  }, []);

  const goToNext = React.useCallback(() => {
    setPage((current) => Math.min(totalPages - 1, current + 1));
  }, [totalPages]);

  return {
    filteredEntries,
    visibleEntries,
    page,
    totalPages,
    pageStart,
    pageEnd,
    goToPrevious,
    goToNext,
  };
}
