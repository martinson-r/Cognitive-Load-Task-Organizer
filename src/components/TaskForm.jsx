import { useState, useEffect, useRef } from "react";
import "../styles/task-form.css";

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

// Second-layer picker modal — opens on top of the task modal
function SegmentPicker({ label, options, value, onChange, onClose }) {
  const [hasScrollableContent, setHasScrollableContent] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setHasScrollableContent(el.scrollHeight > el.clientHeight);
      setIsScrolledToBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 2);
    };
    check();
    el.addEventListener("scroll", check);
    return () => el.removeEventListener("scroll", check);
  }, [options]);

  return (
    <div
      className="segment-picker-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="segment-picker" role="dialog" aria-label={`Choose ${label}`}>
        <div className="segment-picker__header">
          <span className="segment-picker__title">{label}</span>
          <button
            type="button"
            className="task-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="segment-picker__scroll-wrap">
          <div
            className="segment-picker__options"
            ref={scrollRef}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`segment-picker__option ${value === opt.value ? "segment-picker__option--selected" : ""}`}
                onClick={() => { onChange(opt.value); onClose(); }}
              >
                {opt.label}
                {value === opt.value && (
                  <span className="segment-picker__check" aria-hidden="true">✓</span>
                )}
              </button>
            ))}
          </div>
          {hasScrollableContent && !isScrolledToBottom && (
            <div className="segment-picker__fade" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}

// Stable segment button — never expands in place
function SegmentGroup({ label, options, value, onChange }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="segment-group">
      <span className="segment-group__label">{label}</span>
      <button
        type="button"
        className="segment-selected"
        onClick={() => setPickerOpen(true)}
      >
        <span className="segment-selected__text">{selectedLabel}</span>
        <span className="segment-caret" aria-hidden="true">›</span>
      </button>

      {pickerOpen && (
        <SegmentPicker
          label={label}
          options={options}
          value={value}
          onChange={onChange}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

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
  const inputRef = useRef(null);

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
          <div className="task-modal" role="dialog" aria-label="Add task">
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
              />
              <SegmentGroup
                label="Priority"
                options={priorityOptions}
                value={priority}
                onChange={setPriority}
              />
              <SegmentGroup
                label="Context"
                options={contextSegmentOptions}
                value={context}
                onChange={onContextChange}
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