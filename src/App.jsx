import { useEffect, useState } from "react";
import "./App.css";

import {
  getAllTasks,
  saveTask,
  deleteTask,
  getCustomContexts,
  saveCustomContexts,
  getSetting,
  saveSetting,
} from "./data/db";

import {
  LOAD_LABELS,
  PRIORITY_LABELS,
  DEFAULT_CONTEXT_OPTIONS,
} from "./constants/TaskOptions";

import {
  pickKeystoneForMe,
  getMomentumTasks,
  hasCrossContextLowerLoadOptions,
  getRunwayNeedsFallback,
} from "./utils/momentum";

import {
  getVisibleTasks,
  normalizeTaskPositions,
  reorderByVisibleSwap,
} from "./utils/taskView";

import { exportTasks, importTasks } from "./utils/importExport";

import TaskForm from "./components/TaskForm";
import TaskCard from "./components/TaskCard";
import FilterBar from "./components/FilterBar";
import MomentumPanel from "./components/MomentumPanel";
import SettingsModal from "./components/SettingsModal";
import FAQModal from "./components/FAQModal";

function persistSettings(settingsLoaded, settings) {
  if (!settingsLoaded) return;

  Object.entries(settings).forEach(([key, value]) => {
    saveSetting(key, value).catch((error) => {
      console.error(`Failed to save setting "${key}":`, error);
    });
  });
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [load, setLoad] = useState("medium");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLoad, setEditLoad] = useState("medium");
  const [priority, setPriority] = useState("medium");
  const [editPriority, setEditPriority] = useState("medium");
  const [context, setContext] = useState("general");
  const [editContext, setEditContext] = useState("general");
  const [customContexts, setCustomContexts] = useState([]);
  const [newContextInput, setNewContextInput] = useState("");
  const [showCustomContextInput, setShowCustomContextInput] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [filterLoad, setFilterLoad] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterContext, setFilterContext] = useState("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [viewMode, setViewMode] = useState("custom");
  const [sortBy, setSortBy] = useState("load");
  const [sortDirection, setSortDirection] = useState("asc");
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false);
  const [showSnoozedTasks, setShowSnoozedTasks] = useState(false);
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const [momentumModeEnabled, setMomentumModeEnabled] = useState(false);
  const [momentumRunActive, setMomentumRunActive] = useState(false);
  const [momentumEnergy, setMomentumEnergy] = useState("");
  const [keystoneTaskId, setKeystoneTaskId] = useState(null);
  const [momentumError, setMomentumError] = useState("");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [allowCrossContextRunway, setAllowCrossContextRunway] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  const contextOptions = Array.from(
    new Set([
      ...DEFAULT_CONTEXT_OPTIONS,
      ...customContexts,
      ...(editContext ? [editContext] : []),
    ])
  );

  const visibleTasks = getVisibleTasks({
    tasks,
    advancedFeaturesEnabled,
    showSnoozedTasks,
    showCompleted,
    filterLoad,
    filterPriority,
    filterContext,
    viewMode,
    sortBy,
    sortDirection,
  });

  const activeTasks =
    momentumModeEnabled && momentumRunActive
      ? getMomentumTasks({
          tasks: visibleTasks,
          keystoneTaskId,
          energy: momentumEnergy,
          allowCrossContextRunway,
        })
      : visibleTasks;

  function handlePickKeystoneForMe() {
    const suggestedTask = pickKeystoneForMe(visibleTasks);

    if (!suggestedTask) {
      setMomentumError("No eligible tasks available to choose from.");
      return;
    }

    setKeystoneTaskId(suggestedTask.id);
    setMomentumEnergy("tired");
    setMomentumError("");
  }

  const displayedTasks =
    focusModeEnabled || (momentumModeEnabled && momentumRunActive)
      ? activeTasks.slice(0, 7)
      : activeTasks;

  const totalVisibleCount = activeTasks.length;
  const displayedCount = displayedTasks.length;

  const momentumNeedsFallback =
    momentumModeEnabled &&
    keystoneTaskId &&
    getRunwayNeedsFallback(visibleTasks, keystoneTaskId);

  // ── Empty state logic ──────────────────────────────────────────────────────
  const now = Date.now();
  const hasActiveFilters =
    filterLoad !== "all" || filterPriority !== "all" || filterContext !== "all";
  const activeFilterCount =
    (filterLoad !== "all" ? 1 : 0) +
    (filterPriority !== "all" ? 1 : 0) +
    (filterContext !== "all" ? 1 : 0);

  const nonDoneTasks = tasks.filter((t) => !t.done);
  const snoozedNonDoneTasks = advancedFeaturesEnabled
    ? nonDoneTasks.filter((t) => t.snoozedUntil && t.snoozedUntil > now)
    : [];
  const snoozedCount = snoozedNonDoneTasks.length;

  const showEmptyState = displayedTasks.length === 0;
  const allDone = nonDoneTasks.length === 0 && tasks.length > 0;
  const noTasksAtAll = tasks.length === 0;

  // ── Load stored data ───────────────────────────────────────────────────────
  useEffect(() => {
    async function loadAppData() {
      try {
        const [
          storedTasks,
          storedCustomContexts,
          storedAdvancedFeatures,
          storedShowSnoozedTasks,
          storedShowCompleted,
          storedFilterLoad,
          storedFilterPriority,
          storedFilterContext,
          storedFiltersExpanded,
          storedViewMode,
          storedSortBy,
          storedSortDirection,
          storedFocusModeEnabled,
          storedMomentumModeEnabled,
          storedMomentumEnergy,
          storedMomentumRunActive,
          storedKeystoneTaskId,
        ] = await Promise.all([
          getAllTasks(),
          getCustomContexts(),
          getSetting("advancedFeaturesEnabled", false),
          getSetting("showSnoozedTasks", false),
          getSetting("showCompleted", false),
          getSetting("filterLoad", "all"),
          getSetting("filterPriority", "all"),
          getSetting("filterContext", "all"),
          getSetting("filtersExpanded", false),
          getSetting("viewMode", "custom"),
          getSetting("sortBy", "load"),
          getSetting("sortDirection", "asc"),
          getSetting("focusModeEnabled", false),
          getSetting("momentumModeEnabled", false),
          getSetting("momentumEnergy", ""),
          getSetting("momentumRunActive", false),
          getSetting("keystoneTaskId", null),
        ]);

        const normalizedTasks = storedTasks
          .map((task, index) => ({
            ...task,
            position: task.position ?? index,
          }))
          .sort((a, b) => a.position - b.position);

        setTasks(normalizedTasks);
        setCustomContexts(storedCustomContexts);
        setAdvancedFeaturesEnabled(storedAdvancedFeatures);
        setShowSnoozedTasks(storedShowSnoozedTasks);
        setShowCompleted(storedShowCompleted);
        setFilterLoad(storedFilterLoad);
        setFilterPriority(storedFilterPriority);
        setFilterContext(storedFilterContext);
        setFiltersExpanded(storedFiltersExpanded);
        setViewMode(storedViewMode);
        setSortBy(storedSortBy);
        setSortDirection(storedSortDirection);
        setFocusModeEnabled(storedFocusModeEnabled);
        setMomentumModeEnabled(storedMomentumModeEnabled);
        setMomentumEnergy(storedMomentumEnergy);
        setMomentumRunActive(storedMomentumRunActive);
        setKeystoneTaskId(storedKeystoneTaskId);
        setSettingsLoaded(true);
      } catch (error) {
        console.error("Failed to load app data from IndexedDB:", error);
      }
    }

    loadAppData();
  }, []);

  useEffect(() => {
    persistSettings(settingsLoaded, {
      advancedFeaturesEnabled,
      showSnoozedTasks,
      showCompleted,
      filterLoad,
      filterPriority,
      filterContext,
      filtersExpanded,
      viewMode,
      sortBy,
      sortDirection,
      focusModeEnabled,
      momentumModeEnabled,
      momentumEnergy,
      momentumRunActive,
      keystoneTaskId,
    });
  }, [
    settingsLoaded,
    advancedFeaturesEnabled,
    showSnoozedTasks,
    showCompleted,
    filterLoad,
    filterPriority,
    filterContext,
    filtersExpanded,
    viewMode,
    sortBy,
    sortDirection,
    focusModeEnabled,
    momentumModeEnabled,
    momentumEnergy,
    momentumRunActive,
    keystoneTaskId,
  ]);

  useEffect(() => {
    if (!momentumRunActive) return;
    if (!keystoneTaskId) {
      setMomentumRunActive(false);
      return;
    }
    const keystoneTask = tasks.find((task) => task.id === keystoneTaskId);
    if (!keystoneTask) {
      setKeystoneTaskId(null);
      setMomentumRunActive(false);
    }
  }, [tasks, keystoneTaskId, momentumRunActive]);

  function handleResetFilters() {
    setFilterLoad("all");
    setFilterPriority("all");
    setFilterContext("all");
  }

  function handleSetKeystone(taskId) {
    setKeystoneTaskId(taskId);
    setAllowCrossContextRunway(false);
    setMomentumError("");
  }

  function handleContextChange(value) {
    if (value === "__add_custom__") {
      setShowCustomContextInput(true);
      return;
    }
    setContext(value);
  }

  async function handleAddCustomContext() {
    const trimmedContext = newContextInput.trim().toLowerCase();
    if (!trimmedContext) return;

    if (contextOptions.includes(trimmedContext)) {
      setContext(trimmedContext);
      setNewContextInput("");
      setShowCustomContextInput(false);
      return;
    }

    const updatedCustomContexts = [...customContexts, trimmedContext];

    try {
      await saveCustomContexts(updatedCustomContexts);
      setCustomContexts(updatedCustomContexts);
      setContext(trimmedContext);
      setNewContextInput("");
      setShowCustomContextInput(false);
    } catch (error) {
      console.error("Failed to save custom contexts:", error);
    }
  }

  function handleCancelCustomContext() {
    setNewContextInput("");
    setShowCustomContextInput(false);
  }

  function handleStartMomentumRun() {
    if (!keystoneTaskId) {
      setMomentumError("Select a Keystone task to start.");
      return;
    }
    if (!momentumEnergy) {
      setMomentumError("Choose how tired you are first.");
      return;
    }
    setMomentumError("");
    setMomentumRunActive(true);
  }

  function handleEndMomentumRun() {
    setMomentumRunActive(false);
    setKeystoneTaskId(null);
    setMomentumEnergy("");
    setMomentumError("");
    setAllowCrossContextRunway(false);
  }

  function handleEnableCrossContextRunway() {
    const hasOptions = hasCrossContextLowerLoadOptions(visibleTasks, keystoneTaskId);
    if (!hasOptions) {
      setMomentumError("No lower-load tasks are available from another context.");
      return;
    }
    setAllowCrossContextRunway(true);
    setMomentumError("");
  }

  const handleSnooze = async (taskId, hours = 24) => {
    const taskToSnooze = tasks.find((t) => t.id === taskId);
    if (!taskToSnooze || taskToSnooze.done) return; // can't snooze a completed task

    const snoozedUntil = Date.now() + hours * 60 * 60 * 1000;

    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === taskId ? { ...task, snoozedUntil } : task
      );
      const updatedTask = updatedTasks.find((task) => task.id === taskId);
      if (updatedTask) {
        saveTask(updatedTask).catch((error) => {
          console.error("Failed to snooze task:", error);
        });
      }
      return updatedTasks;
    });
  };

  const handleUnsnooze = async (taskId) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === taskId ? { ...task, snoozedUntil: null } : task
      );
      const updatedTask = updatedTasks.find((task) => task.id === taskId);
      if (updatedTask) {
        saveTask(updatedTask).catch((error) => {
          console.error("Failed to unsnooze task:", error);
        });
      }
      return updatedTasks;
    });
  };

  async function handleUnsnoozeAll() {
    const updatedTasks = tasks.map((task) =>
      task.snoozedUntil && task.snoozedUntil > Date.now()
        ? { ...task, snoozedUntil: null }
        : task
    );
    try {
      await Promise.all(updatedTasks.map((t) => saveTask(t)));
      setTasks(updatedTasks);
    } catch (err) {
      console.error("Failed to unsnooze all tasks:", err);
    }
  }

  async function handleMoveTaskUp(id) {
    if (viewMode !== "custom") return;
    const reorderedTasks = reorderByVisibleSwap(tasks, visibleTasks, id, "up");
    if (reorderedTasks === tasks) return;
    try {
      await Promise.all(reorderedTasks.map((task) => saveTask(task)));
      setTasks(reorderedTasks);
    } catch (error) {
      console.error("Failed to move task up:", error);
    }
  }

  async function handleMoveTaskDown(id) {
    if (viewMode !== "custom") return;
    const reorderedTasks = reorderByVisibleSwap(tasks, visibleTasks, id, "down");
    if (reorderedTasks === tasks) return;
    try {
      await Promise.all(reorderedTasks.map((task) => saveTask(task)));
      setTasks(reorderedTasks);
    } catch (error) {
      console.error("Failed to move task down:", error);
    }
  }

  async function addTask(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const newTask = {
      id: crypto.randomUUID(),
      title: input.trim(),
      load,
      priority,
      context,
      done: false,
      createdAt: Date.now(),
      snoozedUntil: null,
    };

    const reorderedTasks = normalizeTaskPositions([newTask, ...tasks]);

    try {
      await Promise.all(reorderedTasks.map((task) => saveTask(task)));
      setTasks(reorderedTasks);
      setInput("");
      setLoad("medium");
      setPriority("medium");
      setContext("general");
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  }

  async function handleDeleteTask(id) {
    try {
      const remainingTasks = normalizeTaskPositions(
        tasks.filter((task) => task.id !== id)
      );
      await deleteTask(id);
      await Promise.all(remainingTasks.map((task) => saveTask(task)));
      setTasks(remainingTasks);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  }

  function handleStartEdit(task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditLoad(task.load);
    setEditPriority(task.priority ?? "medium");
    setEditContext(task.context ?? "general");
  }

  function handleCancelEdit() {
    setEditingTaskId(null);
    setEditTitle("");
    setEditLoad("medium");
    setEditPriority("medium");
    setEditContext("general");
  }

  async function handleSaveEdit(id) {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;

    const taskToUpdate = tasks.find((task) => task.id === id);
    if (!taskToUpdate) return;

    const updatedTask = {
      ...taskToUpdate,
      title: trimmedTitle,
      load: editLoad,
      priority: editPriority,
      context: editContext,
    };

    try {
      await saveTask(updatedTask);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      handleCancelEdit();
    } catch (error) {
      console.error("Failed to save edited task:", error);
    }
  }

  async function handleToggleTask(id) {
    const taskToUpdate = tasks.find((task) => task.id === id);
    if (!taskToUpdate) return;

    const updatedTask = {
      ...taskToUpdate,
      done: !taskToUpdate.done,
      // Completing a task clears any active snooze
      snoozedUntil: taskToUpdate.done ? taskToUpdate.snoozedUntil : null,
    };

    try {
      await saveTask(updatedTask);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  }

  async function handleExport() {
    try {
      await exportTasks();
    } catch (err) {
      console.error("Export failed:", err);
    }
  }

  async function handleImportFile(e) {
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
      setImportError(err.message);
    }
  }

  async function handleClearAllTasks() {
    const confirmed = window.confirm("Delete all tasks? This cannot be undone.");
    if (!confirmed) return;

    try {
      const all = await getAllTasks();
      await Promise.all(all.map((t) => deleteTask(t.id)));
      setTasks([]);
      setSettingsOpen(false);
    } catch (err) {
      console.error("Failed to clear tasks:", err);
    }
  }

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
            onClick={() => setFaqOpen(true)}
            aria-label="Open FAQ"
          >
            ?
          </button>

          <button
            type="button"
            className="settings-trigger"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
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

      {faqOpen && (
        <FAQModal onClose={() => setFaqOpen(false)} />
      )}

      {settingsOpen && (
        <SettingsModal
          onClose={() => {
            setSettingsOpen(false);
            setImportError(null);
            setImportSuccess(null);
          }}
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
          <TaskForm
            input={input}
            setInput={setInput}
            load={load}
            setLoad={setLoad}
            priority={priority}
            setPriority={setPriority}
            context={context}
            onContextChange={handleContextChange}
            contextOptions={contextOptions}
            showCustomContextInput={showCustomContextInput}
            newContextInput={newContextInput}
            setNewContextInput={setNewContextInput}
            onAddCustomContext={handleAddCustomContext}
            onCancelCustomContext={handleCancelCustomContext}
            onSubmit={addTask}
            loadLabels={LOAD_LABELS}
            priorityLabels={PRIORITY_LABELS}
          />
        </section>

        <section className="filters">
          <FilterBar
            filterLoad={filterLoad}
            setFilterLoad={setFilterLoad}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            filterContext={filterContext}
            setFilterContext={setFilterContext}
            contextOptions={contextOptions}
            loadLabels={LOAD_LABELS}
            priorityLabels={PRIORITY_LABELS}
            onResetFilters={handleResetFilters}
            filtersExpanded={filtersExpanded}
            onToggleFilters={() => setFiltersExpanded((prev) => !prev)}
            showCompleted={showCompleted}
            setShowCompleted={setShowCompleted}
            advancedFeaturesEnabled={advancedFeaturesEnabled}
            showSnoozedTasks={showSnoozedTasks}
            setShowSnoozedTasks={setShowSnoozedTasks}
            focusModeEnabled={focusModeEnabled}
            setFocusModeEnabled={setFocusModeEnabled}
            snoozedCount={snoozedCount}
          />
        </section>

        <div className="mode-strip" role="radiogroup" aria-label="View mode">
          <input
            type="radio"
            id="mode-custom"
            name="view-mode"
            checked={viewMode === "custom" && !momentumModeEnabled}
            onChange={() => {
              setMomentumModeEnabled(false);
              setViewMode("custom");
            }}
            className="mode-radio"
          />
          <label htmlFor="mode-custom" className="mode-pill">Custom</label>

          <input
            type="radio"
            id="mode-sorted"
            name="view-mode"
            checked={viewMode === "sorted" && !momentumModeEnabled}
            onChange={() => {
              setMomentumModeEnabled(false);
              setViewMode("sorted");
            }}
            className="mode-radio"
          />
          <label htmlFor="mode-sorted" className="mode-pill">Sorted</label>

          {advancedFeaturesEnabled && (
            <>
              <input
                type="radio"
                id="mode-momentum"
                name="view-mode"
                checked={momentumModeEnabled}
                onChange={() => setMomentumModeEnabled(true)}
                className="mode-radio"
              />
              <label htmlFor="mode-momentum" className="mode-pill">Momentum</label>
            </>
          )}
        </div>

        <div className="top-controls">
          <div className="mode-controls">
            {viewMode === "sorted" && (
              <div className="sort-controls">
                <label>
                  Sort by
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="load">Cognitive Load</option>
                    <option value="priority">Priority</option>
                  </select>
                </label>

                <label>
                  Direction
                  <select
                    value={sortDirection}
                    onChange={(e) => setSortDirection(e.target.value)}
                  >
                    <option value="asc">Low to High</option>
                    <option value="desc">High to Low</option>
                  </select>
                </label>
              </div>
            )}

            {advancedFeaturesEnabled && momentumModeEnabled && (
              <div className="momentum-controls">
                <MomentumPanel
                  momentumRunActive={momentumRunActive}
                  momentumEnergy={momentumEnergy}
                  momentumError={momentumError}
                  momentumNeedsFallback={momentumNeedsFallback}
                  allowCrossContextRunway={allowCrossContextRunway}
                  onSelectEnergy={(energy) => {
                    setMomentumEnergy(energy);
                    setMomentumError("");
                  }}
                  onStartMomentumRun={handleStartMomentumRun}
                  onPickKeystoneForMe={handlePickKeystoneForMe}
                  onEnableCrossContextRunway={handleEnableCrossContextRunway}
                  onEndMomentumRun={handleEndMomentumRun}
                />
              </div>
            )}
          </div>
        </div>

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
                <p>No tasks in list, <button type="button" className="empty-state__link" onClick={() => document.querySelector('.task-form-trigger')?.click()}>add a task</button>.</p>
              )}

              {allDone && (
                <p>All done for today! ...or not quite? <button type="button" className="empty-state__link" onClick={() => document.querySelector('.task-form-trigger')?.click()}>Add a new task.</button></p>
              )}

              {!noTasksAtAll && !allDone && (
                <>
                  {hasActiveFilters && (
                    <p>
                      No visible tasks, {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active.{" "}
                      <button type="button" className="empty-state__link" onClick={handleResetFilters}>
                        Reset filters
                      </button>
                    </p>
                  )}

                  {snoozedCount > 0 && (
                    <p>
                      {snoozedCount} snoozed task{snoozedCount !== 1 ? "s" : ""}.{" "}
                      {filtersExpanded ? (
                        <button type="button" className="empty-state__link" onClick={handleUnsnoozeAll}>
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
                editingTaskId={editingTaskId}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                editLoad={editLoad}
                setEditLoad={setEditLoad}
                editPriority={editPriority}
                setEditPriority={setEditPriority}
                editContext={editContext}
                setEditContext={setEditContext}
                contextOptions={contextOptions}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onDeleteTask={handleDeleteTask}
                onToggleTask={handleToggleTask}
                onMoveTaskUp={handleMoveTaskUp}
                onMoveTaskDown={handleMoveTaskDown}
                onSnooze={handleSnooze}
                onUnsnooze={handleUnsnooze}
                advancedFeaturesEnabled={advancedFeaturesEnabled}
                loadLabels={LOAD_LABELS}
                priorityLabels={PRIORITY_LABELS}
                momentumModeEnabled={momentumModeEnabled}
                momentumRunActive={momentumRunActive}
                isKeystone={task.id === keystoneTaskId}
                onSetKeystone={handleSetKeystone}
              />
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;