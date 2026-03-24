import { useEffect, useRef } from "react";
import "../styles/task-form.css";
import { LOAD_PILL_COLORS, PRIORITY_PILL_COLORS, getContextColor } from "../constants/TaskOptions";
import { SegmentGroup } from "./SegmentGroup";

const LOAD_OPTIONS = [
  { value: "low",    label: "Low cognitive load" },
  { value: "medium", label: "Medium cognitive load" },
  { value: "high",   label: "High cognitive load" },
];

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low priority" },
  { value: "medium", label: "Medium priority" },
  { value: "high",   label: "High priority" },
];

function EditTaskModal({
  task,
  editTitle,
  setEditTitle,
  editLoad,
  setEditLoad,
  editPriority,
  setEditPriority,
  editContext,
  setEditContext,
  contextOptions,
  onSave,
  onCancel,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  const contextEditOptions = [
    ...contextOptions.map((opt) => ({ value: opt, label: opt })),
  ];

  return (
    <div
      className="task-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="task-modal" role="dialog" aria-label="Edit task">
        <div className="task-modal__header">
          <input
            ref={inputRef}
            className="task-modal__name-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task name"
            onKeyDown={(e) => { if (e.key === "Enter") onSave(); }}
          />
          <button
            type="button"
            className="task-modal__close"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="task-modal__segments">
          <SegmentGroup
            label="Cognitive Load"
            options={LOAD_OPTIONS}
            value={editLoad}
            onChange={setEditLoad}
            getOptionColor={(val) => LOAD_PILL_COLORS[val]}
          />
          <SegmentGroup
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={editPriority}
            onChange={setEditPriority}
            getOptionColor={(val) => PRIORITY_PILL_COLORS[val]}
          />
          <SegmentGroup
            label="Context"
            options={contextEditOptions}
            value={editContext}
            onChange={setEditContext}
            getOptionColor={(val) => getContextColor(val)}
          />
        </div>

        <div className="task-modal__edit-actions">
          <button
            className="task-modal__save"
            onClick={onSave}
            disabled={!editTitle.trim()}
          >
            Save
          </button>
          <button className="task-modal__cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditTaskModal;