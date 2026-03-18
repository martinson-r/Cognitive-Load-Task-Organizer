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

import TaskForm from "./components/TaskForm";
import TaskCard from "./components/TaskCard";
import FilterBar from "./components/FilterBar";

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
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [showSnoozedTasks, setShowSnoozedTasks] = useState(false);

  // Derive available context options (can dedupe later if needed)
  const contextOptions = Array.from(
  new Set([
      ...DEFAULT_CONTEXT_OPTIONS,
      ...customContexts,
      ...(editContext ? [editContext] : []),
    ])
  );

  const LOAD_RANK = {
    low: 0,
    medium: 1,
    high: 2,
  };

  const PRIORITY_RANK = {
    low: 0,
    medium: 1,
    high: 2,
  };

  // Derive visible tasks before render, let's just not mutate data if we can avoid it
  // Avoid re-sorting them or interfering with custom sort
  let visibleTasks = tasks.filter((task) => {
    const now = Date.now();
    const isSnoozed =
      task.snoozedUntil && task.snoozedUntil > now;

    if (!showSnoozedTasks && isSnoozed) {
      return false;
    }
    if (!showCompleted && task.done) return false;
    if (filterLoad !== "all" && task.load !== filterLoad) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    if (filterContext !== "all" && task.context !== filterContext) return false;
    return true;
  });

  // Sorted views
  if (viewMode === "sorted") {
    
    visibleTasks = [...visibleTasks].sort((a, b) => {
      const rankMap = sortBy === "load" ? LOAD_RANK : PRIORITY_RANK;

      const aRank = rankMap[a[sortBy] ?? "medium"];
      const bRank = rankMap[b[sortBy] ?? "medium"];

      if (aRank !== bRank) {
        return sortDirection === "asc" ? aRank - bRank : bRank - aRank;
      }

      // tiebreaker is Custom View position
      return (a.position ?? 0) - (b.position ?? 0);
    });
  }

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
        setSettingsLoaded(true);
      } catch (error) {
        console.error("Failed to load app data from IndexedDB:", error);
      }
    }

    loadAppData();
  }, []);

  // Get existing settings, guarded by settingsLoaded
  useEffect(() => {
    if (!settingsLoaded) return;

    saveSetting("advancedFeaturesEnabled", advancedFeaturesEnabled).catch((error) => {
      console.error("Failed to save advanced features setting:", error);
    });
  }, [advancedFeaturesEnabled, settingsLoaded]);

  useEffect(() => {
  if (!settingsLoaded) return;

  saveSetting("showSnoozedTasks", showSnoozedTasks).catch((error) => {
    console.error("Failed to save show snoozed tasks setting:", error);
  });
  }, [showSnoozedTasks, settingsLoaded]);
  useEffect(() => {
    if (!settingsLoaded) return;
    saveSetting("showCompleted", showCompleted).catch((error) => {
      console.error("Failed to save show completed setting:", error);
    });
  }, [showCompleted, settingsLoaded]);

  useEffect(() => {
    if (!settingsLoaded) return;
    saveSetting("viewMode", viewMode).catch((error) => {
      console.error("Failed to save view mode setting:", error);
    });
  }, [viewMode, settingsLoaded]);

  useEffect(() => {
    if (!settingsLoaded) return;
    saveSetting("sortBy", sortBy).catch((error) => {
      console.error("Failed to save sortBy setting:", error);
    });
  }, [sortBy, settingsLoaded]);

  useEffect(() => {
    if (!settingsLoaded) return;
    saveSetting("sortDirection", sortDirection).catch((error) => {
      console.error("Failed to save sortDirection setting:", error);
    });
  }, [sortDirection, settingsLoaded]);

  useEffect(() => {
  if (!settingsLoaded) return;
  saveSetting("filterLoad", filterLoad).catch((error) => {
    console.error("Failed to save filterLoad setting:", error);
  });
}, [filterLoad, settingsLoaded]);

useEffect(() => {
  if (!settingsLoaded) return;
  saveSetting("filterPriority", filterPriority).catch((error) => {
    console.error("Failed to save filterPriority setting:", error);
  });
}, [filterPriority, settingsLoaded]);

useEffect(() => {
  if (!settingsLoaded) return;
  saveSetting("filterContext", filterContext).catch((error) => {
    console.error("Failed to save filterContext setting:", error);
  });
}, [filterContext, settingsLoaded]);

  function normalizeTaskPositions(tasks) {
    // Make sure tasks persist in the same order, not loaded randomly
    return tasks.map((task, index) => ({
      ...task,
      position: index,
    }));
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

  function swapTasks(tasks, fromIndex, toIndex) {
    // Copies array, swaps neighbors, and reassigns clean position values
  const updatedTasks = [...tasks];
  [updatedTasks[fromIndex], updatedTasks[toIndex]] = [
    updatedTasks[toIndex],
    updatedTasks[fromIndex],
  ];
  return normalizeTaskPositions(updatedTasks);
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

// Helper to avoid filtered, completed, or snoozed tasks from interfering with reordering tasks
function reorderByVisibleSwap(allTasks, visibleTasks, taskId, direction) {
  const visibleIndex = visibleTasks.findIndex((task) => task.id === taskId);
  if (visibleIndex === -1) return allTasks;

  const targetIndex =
    direction === "up" ? visibleIndex - 1 : visibleIndex + 1;

  if (targetIndex < 0 || targetIndex >= visibleTasks.length) {
    return allTasks;
  }

  const currentVisibleTask = visibleTasks[visibleIndex];
  const targetVisibleTask = visibleTasks[targetIndex];

  const updatedTasks = allTasks.map((task) => {
    if (task.id === currentVisibleTask.id) {
      return { ...task, position: targetVisibleTask.position };
    }
    if (task.id === targetVisibleTask.id) {
      return { ...task, position: currentVisibleTask.position };
    }
    return task;
  });

  return [...updatedTasks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

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
      <div className="toolbar-row">
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={advancedFeaturesEnabled}
            onChange={(e) => setAdvancedFeaturesEnabled(e.target.checked)}
          />
          <span>Advanced Features</span>
        </label>
      </div>
      <h1>Cognitive Load Task Organizer</h1>
      <div className="info-banner">
        <p>No account required.</p>
        <p>Data is stored locally in your browser using IndexedDB. 
        This app does not include authentication or encryption.</p>
        <p><strong>Do not store sensitive information in this app.</strong></p>
      </div>

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

      {advancedFeaturesEnabled && (
        <div className="advanced-features-panel">
          <p className="advanced-features-note">
            Advanced features enabled. Focus View, Snooze, and Momentum Mode will appear here.
          </p>
          <label>
            <input
              type="checkbox"
              checked={showSnoozedTasks}
              onChange={(e) => setShowSnoozedTasks(e.target.checked)}
            />
            View Snoozed Tasks
          </label>
        </div>
      )}

      <div className="task-visibility-controls">
        <label className="show-completed-toggle">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          Show completed tasks
        </label>
      </div>

      <div className="sort-controls">
        <label>
          Order mode
          <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
            <option value="custom">Custom Order</option>
            <option value="sorted">Auto Sort</option>
          </select>
        </label>

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

      {/* Empty-state message if all tasks are completed */}
      {visibleTasks.length === 0 && (
        <p className="empty-state">
          No visible tasks right now.
        </p>
      )}

      <ul className="task-list">
        {/* Render only visible tasks */}
        {visibleTasks.map((task) => (
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
          />
        ))}
      </ul>
    </div>
  );
}

export default App;