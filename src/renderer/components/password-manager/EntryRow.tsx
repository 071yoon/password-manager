import { Copy, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';

import { EntryMeta } from '../../../shared/types';
import { dangerIconButtonClass, iconButtonClass } from '../../lib/vault-ui-classes';

export type EntryRowLabels = {
  reveal: string;
  hide: string;
  copy: string;
  edit: string;
  delete: string;
};

export function EntryRow({
  entry,
  visible,
  plainPassword,
  onReveal,
  onCopy,
  onEdit,
  onDelete,
  labels,
}: {
  entry: EntryMeta;
  visible: boolean;
  plainPassword?: string;
  onReveal: (id: string) => void;
  onCopy: (id: string) => void;
  onEdit: (entry: EntryMeta) => void;
  onDelete: (id: string) => void;
  labels: EntryRowLabels;
}) {
  return (
    <li className="vault-chip vault-entry-card vault-fade-up bg-white p-4 transition hover:bg-slate-100 hover:shadow-sm dark:bg-slate-900/50 dark:hover:bg-slate-900/70">
      <div className="flex flex-col gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
            {entry.title}
          </p>
          {entry.note ? (
            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-300">{entry.note}</p>
          ) : null}
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
            {new Date(entry.updatedAt).toLocaleString()}
          </p>
        </div>

        <div className="grid w-full grid-cols-4 gap-2">
          <button
            className={`${iconButtonClass} w-full`}
            type="button"
            onClick={() => onReveal(entry.id)}
            title={visible ? labels.hide : labels.reveal}
            aria-label={visible ? labels.hide : labels.reveal}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            className={`${iconButtonClass} w-full`}
            type="button"
            onClick={() => onCopy(entry.id)}
            title={labels.copy}
            aria-label={labels.copy}
          >
            <Copy size={16} />
          </button>
          <button
            className={`${iconButtonClass} w-full`}
            type="button"
            onClick={() => onEdit(entry)}
            title={labels.edit}
            aria-label={labels.edit}
          >
            <Pencil size={16} />
          </button>
          <button
            className={`${dangerIconButtonClass} w-full`}
            type="button"
            onClick={() => onDelete(entry.id)}
            title={labels.delete}
            aria-label={labels.delete}
          >
            <Trash2 size={16} />
          </button>
        </div>

        {visible ? (
          <p className="mt-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 break-all dark:border-slate-600 dark:bg-slate-950/70 dark:text-slate-100">
            {plainPassword ?? '********'}
          </p>
        ) : null}
      </div>
    </li>
  );
}
