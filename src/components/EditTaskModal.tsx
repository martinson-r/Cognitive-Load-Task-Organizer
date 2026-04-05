import { useEffect, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap.ts";
import "../styles/task-form.css";
import { LOAD_PILL_COLORS, PRIORITY_PILL_COLORS, getContextColor, LOAD_OPTIONS, PRIORITY_OPTIONS } from "../constants/TaskOptions";
import { SegmentGroup } from "./SegmentGroup";
import { useUIStore } from "../store/useUIStore";
import { useTaskStore } from "../store/useTaskStore";
import { LoadLevel, PriorityLevel } from "../types";

interface EditTaskModalProps {
  contextOptions: string[];
}

function EditTaskModal({ contextOptions }: EditTaskModalProps) {
  const { editDraft, updateEditDraft, cancelEdit } = useUIStore();
  const { saveEdit, contextColorOverrides } = useTaskStore();

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useFocusTrap(modalRef);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") cancelEdit();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [cancelEdit]);

  if (!editDraft) return null;

  const contextEditOptions = contextOptions.map((opt) => ({ value: opt, label: opt }));

  async function handleSave() {
    if (!editDraft || !editDraft.title.trim()) return;
    await saveEdit(editDraft.taskId, {
      title: editDraft.title,
      load: editDraft.load,
      priority: editDraft.priority,
      context: editDraft.context,
    });
    cancelEdit();
  }

  return (
    <div
      className="task-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) cancelEdit(); }}
    >
      <div className="task-modal" role="dialog" aria-modal="true" aria-label="Edit task" ref={modalRef}>
        <div className="task-modal__header">
          <input
            ref={inputRef}
            className="task-modal__name-input"
            value={editDraft.title}
            onChange={(e) => updateEditDraft({ title: e.target.value })}
            placeholder="Task name"
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          />
          <button type="button" className="task-modal__close" onClick={cancelEdit} aria-label="Close">✕</button>
        </div>

        <div className="task-modal__segments">
          <SegmentGroup
            label="Cognitive Load"
            options={LOAD_OPTIONS}
            value={editDraft.load}
            onChange={(val) => updateEditDraft({ load: val as LoadLevel })}
            getOptionColor={(val) => LOAD_PILL_COLORS[val as LoadLevel] ?? null}
          />
          <SegmentGroup
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={editDraft.priority}
            onChange={(val) => updateEditDraft({ priority: val as PriorityLevel })}
            getOptionColor={(val) => PRIORITY_PILL_COLORS[val as PriorityLevel] ?? null}
          />
          <SegmentGroup
            label="Context"
            options={contextEditOptions}
            value={editDraft.context}
            onChange={(val) => updateEditDraft({ context: val })}
            getOptionColor={(val) => getContextColor(val, contextColorOverrides)}
          />
        </div>

        <div className="task-modal__edit-actions">
          <button className="task-modal__save" onClick={handleSave} disabled={!editDraft.title.trim()}>
            Save
          </button>
          <button className="task-modal__cancel" onClick={cancelEdit}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default EditTaskModal;