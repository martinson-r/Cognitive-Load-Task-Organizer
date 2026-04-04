import { useEffect, useRef } from "react";
import "./App.css";

import { DEFAULT_CONTEXT_OPTIONS } from "./constants/TaskOptions";
import { useDisplayedTasks } from "./hooks/useDisplayedTasks";
import { exportTasks, importTasks } from "./utils/importExport";
import { isSortDirection, isSortField } from "./types";

import { useTaskStore } from "./store/useTaskStore";
import { useFilterStore } from "./store/useFilterStore";
import { useUIStore } from "./store/useUIStore";
import { useMomentumStore } from "./store/useMomentumStore";

import TaskForm from "./components/TaskForm";
import TaskCard from "./components/TaskCard";
import FilterBar from "./components/FilterBar";
import MomentumPanel from "./components/MomentumPanel";
import SettingsModal from "./components/SettingsModal";
import FAQModal from "./components/FAQModal";

function App() {
  // ── Stores ─────────────────────────────────────────────────────────────────
  const { tasks, customContexts, settingsLoaded, loadTasks, clearAllTasks } = useTaskStore();
  const {
    filterLoad, filterPriority, filterContext,
    showCompleted, showSnoozedTasks, filtersExpanded,
    viewMode, sortBy, sortDirection, focusModeEnabled,
    loadFilterSettings, setViewMode, setSortBy, setSortDirection, resetFilters,
    setShowSnoozedTasks,
  } = useFilterStore();
  const {
    advancedFeaturesEnabled, settingsOpen, faqOpen,
    importError, importSuccess, editDraft,
    loadUISettings, setAdvancedFeaturesEnabled,
    openSettings, closeSettings, openFAQ, closeFAQ,
    setImportError, setImportSuccess, openTaskForm,
  } = useUIStore();
  const {
    momentumModeEnabled, momentumRunActive, momentumEnergy,
    keystoneTaskId, allowCrossContextRunway,
    loadMomentumSettings, setMomentumModeEnabled, clearKeystoneIfMissing,
  } = useMomentumStore();

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      loadTasks(),
      loadFilterSettings(),
      loadUISettings(),
      loadMomentumSettings(),
    ]);
  }, []);

  // ── Clear momentum run if keystone task is deleted ─────────────────────────
  useEffect(() => {
    clearKeystoneIfMissing(tasks);
  }, [tasks, keystoneTaskId, momentumRunActive]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const contextOptions = Array.from(
    new Set([
      ...DEFAULT_CONTEXT_OPTIONS,
      ...customContexts,
      ...(editDraft?.context ? [editDraft.context] : []),
    ])
  );

  const {
    visibleTasks, displayedTasks,
    totalVisibleCount, displayedCount, momentumNeedsFallback,
    showEmptyState, noTasksAtAll, allDone,
    hasActiveFilters, activeFilterCount, snoozedCount,
    completedTotal, displayedCompletedCount, hasMoreCompleted, loadMoreCompleted,
  } = useDisplayedTasks();

  // ── Completed tasks: IntersectionObserver sentinel ─────────────────────────
  const completedSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = completedSentinelRef.current;
    if (!sentinel || !hasMoreCompleted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreCompleted();
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreCompleted, loadMoreCompleted]);

  // ── Import/export handlers ─────────────────────────────────────────────────
  async function handleExport() {
    try {
      await exportTasks();
    } catch (err) {
      console.error("Export failed:", err);
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImportError(null);
    setImportSuccess(null);

    if (file.size > 5 * 1024 * 1024) {
      const proceed = window.confirm(
        "This file is over 5MB, which is unusually large for a task export. " +
        "Importing it may take a while and could cause performance issues.\n\nContinue anyway?"
      );
      if (!proceed) return;
    }

    const replace = window.confirm(
      "Replace or merge?\n\n" +
      "OK     → Replace all existing tasks with the imported ones.\n" +
      "Cancel → Merge: adds imported tasks alongside yours. Tasks with matching IDs will be overwritten by the imported version."
    );

    try {
      const imported = await importTasks(file, { replace });
      setImportSuccess(
        `Imported ${imported.length} task${imported.length !== 1 ? "s" : ""}. Reloading…`
      );
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error("Import failed:", err);
      setImportError(err instanceof Error ? err.message : "Import failed.");
    }
  }

  async function handleClearAllTasks() {
    const confirmed = window.confirm("Delete all tasks? This cannot be undone.");
    if (!confirmed) return;
    await clearAllTasks();
    closeSettings();
  }

  // ── Loading gate ───────────────────────────────────────────────────────────
  if (!settingsLoaded) {
    return <div className="app app--loading" />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Cognitive Organizer</h1>
        <div className="header-controls">
          <button
            type="button"
            className="faq-trigger"
            onClick={openFAQ}
            aria-label="Open FAQ"
          >
            FAQ
          </button>

          <button
            type="button"
            className="settings-trigger"
            onClick={openSettings}
            aria-label="Open settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382c.114.043.282.031.449-.083a7.49 7.49 0 0 0 .985-.57c.166-.114.334-.126.45-.083l1.019.382a1.875 1.875 0 0 0 2.281-.819l.922-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
            </svg>
          </button>

          <div className="advanced-toggle toolbar-row">
            <label className="toggle toggle--labeled">
              <span className="toggle__label">Advanced Features</span>
              <input
                type="checkbox"
                checked={advancedFeaturesEnabled}
                onChange={(e) => setAdvancedFeaturesEnabled(e.target.checked)}
                aria-label="Advanced Features"
              />
              <span className="toggle__track" aria-hidden="true">
                <span className="toggle__state toggle__state--off">OFF</span>
                <span className="toggle__state toggle__state--on">ON</span>
                <span className="toggle__thumb" />
              </span>
            </label>
          </div>
        </div>
      </header>

      {faqOpen && <FAQModal onClose={closeFAQ} />}

      {settingsOpen && (
        <SettingsModal
          onClose={closeSettings}
          onExport={handleExport}
          onImportFile={handleImportFile}
          onClearAllTasks={handleClearAllTasks}
        />
      )}

      {(importError || importSuccess) && (
        <div className="import-status-bar">
          {importError && <p className="import-status import-status--error">{importError}</p>}
          {importSuccess && <p className="import-status import-status--success">{importSuccess}</p>}
        </div>
      )}

      <main className="app-main">
        <section className="task-input">
          <TaskForm contextOptions={contextOptions} />
        </section>

        <section className="filters">
          <FilterBar
            contextOptions={contextOptions}
            snoozedCount={snoozedCount}
          />
        </section>

        <div className="mode-strip" role="group" aria-label="View modes">
          <button
            type="button"
            className="mode-pill"
            aria-pressed={viewMode === "custom" && !momentumModeEnabled}
            onClick={() => {
              setMomentumModeEnabled(false);
              setViewMode("custom");
            }}
          >
            Custom
          </button>

          <button
            type="button"
            className="mode-pill"
            aria-pressed={viewMode === "sorted" && !momentumModeEnabled}
            onClick={() => {
              setMomentumModeEnabled(false);
              setViewMode("sorted");
            }}
          >
            Sorted
          </button>

          {advancedFeaturesEnabled && (
            <button
              type="button"
              className="mode-pill"
              aria-pressed={momentumModeEnabled}
              onClick={() => setMomentumModeEnabled(true)}
            >
              Get Going
            </button>
          )}
        </div>

        {(viewMode === "sorted" || (advancedFeaturesEnabled && momentumModeEnabled)) && (
          <div className="top-controls">
            <div className="mode-controls">
              {viewMode === "sorted" && (
                <div className="sort-controls">
                  <label>
                    Sort by
                    <select value={sortBy} onChange={(e) => { const v = e.target.value; if (isSortField(v)) setSortBy(v); }}>
                      <option value="load">Cognitive Load</option>
                      <option value="priority">Priority</option>
                    </select>
                  </label>
                  <label>
                    Direction
                    <select value={sortDirection} onChange={(e) => { const v = e.target.value; if (isSortDirection(v)) setSortDirection(v); }}>
                      <option value="asc">Low to High</option>
                      <option value="desc">High to Low</option>
                    </select>
                  </label>
                </div>
              )}

              {advancedFeaturesEnabled && momentumModeEnabled && (
                <div className="momentum-controls">
                  <MomentumPanel
                    visibleTasks={visibleTasks}
                    momentumNeedsFallback={!!momentumNeedsFallback}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <section className="task-list-section">
          {focusModeEnabled && (
            <div className="focus-mode-info">
              {displayedCount === totalVisibleCount
                ? `Showing all ${totalVisibleCount} tasks`
                : `Showing ${displayedCount} of ${totalVisibleCount} tasks`}
            </div>
          )}

          {showEmptyState && (
            <div className="empty-state">
              {noTasksAtAll && (
                <p>No tasks in list, <button type="button" className="empty-state__link" onClick={() => openTaskForm()}>add a task</button>.</p>
              )}
              {allDone && (
                <p>All done for today! ...or not quite? <button type="button" className="empty-state__link" onClick={() => openTaskForm()}>Add a new task.</button></p>
              )}
              {!noTasksAtAll && !allDone && (
                <>
                  {hasActiveFilters && (
                    <p>
                      No visible tasks, {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active.{" "}
                      <button type="button" className="empty-state__link" onClick={resetFilters}>
                        Reset filters
                      </button>
                    </p>
                  )}
                  {snoozedCount > 0 && (
                    <p>
                      {snoozedCount} snoozed task{snoozedCount !== 1 ? "s" : ""}.{" "}
                      {filtersExpanded ? (
                        <button type="button" className="empty-state__link" onClick={() => useTaskStore.getState().unsnoozeAll()}>
                          Unsnooze
                        </button>
                      ) : (
                        <button type="button" className="empty-state__link" onClick={() => setShowSnoozedTasks(true)}>
                          View snoozed tasks
                        </button>
                      )}
                    </p>
                  )}
                  {!hasActiveFilters && snoozedCount === 0 && (
                    <p>No visible tasks right now.</p>
                  )}
                </>
              )}
            </div>
          )}

          <ul className="task-list">
            {displayedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                contextOptions={contextOptions}
                visibleTasks={visibleTasks}
                isKeystone={task.id === keystoneTaskId}
              />
            ))}
          </ul>

          {showCompleted && displayedCompletedCount < completedTotal && (
            <p className="completed-tasks-count">
              Showing {displayedCompletedCount} of {completedTotal} completed tasks
            </p>
          )}

          {showCompleted && hasMoreCompleted && (
            <div ref={completedSentinelRef} className="completed-sentinel" aria-hidden="true" />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;