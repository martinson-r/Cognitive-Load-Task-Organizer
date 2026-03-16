import { useEffect, useState } from "react";
import "./App.css";
import { getAllTasks, saveTask } from "./data/db";

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [load, setLoad] = useState("medium");

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
      done: false,
      createdAt: Date.now(),
    };

    try {
      await saveTask(newTask);
      setTasks((prev) => [newTask, ...prev]);
      setInput("");
      setLoad("medium");
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  }

  return (
    <div className="app">
      <h1>Cognitive Load Task List</h1>

      <form className="task-form" onSubmit={addTask}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task..."
        />

        <select value={load} onChange={(e) => setLoad(e.target.value)}>
          <option value="low">Low load</option>
          <option value="medium">Medium load</option>
          <option value="high">High load</option>
        </select>

        <button type="submit">Add</button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={`task-item task-item--${task.load}`}>
            <span>{task.title}</span>
            <span className="task-load">{task.load}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;