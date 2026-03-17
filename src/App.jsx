import { useEffect, useState } from "react";
import "./App.css";
import { getAllTasks, saveTask, deleteTask } from "./data/db";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [load, setLoad] = useState("medium");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLoad, setEditLoad] = useState("medium");
  const [priority, setPriority] = useState("medium");
  const [editPriority, setEditPriority] = useState("medium");

  const LOAD_LABELS = {
    low: "Low cognitive load",
    medium: "Medium cognitive load",
    high: "High cognitive load",
  };

  const PRIORITY_LABELS = {
    low: "Low priority",
    medium: "Medium priority",
    high: "High priority",
  };

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

  async function addTask(e) {
    e.preventDefault();

    if (!input.trim()) return;

    const newTask = {
      id: crypto.randomUUID(),
      title: input.trim(),
      load,
      priority,
      done: false,
      createdAt: Date.now(),
    };

    try {
      await saveTask(newTask);
      setTasks((prev) => [newTask, ...prev]);
      setInput("");
      setLoad("medium");
      setPriority("medium");
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
}

function handleCancelEdit() {
  setEditingTaskId(null);
  setEditTitle("");
  setEditLoad("medium");
  setEditPriority("medium");
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

      <form className="task-form" onSubmit={addTask}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task..."
        />

        <select value={load} onChange={(e) => setLoad(e.target.value)}>
          {Object.entries(LOAD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button type="submit">Add</button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`task-item task-item--${task.load} ${
              task.done ? "task-item--done" : ""
            }`}
          >
            {editingTaskId === task.id ? (
              <>
                <div className="task-content">
                  <input
                    className="edit-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />

                  <select
                    className="edit-select"
                    value={editLoad}
                    onChange={(e) => setEditLoad(e.target.value)}
                  >
                    {Object.entries(LOAD_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <select
                    className="edit-select"
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                  >
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="task-actions">
                  <button
                    className="save-button"
                    onClick={() => handleSaveEdit(task.id)}
                  >
                    Save
                  </button>
                  <button className="cancel-button" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="task-content">
                  <label className="task-title-row">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => handleToggleTask(task.id)}
                    />
                    <span className="task-title">{task.title}</span>
                  </label>

                  <span className="task-load">
                    {LOAD_LABELS[task.load] ?? LOAD_LABELS.medium}
                  </span>

                  <span className={`task-priority task-priority--${task.priority ?? "medium"}`}>
                    {PRIORITY_LABELS[task.priority] ?? PRIORITY_LABELS.medium}
                  </span>
                </div>

                <div className="task-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleStartEdit(task)}
                  >
                    <PencilIcon className="icon" />
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <TrashIcon className="icon" />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;