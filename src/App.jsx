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
  getMomentumRunwayMessage,
} from "./utils/momentum";

import {
  getVisibleTasks,
  normalizeTaskPositions,
  reorderByVisibleSwap,
} from './utils/taskView';

import TaskForm from "./components/TaskForm";
import TaskCard from "./components/TaskCard";
import FilterBar from "./components/FilterBar";
import MomentumPanel from "./components/MomentumPanel";

// Settings saver helper
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

  // Derive available context options (can dedupe later if needed)
  const contextOptions = Array.from(
  new Set([
      ...DEFAULT_CONTEXT_OPTIONS,
      ...customContexts,
      ...(editContext ? [editContext] : []),
    ])
  );

  const visibleTasks = getVisibleTasks({
  tasks,
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

// help users pick a keystone if they're tired
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

// Setting this separation up ahead of time, not used quite yet 
const isFocusClipped = focusModeEnabled;
const isMomentumClipped = momentumModeEnabled && momentumRunActive;
const isClippedMode = isFocusClipped || isMomentumClipped;

const momentumNeedsFallback =
momentumModeEnabled &&
keystoneTaskId &&
getRunwayNeedsFallback(visibleTasks, keystoneTaskId);

  // load stored tasks from IndexedDB
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

  // Get existing settings, guarded by settingsLoaded
  useEffect(() => {
  persistSettings(settingsLoaded, {
    advancedFeaturesEnabled,
    showSnoozedTasks,
    showCompleted,
    viewMode,
    sortBy,
    sortDirection,
    filterLoad,
    filterPriority,
    filterContext,
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
  viewMode,
  sortBy,
  sortDirection,
  filterLoad,
  filterPriority,
  filterContext,
  focusModeEnabled,
  momentumModeEnabled,
  momentumEnergy,
  momentumRunActive,
  keystoneTaskId,
]);

// Stop Momentum Run if task no longer exists or is no longer eligible
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

// Set keystone task
function handleSetKeystone(taskId) {
  setKeystoneTaskId(taskId);
  setAllowCrossContextRunway(false);
  setMomentumError("");
}



  // Functions for handling custom context inputs
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

// Helper to warn user if they uncheck Momentum Mode toggle
function handleMomentumModeToggle(nextEnabled) {
  if (nextEnabled) {
    setMomentumModeEnabled(true);
    return;
  }

  const hasMomentumState =
    momentumRunActive || keystoneTaskId != null || momentumEnergy !== "";

  if (!hasMomentumState) {
    setMomentumModeEnabled(false);
    return;
  }

  const confirmed = window.confirm(
    "Turn off Momentum Mode? This will clear your current Momentum selections and end any active run."
  );

  if (!confirmed) return;

  setMomentumModeEnabled(false);
  setMomentumRunActive(false);
  setKeystoneTaskId(null);
  setMomentumEnergy("");
  setMomentumError("");
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



  // Move handlers for moving tasks up/down
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
  setEditPriority(task.priority ?? "medium"); // Being extra safe in case old tasks don't have a priority set
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
  };

  try {
    await saveTask(updatedTask);

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? updatedTask : task
      )
    );
  } catch (error) {
    console.error("Failed to update task:", error);
  }
}

  return (
    <div className="app">

      <header className="app-header">
        <h1>Cognitive Load Task Organizer</h1>
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
      </header>

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
        />
      </section>

      <div className="top-controls">
        <div className="mode-strip">
          <button
            className={viewMode === "custom" && !momentumModeEnabled ? "active" : ""}
            onClick={() => {
              setMomentumModeEnabled(false);
              setViewMode("custom");
            }}
          >
            Custom
          </button>

          <button
            className={viewMode === "sorted" ? "active" : ""}
            onClick={() => {
              setMomentumModeEnabled(false);
              setViewMode("sorted");
            }}
          >
            Sorted
          </button>

          {advancedFeaturesEnabled && (<button
            className={momentumModeEnabled ? "active" : ""}
            onClick={() => {
              setMomentumModeEnabled(true);
            }}
          >
            Momentum
          </button>)}
        </div>
        <div className="mode-controls">
          {advancedFeaturesEnabled && (
            <div className="advanced-features-panel">
              <div className="control-toggles">


              <label className="toggle toggle--sm">
                <span className="toggle__label">View Snoozed Tasks</span>
                <input
                    type="checkbox"
                    checked={showSnoozedTasks}
                    onChange={(e) => setShowSnoozedTasks(e.target.checked)}
                  />
                <span className="toggle__track" aria-hidden="true">
                  <span className="toggle__state toggle__state--off">OFF</span>
                  <span className="toggle__state toggle__state--on">ON</span>
                  <span className="toggle__thumb" />
                </span>
              </label>

              <label className="toggle toggle--sm">
                <span className="toggle__label">Focus Mode (show only 7 tasks)</span>
                <input
                    type="checkbox"
                    checked={focusModeEnabled}
                    onChange={(e) => setFocusModeEnabled(e.target.checked)}
                  />
                <span className="toggle__track" aria-hidden="true">
                  <span className="toggle__state toggle__state--off">OFF</span>
                  <span className="toggle__state toggle__state--on">ON</span>
                  <span className="toggle__thumb" />
                </span>
              </label>
              </div>
            </div>
          )}

          <div className="task-visibility-controls">
            
              <label className="toggle toggle--sm">
                <span className="toggle__label">Show completed tasks</span>
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                />
                <span className="toggle__track" aria-hidden="true">
                  <span className="toggle__state toggle__state--off">OFF</span>
                  <span className="toggle__state toggle__state--on">ON</span>
                  <span className="toggle__thumb" />
                </span>
              </label>

          </div>

          {viewMode === "sorted" && (
            <div className="sort-controls">
                {viewMode === "sorted" && (
                  <>
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
                  </>
                )}
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

        {/* Empty-state message if all tasks are completed */}
        {displayedTasks.length === 0 && (
          <p className="empty-state">
            No visible tasks right now.
          </p>
        )}
        <ul className="task-list">
          {/* Render only visible tasks */}
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
    </div>
  );
}

export default App;