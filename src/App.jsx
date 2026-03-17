import { useEffect, useState } from "react";
import "./App.css";
import {
  getAllTasks,
  saveTask,
  deleteTask,
  getCustomContexts,
  saveCustomContexts,
} from "./data/db";
import TaskForm from "./components/TaskForm";
import {
  LOAD_LABELS,
  PRIORITY_LABELS,
  DEFAULT_CONTEXT_OPTIONS,
} from "./constants/TaskOptions";
import TaskCard from "./components/TaskCard";

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

  // Derive available context options (can dedupe later if needed)
  const contextOptions = Array.from(
  new Set([
      ...DEFAULT_CONTEXT_OPTIONS,
      ...customContexts,
      ...(editContext ? [editContext] : []),
    ])
  );

  // Derive visible tasks before render, let's just not mutate data if we can avoid it
  const visibleTasks = showCompleted
  ? tasks
  : tasks.filter((task) => !task.done);

  // load stored tasks from IndexedDB
  useEffect(() => {
    async function loadAppData() {
      try {
        const [storedTasks, storedCustomContexts] = await Promise.all([
          getAllTasks(),
          getCustomContexts(),
        ]);

        const normalizedTasks = storedTasks
          .map((task, index) => ({
            ...task,
            position: task.position ?? index,
          }))
          .sort((a, b) => a.position - b.position);

        setTasks(normalizedTasks);
        setCustomContexts(storedCustomContexts);
      } catch (error) {
        console.error("Failed to load app data from IndexedDB:", error);
      }
    }

    loadAppData();
  }, []);

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

  // Move handlers for moving tasks up/down
  async function handleMoveTaskUp(id) {
    const currentIndex = tasks.findIndex((task) => task.id === id);

    if (currentIndex <= 0) return;

    const reorderedTasks = swapTasks(tasks, currentIndex, currentIndex - 1);

    try {
      await Promise.all(reorderedTasks.map((task) => saveTask(task)));
      setTasks(reorderedTasks);
    } catch (error) {
      console.error("Failed to move task up:", error);
    }
  }

  async function handleMoveTaskDown(id) {
    const currentIndex = tasks.findIndex((task) => task.id === id);

    if (currentIndex === -1 || currentIndex >= tasks.length - 1) return;

    const reorderedTasks = swapTasks(tasks, currentIndex, currentIndex + 1);

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
            loadLabels={LOAD_LABELS}
            priorityLabels={PRIORITY_LABELS}
          />
        ))}
      </ul>
    </div>
  );
}

export default App;