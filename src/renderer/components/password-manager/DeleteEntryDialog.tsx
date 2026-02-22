import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

type DeleteEntryDialogProps = {
  open: boolean;
  title: string;
  description: string;
  entryTitle?: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};

export function DeleteEntryDialog({
  open,
  title,
  description,
  entryTitle,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: DeleteEntryDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
          {entryTitle ? (
            <p className="truncate rounded-sm border border-slate-300 bg-slate-100 px-2 py-1 text-sm font-medium text-slate-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100">
              {entryTitle}
            </p>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              void onConfirm();
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
