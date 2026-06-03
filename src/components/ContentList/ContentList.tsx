'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpDown, RotateCcw, Search } from 'lucide-react';
import styles from './content-list.module.css';

export type ContentListFilter<T> = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  options: {
    label: string;
    value: string;
  }[];
  predicate: (item: T, value: string) => boolean;
};

export type ContentListSort<T> = {
  label: string;
  value: string;
  compare: (a: T, b: T) => number;
};

type ContentListProps<T> = {
  ariaLabel: string;
  emptyMessage: string;
  filters?: ContentListFilter<T>[];
  getSearchText: (item: T) => string;
  gridClassName: string;
  items: T[];
  pageSize?: number;
  renderItem: (item: T) => React.ReactNode;
  searchPlaceholder?: string;
  sorts?: ContentListSort<T>[];
};

export default function ContentList<T>({
  ariaLabel,
  emptyMessage,
  filters = [],
  getSearchText,
  gridClassName,
  items,
  pageSize = 6,
  renderItem,
  searchPlaceholder = 'Search',
  sorts = [],
}: ContentListProps<T>) {
  const [query, setQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    Object.fromEntries(filters.map((filter) => [filter.id, filter.options[0]?.value ?? 'all'])),
  );
  const [sortValue, setSortValue] = useState(sorts[0]?.value ?? '');
  const [page, setPage] = useState(1);

  const activeSort = sorts.find((sort) => sort.value === sortValue);
  const hasActiveControls =
    query.trim().length > 0 ||
    Object.values(filterValues).some((value) => value !== 'all') ||
    (sorts.length > 0 && sortValue !== sorts[0]?.value);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const nextItems = items
      .filter((item) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          getSearchText(item).toLowerCase().includes(normalizedQuery);
        const matchesFilters = filters.every((filter) =>
          filter.predicate(item, filterValues[filter.id] ?? 'all'),
        );

        return matchesQuery && matchesFilters;
      })
      .toSorted((a, b) => activeSort?.compare(a, b) ?? 0);

    return nextItems;
  }, [activeSort, filterValues, filters, getSearchText, items, query]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize);

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateFilter(id: string, value: string) {
    setFilterValues((current) => ({ ...current, [id]: value }));
    setPage(1);
  }

  function updateSort(value: string) {
    setSortValue(value);
    setPage(1);
  }

  function resetControls() {
    setQuery('');
    setFilterValues(
      Object.fromEntries(filters.map((filter) => [filter.id, filter.options[0]?.value ?? 'all'])),
    );
    setSortValue(sorts[0]?.value ?? '');
    setPage(1);
  }

  return (
    <div aria-label={ariaLabel}>
      <div className={styles.controls}>
        <label className={styles.searchField}>
          <Search size={19} />
          <input
            aria-label={searchPlaceholder}
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder={searchPlaceholder}
          />
        </label>

        <div className={styles.actions}>
          {filters.map((filter) => (
            <label key={filter.id} className={styles.selectField}>
              {filter.icon}
              <select
                aria-label={filter.label}
                value={filterValues[filter.id] ?? 'all'}
                onChange={(event) => updateFilter(filter.id, event.target.value)}
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}

          {sorts.length > 0 ? (
            <label className={styles.selectField}>
              <ArrowUpDown size={16} />
              <select
                aria-label="Sort"
                value={sortValue}
                onChange={(event) => updateSort(event.target.value)}
              >
                {sorts.map((sort) => (
                  <option key={sort.value} value={sort.value}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {hasActiveControls ? (
            <button className={styles.resetButton} type="button" onClick={resetControls}>
              <RotateCcw size={15} />
              Reset
            </button>
          ) : null}
        </div>
      </div>

      <div className={gridClassName}>{paginatedItems.map(renderItem)}</div>

      {filteredItems.length === 0 ? <p className={styles.empty}>{emptyMessage}</p> : null}

      {filteredItems.length > pageSize ? (
        <nav className={styles.pagination} aria-label={`${ariaLabel} pagination`}>
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={safePage === 1}
          >
            <ArrowLeft size={15} />
            Previous
          </button>
          <span>
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={safePage === totalPages}
          >
            Next
            <ArrowRight size={15} />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
