import { useState, useEffect, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import "../styles/task-form.css";
import { LOAD_PILL_COLORS, PRIORITY_PILL_COLORS, getContextColor } from "../constants/TaskOptions";

// Assuming SegmentGroup and SegmentPicker have been correctly imported
// from the updated SegmentGroup.jsx file depending on your folder setup.
import { SegmentGroup } from "./SegmentGroup"; 

const LOAD_SHORT = {
  low: "low load",
  medium: "med load",
  high: "high load",
};

const PRIORITY_SHORT = {
  low: "low priority",
  medium: "med priority",
  high: "high priority",
};

function TaskForm({
  input,
  setInput,
  load,
  setLoad,
  priority,
  setPriority,
  context,
  onContextChange,
  contextOptions,
  showCustomContextInput,
  newContextInput,
  setNewContextInput,
  onAddCustomContext,
  onCancelCustomContext,
  onSubmit,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  
  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") handleClose();
    }
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  function handleClose() {
    setIsOpen(false);
    if (showCustomContextInput) onCancelCustomContext();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(e);
    setIsOpen(false);
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
        onClick={() => setIsOpen(true)}
        aria-label="Add a task"
      >
        <span className="task-form-trigger__placeholder">Add a task</span>
      </button>

      {isOpen && (
        <div
          className="task-modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div 
            className="task-modal" 
            role="dialog" 
            aria-modal="true"
            aria-label="Add task"
            ref={modalRef}
          >
            <div className="task-modal__header">
              <input
                ref={inputRef}
                className="task-modal__name-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Task name"
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(e); }}
              />
              <button
                type="button"
                className="task-modal__close"
                onClick={handleClose}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="task-modal__segments">
              <SegmentGroup
                label="Cognitive Load"
                options={loadOptions}
                value={load}
                onChange={setLoad}
                getOptionColor={(val) => LOAD_PILL_COLORS[val]}
              />
              <SegmentGroup
                label="Priority"
                options={priorityOptions}
                value={priority}
                onChange={setPriority}
                getOptionColor={(val) => PRIORITY_PILL_COLORS[val]}
              />
              <SegmentGroup
                label="Context"
                options={contextSegmentOptions}
                value={context}
                onChange={onContextChange}
                getOptionColor={(val) => val === "__add_custom__" ? null : getContextColor(val)}
              />
            </div>

            {showCustomContextInput && (
              <div className="task-modal__custom-context">
                <input
                  value={newContextInput}
                  onChange={(e) => setNewContextInput(e.target.value)}
                  placeholder="New context name..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); onAddCustomContext(); }
                  }}
                />
                <button type="button" onClick={onAddCustomContext}>Save</button>
                <button type="button" onClick={onCancelCustomContext}>Cancel</button>
              </div>
            )}

            <button
              className="task-modal__save"
              onClick={handleSubmit}
              disabled={!input.trim()}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskForm;