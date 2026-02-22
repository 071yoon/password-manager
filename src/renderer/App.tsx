import { EntryModal } from './components/password-manager/EntryModal';
import { AppChrome } from './components/password-manager/AppChrome';
import { DeleteEntryDialog } from './components/password-manager/DeleteEntryDialog';
import { LockPanel } from './components/password-manager/LockPanel';
import { SettingsModal } from './components/password-manager/SettingsModal';
import { ToastBanner } from './components/password-manager/ToastBanner';
import { VaultWorkspace } from './components/password-manager/VaultWorkspace';
import { createStrongPassword } from './lib/vault-utils';
import { useVaultController } from './hooks/useVaultController';

function DeveloperSignature() {
  return (
    <a
      href="https://github.com/071yoon"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-3 right-4 text-xs text-slate-400 transition hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
    >
      @071yoon
    </a>
  );
}

export default function App() {
  const controller = useVaultController();

  if (controller.isInitializing) {
    return (
      <div className="min-h-screen bg-[var(--vault-bg)] px-4 py-8">
        <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
          <p className="vault-panel border-slate-200 bg-white/95 px-6 py-4 text-sm text-slate-600 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300">
            {controller.labels.loading}
          </p>
        </div>
      </div>
    );
  }

  if (!controller.state.hasMaster) {
    return (
      <div className="relative min-h-screen bg-[var(--vault-bg)] px-4 py-8">
        <AppChrome
          labels={controller.labels}
          locale={controller.locale}
          themeMode={controller.themeMode}
          themeLabels={controller.themeLabels}
          hasMaster={controller.state.hasMaster}
          unlocked={controller.state.unlocked}
          onLocaleChange={controller.setLocale}
          onThemeModeChange={controller.setThemeMode}
          onOpenSettings={() => controller.setIsSettingsOpen(true)}
          onLock={controller.lockVault}
        />
        <ToastBanner message={controller.toastMessage} type={controller.toastType} />
        <LockPanel
          locale={controller.locale}
          title={controller.labels.setupTitle}
          subtitle={controller.labels.setupSubtitle}
          onSubmit={controller.onSubmitMaster}
          buttonText={controller.labels.create}
          showConfirm
          secondaryButtonText={controller.labels.cancel}
          isBusy={controller.isBusy}
        />
        <DeveloperSignature />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--vault-bg)] pt-10 text-slate-900 dark:text-zinc-100 md:pt-11">
      <AppChrome
        labels={controller.labels}
        locale={controller.locale}
        themeMode={controller.themeMode}
        themeLabels={controller.themeLabels}
        hasMaster={controller.state.hasMaster}
        unlocked={controller.state.unlocked}
        onLocaleChange={controller.setLocale}
        onThemeModeChange={controller.setThemeMode}
        onOpenSettings={() => controller.setIsSettingsOpen(true)}
        onLock={controller.lockVault}
      />
      <ToastBanner message={controller.toastMessage} type={controller.toastType} />

      <div
        className={`mx-auto flex w-full max-w-[1300px] flex-col gap-6 px-6 py-5 transition md:py-6 ${
          !controller.state.unlocked ? 'pointer-events-none select-none blur-sm brightness-75' : ''
        }`}
      >
        <VaultWorkspace
          totalItemsLabel={controller.labels.totalItems}
          totalItemsCount={controller.entries.length}
          searchQuery={controller.searchQuery}
          onSearchChange={controller.setSearchQuery}
          searchPlaceholder={controller.labels.searchPlaceholder}
          onAdd={controller.openCreate}
          addLabel={controller.labels.add}
          noMatchText={controller.labels.noMatch}
          noEntriesText={controller.labels.noEntries}
          visibleEntries={controller.visibleEntries}
          filteredEntriesCount={controller.filteredEntries.length}
          visiblePasswords={controller.visiblePasswords}
          onReveal={controller.onReveal}
          onCopy={controller.onCopy}
          onEdit={controller.openEdit}
          onDelete={controller.requestDelete}
          rowLabels={controller.workspaceRowLabels}
          showingLabel={controller.labels.showing}
          pageStart={controller.pageStart}
          pageEnd={controller.pageEnd}
          page={controller.page}
          totalPages={controller.totalPages}
          previousLabel={controller.labels.previousPage}
          nextLabel={controller.labels.nextPage}
          onPreviousPage={controller.onPrevPage}
          onNextPage={controller.onNextPage}
        />
      </div>

      {!controller.state.unlocked ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/45 px-4 backdrop-blur-md">
          <LockPanel
            locale={controller.locale}
            title={controller.labels.unlockTitle}
            subtitle={controller.labels.unlockSubtitle}
            onSubmit={controller.onSubmitMaster}
            buttonText={controller.labels.unlock}
            secondaryButtonText={controller.labels.cancel}
            onSecondary={controller.onUnlockCancel}
            showConfirm={false}
            isBusy={controller.isBusy}
          />
        </div>
      ) : null}

      <SettingsModal
        open={controller.isSettingsOpen}
        onClose={() => controller.setIsSettingsOpen(false)}
        labels={controller.settingsLabels}
        options={controller.passwordOptions}
        onReset={controller.onReset}
        onExport={controller.onExport}
        onImport={controller.onImport}
        onSave={controller.setPasswordOptions}
        disabled={!controller.state.unlocked}
      />

      <EntryModal
        open={controller.isFormOpen}
        entry={controller.editingEntry}
        onClose={controller.closeForm}
        title={controller.editingEntry ? controller.labels.edit : controller.labels.add}
        submitLabel={controller.editingEntry ? controller.labels.save : controller.labels.create}
        onGeneratePassword={() => createStrongPassword(controller.passwordOptions)}
        onSubmit={controller.onSubmitEntry}
        labels={controller.entryModalLabels}
      />

      <DeleteEntryDialog
        open={!!controller.pendingDeleteEntry}
        title={controller.labels.delete}
        description={controller.labels.deleteConfirm}
        entryTitle={controller.pendingDeleteEntry?.title}
        cancelLabel={controller.labels.cancel}
        confirmLabel={controller.labels.delete}
        onCancel={controller.cancelDelete}
        onConfirm={controller.confirmDelete}
      />

      <DeveloperSignature />
    </div>
  );
}
