import { useEffect, useState } from "react";
import "./App.css";
import { getAllTasks, saveTask, deleteTask } from "./data/db";
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

  // load stored tasks from IndexedDB
  useEffect(() => {
    async function loadTasks() {
      try {
        const storedTasks = await getAllTasks();
        setTasks(storedTasks);
      } catch (error) {
        console.error("Failed to load tasks from IndexedDB:", error);
      }
    }

    loadTasks();
  }, []);

  // Load and save custom Context information to localStorage
  useEffect(() => {
  const storedContexts = localStorage.getItem("custom-context-options");
  if (storedContexts) {
    setCustomContexts(JSON.parse(storedContexts));
  }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "custom-context-options",
      JSON.stringify(customContexts)
    );
  }, [customContexts]);

  function handleAddCustomContext() {
    const trimmed = newContextInput.trim().toLowerCase();

    if (!trimmed) return;
    if (contextOptions.includes(trimmed)) return;

    setCustomContexts((prev) => [...prev, trimmed]);
    setContext(trimmed);
    setNewContextInput("");
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

    try {
      await saveTask(newTask);
      setTasks((prev) => [newTask, ...prev]);
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
    await deleteTask(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  } catch (error) {
    console.error("Failed to delete task:", error);
  }
}

function handleStartEdit(task) {
  setEditingTaskId(task.id);
  setEditTitle(task.title);
  setEditLoad(task.load);
  setEditPriority(task.priority ?? "medium"); // Being extra safe in case old tasks don't have a priority set
  setEditContext(task.context ?? "computer");
}

function handleCancelEdit() {
  setEditingTaskId(null);
  setEditTitle("");
  setEditLoad("medium");
  setEditPriority("medium");
  setEditContext("computer");
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

      <TaskForm
        input={input}
        setInput={setInput}
        load={load}
        setLoad={setLoad}
        priority={priority}
        setPriority={setPriority}
        context={context}
        setContext={setContext}
        contextOptions={DEFAULT_CONTEXT_OPTIONS}
        onSubmit={addTask}
        loadLabels={LOAD_LABELS}
        priorityLabels={PRIORITY_LABELS}
      />

      <ul className="task-list">
        {tasks.map((task) => (
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
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
            loadLabels={LOAD_LABELS}
            priorityLabels={PRIORITY_LABELS}
          />
        ))}
      </ul>
    </div>
  );
}

export default App;