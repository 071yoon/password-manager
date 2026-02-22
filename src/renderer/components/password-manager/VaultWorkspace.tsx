import { ChevronLeft, ChevronRight, PlusCircle, Search } from 'lucide-react';

import { EntryMeta } from '../../../shared/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { controlButtonClass } from '../../lib/vault-ui-classes';
import { EntryRow, EntryRowLabels } from './EntryRow';

export type VaultWorkspaceRowLabels = EntryRowLabels;

type VaultWorkspaceProps = {
  totalItemsLabel: string;
  totalItemsCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  onAdd: () => void;
  addLabel: string;
  noMatchText: string;
  noEntriesText: string;
  visibleEntries: EntryMeta[];
  filteredEntriesCount: number;
  visiblePasswords: Record<string, string>;
  onReveal: (id: string) => void;
  onCopy: (id: string) => void;
  onEdit: (entry: EntryMeta) => void;
  onDelete: (entry: EntryMeta) => void;
  rowLabels: VaultWorkspaceRowLabels;
  showingLabel: string;
  pageStart: number;
  pageEnd: number;
  page: number;
  totalPages: number;
  previousLabel: string;
  nextLabel: string;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function VaultWorkspace({
  totalItemsLabel,
  totalItemsCount,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  onAdd,
  addLabel,
  noMatchText,
  noEntriesText,
  visibleEntries,
  filteredEntriesCount,
  visiblePasswords,
  onReveal,
  onCopy,
  onEdit,
  onDelete,
  rowLabels,
  showingLabel,
  pageStart,
  pageEnd,
  page,
  totalPages,
  previousLabel,
  nextLabel,
  onPreviousPage,
  onNextPage,
}: VaultWorkspaceProps) {
  const disablePrevious = page === 0;
  const disableNext = page === totalPages - 1;

  return (
    <section className="vault-panel vault-fade-up p-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <p className="shrink-0 text-sm font-medium text-slate-600 dark:text-zinc-300">
            {totalItemsLabel}: {totalItemsCount}
          </p>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
        </div>
        <Button onClick={onAdd} className="gap-2">
          <PlusCircle size={16} />
          {addLabel}
        </Button>
      </div>

      <div className="mt-2">
        {filteredEntriesCount === 0 ? (
          <p className="rounded-sm border border-dashed border-slate-300/90 bg-slate-100/80 p-6 text-center text-sm text-slate-500 dark:border-zinc-700/80 dark:bg-zinc-900/40 dark:text-zinc-300">
            {searchQuery ? noMatchText : noEntriesText}
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {visibleEntries.map((entry) => {
              const isVisible = Object.prototype.hasOwnProperty.call(visiblePasswords, entry.id);

              return (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  visible={isVisible}
                  plainPassword={visiblePasswords[entry.id]}
                  onReveal={onReveal}
                  onCopy={onCopy}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  labels={rowLabels}
                />
              );
            })}
          </ul>
        )}

        {filteredEntriesCount > 0 ? (
          <div className="mt-4 flex flex-col items-center gap-2 text-sm text-slate-600 dark:text-zinc-300">
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {showingLabel}: {pageStart}-{pageEnd} / {filteredEntriesCount}
              </p>
              <div className="inline-flex items-center gap-3 justify-self-center">
                <button
                  type="button"
                  onClick={onPreviousPage}
                  disabled={disablePrevious}
                  aria-label={previousLabel}
                  className={`${controlButtonClass} ${disablePrevious ? 'opacity-50' : ''}`}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="min-w-16 text-center text-sm font-medium text-slate-700 dark:text-zinc-300">
                  {page + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={onNextPage}
                  disabled={disableNext}
                  aria-label={nextLabel}
                  className={`${controlButtonClass} ${disableNext ? 'opacity-50' : ''}`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
