import { useState, useEffect, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import "../styles/task-form.css";
import {
  LOAD_PILL_COLORS, PRIORITY_PILL_COLORS, getContextColor,
  LOAD_SHORT, PRIORITY_SHORT, ColorPair,
} from "../constants/TaskOptions";
import { SegmentGroup } from "./SegmentGroup";
import { useTaskStore } from "../store/useTaskStore";
import { useUIStore } from "../store/useUIStore";
import { LoadLevel, PriorityLevel } from "../types";

interface TaskFormProps {
  contextOptions: string[];
}

function TaskForm({ contextOptions }: TaskFormProps) {
  const {
    addTask, addCustomContext, setContextColorOverride,
    contextColorOverrides, customColorPalette,
  } = useTaskStore();
  const { taskFormOpen, closeTaskForm, openSettings } = useUIStore();

  const [input, setInput] = useState("");
  const [load, setLoad] = useState<LoadLevel>("medium");
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [context, setContext] = useState("general");

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

  async function handleQuickAddContext(name: string, color?: ColorPair) {
    await addCustomContext(name);
    if (color) await setContextColorOverride(name, color);
  }

  function handleManageContexts() {
    handleClose();
    openSettings();
  }

  const loadOptions = Object.entries(LOAD_SHORT).map(([value, label]) => ({ value, label }));
  const priorityOptions = Object.entries(PRIORITY_SHORT).map(([value, label]) => ({ value, label }));
  const contextSegmentOptions = contextOptions.map((opt) => ({ value: opt, label: opt }));

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
                onChange={setContext}
                getOptionColor={(val) => getContextColor(val, contextColorOverrides)}
                quickAddProps={{
                  palette: customColorPalette,
                  onAdd: handleQuickAddContext,
                  onManage: handleManageContexts,
                  manageLabel: "Manage and Delete",
                }}
              />
            </div>

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