import { useState, useEffect, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import "../styles/task-form.css";
import {
  LOAD_PILL_COLORS, PRIORITY_PILL_COLORS, getContextColor,
  LOAD_SHORT, PRIORITY_SHORT,
} from "../constants/TaskOptions";
import { SegmentGroup } from "./SegmentGroup";
import { useTaskStore } from "../store/useTaskStore";
import { useUIStore } from "../store/useUIStore";
import { LoadLevel, PriorityLevel } from "../types";

interface TaskFormProps {
  contextOptions: string[];
}

function TaskForm({ contextOptions }: TaskFormProps) {
  const { addTask, addCustomContext, contextColorOverrides } = useTaskStore();
  const { taskFormOpen, closeTaskForm, openSettings } = useUIStore();

  const [input, setInput] = useState("");
  const [load, setLoad] = useState<LoadLevel>("medium");
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [context, setContext] = useState("general");
  const [showCustomContextInput, setShowCustomContextInput] = useState(false);
  const [newContextInput, setNewContextInput] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(modalRef, taskFormOpen);

  useEffect(() => {
    if (taskFormOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [taskFormOpen]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    if (taskFormOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [taskFormOpen]);

  function handleClose() {
    closeTaskForm();
    if (showCustomContextInput) {
      setShowCustomContextInput(false);
      setNewContextInput("");
    }
  }

  async function handleSubmit(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    await addTask({ title: input.trim(), load, priority, context });
    setInput("");
    setLoad("medium");
    setPriority("medium");
    setContext("general");
    closeTaskForm();
  }

  function handleContextChange(value: string) {
    if (value === "__add_custom__") {
      setShowCustomContextInput(true);
      return;
    }
    setContext(value);
  }

  async function handleAddCustomContext() {
    const trimmed = newContextInput.trim().toLowerCase();
    if (!trimmed) return;
    await addCustomContext(trimmed);
    setContext(trimmed);
    setNewContextInput("");
    setShowCustomContextInput(false);
  }

  function handleManageContexts() {
    handleClose();
    openSettings();
  }

  const loadOptions = Object.entries(LOAD_SHORT).map(([value, label]) => ({ value, label }));
  const priorityOptions = Object.entries(PRIORITY_SHORT).map(([value, label]) => ({ value, label }));
  const contextSegmentOptions = [
    ...contextOptions.map((opt) => ({ value: opt, label: opt })),
    { value: "__add_custom__", label: "+ add custom" },
  ];

  return (
    <>
      <button
        type="button"
        className="task-form-trigger"
        onClick={() => useUIStore.getState().openTaskForm()}
        aria-label="Add a task"
      >
        <span className="task-form-trigger__placeholder">Add a task</span>
      </button>

      {taskFormOpen && (
        <div
          className="task-modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="task-modal" role="dialog" aria-modal="true" aria-label="New task" ref={modalRef}>
            <div className="task-modal__header">
              <input
                ref={inputRef}
                className="task-modal__name-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Task name"
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(e); }}
              />
              <button type="button" className="task-modal__close" onClick={handleClose} aria-label="Close">✕</button>
            </div>

            <div className="task-modal__segments">
              <SegmentGroup
                label="Cognitive Load"
                options={loadOptions}
                value={load}
                onChange={(val) => setLoad(val as LoadLevel)}
                getOptionColor={(val) => LOAD_PILL_COLORS[val as LoadLevel] ?? null}
              />
              <SegmentGroup
                label="Priority"
                options={priorityOptions}
                value={priority}
                onChange={(val) => setPriority(val as PriorityLevel)}
                getOptionColor={(val) => PRIORITY_PILL_COLORS[val as PriorityLevel] ?? null}
              />
              <SegmentGroup
                label="Context"
                options={contextSegmentOptions}
                value={context}
                onChange={handleContextChange}
                getOptionColor={(val) => val === "__add_custom__" ? null : getContextColor(val, contextColorOverrides)}
                footerItems={[
                  { label: "↗ manage contexts", onClick: handleManageContexts },
                ]}
              />
            </div>

            {showCustomContextInput && (
              <div className="task-modal__custom-context">
                <input
                  value={newContextInput}
                  onChange={(e) => setNewContextInput(e.target.value)}
                  placeholder="New context name..."
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomContext(); } }}
                />
                <button type="button" onClick={handleAddCustomContext}>Save</button>
                <button type="button" onClick={() => { setShowCustomContextInput(false); setNewContextInput(""); }}>Cancel</button>
              </div>
            )}

            <button className="task-modal__save" onClick={handleSubmit} disabled={!input.trim()}>
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskForm;