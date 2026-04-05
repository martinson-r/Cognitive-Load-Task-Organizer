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

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadMoreCompleted();
      });

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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clip-rule="evenodd" />
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
          {showCompleted && displayedCompletedCount < completedTotal && (
            <p className="completed-tasks-count">
              Showing {displayedCompletedCount} of {completedTotal} completed tasks
            </p>
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

          

          {showCompleted && hasMoreCompleted && (
            <div ref={completedSentinelRef} className="completed-sentinel" aria-hidden="true" />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;