import * as React from 'react';
import { AlertCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { cycleFocusOnTab } from '../../lib/focus';
import { panelClass } from '../../lib/vault-ui-classes';

export type EntryModalLabels = {
  titleLabel: string;
  noteLabel: string;
  titlePlaceholder: string;
  notePlaceholder: string;
  password: string;
  generatePassword: string;
  capsLockOn: string;
  optional: string;
  cancel: string;
  requiredTitle: string;
  requiredPassword: string;
  loading: string;
  save: string;
  hide: string;
  reveal: string;
};

export function EntryModal({
  open,
  onClose,
  title,
  submitLabel,
  entry,
  onSubmit,
  onGeneratePassword,
  labels,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  entry: { id?: string; title: string; note: string } | null;
  onSubmit: (payload: {
    id?: string;
    title: string;
    note: string;
    password?: string;
  }) => Promise<void>;
  onGeneratePassword: () => string;
  labels: EntryModalLabels;
}) {
  const [titleValue, setTitleValue] = React.useState('');
  const [noteValue, setNoteValue] = React.useState('');
  const [passwordValue, setPasswordValue] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = React.useState(false);
  const [isBusy, setIsBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setTitleValue(entry?.title || '');
    setNoteValue(entry?.note || '');
    setPasswordValue('');
    setShowPassword(false);
    setError('');
    setIsBusy(false);
  }, [open, entry]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4">
      <div
        className={`${panelClass} vault-strong-shadow vault-fade-up w-full max-w-lg bg-white/98 p-5 dark:bg-zinc-900`}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">{title}</h3>
          {error ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-rose-600">
              <AlertCircle size={14} />
              {error}
            </p>
          ) : null}
        </div>

        <form
          ref={formRef}
          className="space-y-4"
          onKeyDown={(event) => cycleFocusOnTab(event, formRef.current)}
          onSubmit={async (event) => {
            event.preventDefault();
            setError('');
            if (!titleValue.trim()) {
              setError(labels.requiredTitle);
              return;
            }

            if (!entry && !passwordValue) {
              setError(labels.requiredPassword);
              return;
            }

            setIsBusy(true);
            try {
              await onSubmit({
                id: entry?.id,
                title: titleValue,
                note: noteValue,
                password: passwordValue || undefined,
              });
              onClose();
            } catch (cause) {
              setError(String(cause ?? labels.save));
            } finally {
              setIsBusy(false);
            }
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="entry-title">{labels.titleLabel}</Label>
            <Input
              id="entry-title"
              value={titleValue}
              autoFocus
              onChange={(event) => setTitleValue(event.target.value)}
              placeholder={labels.titlePlaceholder}
            />

            <div className="space-y-1.5">
              <Label htmlFor="entry-note">
                {labels.noteLabel} <span className="text-slate-400">({labels.optional})</span>
              </Label>
              <Textarea
                id="entry-note"
                value={noteValue}
                onChange={(event) => setNoteValue(event.target.value)}
                placeholder={labels.notePlaceholder}
              />
            </div>
          </div>

          <section className="space-y-1.5">
            <Label htmlFor="entry-password">
              {labels.password} {entry ? `(${labels.optional})` : ''}
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id="entry-password"
                  value={passwordValue}
                  type={showPassword ? 'text' : 'password'}
                  className="min-w-0 pr-12"
                  onKeyDown={(event) => setIsCapsLockOn(event.getModifierState('CapsLock'))}
                  onKeyUp={(event) => setIsCapsLockOn(event.getModifierState('CapsLock'))}
                  onBlur={() => setIsCapsLockOn(false)}
                  onChange={(event) => setPasswordValue(event.target.value)}
                  placeholder={labels.password}
                />
                <div className="absolute inset-y-0 right-1 flex items-center">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center text-slate-500 dark:text-zinc-300"
                    onClick={() => setShowPassword((current) => !current)}
                    title={showPassword ? labels.hide : labels.reveal}
                    aria-label={showPassword ? labels.hide : labels.reveal}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setPasswordValue(onGeneratePassword())}
                className="h-10 shrink-0 gap-1 px-3"
              >
                <RefreshCw size={14} />
                {labels.generatePassword}
              </Button>
            </div>
            {isCapsLockOn ? (
              <p className="mt-1 flex items-center gap-2 text-sm text-rose-600">
                <AlertCircle size={14} />
                {labels.capsLockOn}
              </p>
            ) : null}
          </section>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isBusy}>
              {labels.cancel}
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy ? labels.loading : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
