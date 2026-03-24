import { useEffect, useRef, useState } from "react";
import "../styles/task-card.css";
import { PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { LOAD_PILL_COLORS, PRIORITY_PILL_COLORS, LOAD_PILL_LABELS, PRIORITY_PILL_LABELS, getContextColor } from "../constants/TaskOptions";

function Pill({ label, bg, text }) {
  return (
    <span className="task-pill" style={{ background: bg, color: text }}>
      {label}
    </span>
  );
}

function TaskCard({
  task,
  editingTaskId,
  editTitle,
  setEditTitle,
  editLoad,
  setEditLoad,
  editPriority,
  setEditPriority,
  editContext,
  setEditContext,
  contextOptions,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteTask,
  onToggleTask,
  onMoveTaskUp,
  onMoveTaskDown,
  advancedFeaturesEnabled,
  onSnooze,
  onUnsnooze,
  loadLabels,
  priorityLabels,
  momentumModeEnabled,
  momentumRunActive,
  isKeystone,
  onSetKeystone,
}) {
  const isEditing = editingTaskId === task.id;
  const priorityValue = task.priority ?? "medium";
  const contextValue = task.context ?? "general";
  const isSnoozed = task.snoozedUntil && task.snoozedUntil > Date.now();
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const snoozeMenuRef = useRef(null);

  const loadColors = LOAD_PILL_COLORS[task.load] ?? LOAD_PILL_COLORS.medium;
  const priorityColors = PRIORITY_PILL_COLORS[priorityValue] ?? PRIORITY_PILL_COLORS.medium;
  const contextColors = getContextColor(contextValue);

  useEffect(() => {
    function handleClickOutside(event) {
      if (snoozeMenuRef.current && !snoozeMenuRef.current.contains(event.target)) {
        setShowSnoozeMenu(false);
      }
    }
    if (showSnoozeMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSnoozeMenu]);

  function formatSnoozeRemaining(snoozedUntil) {
    const diffMs = snoozedUntil - Date.now();
    if (diffMs <= 0) return "Ready now";
    const totalHours = Math.ceil(diffMs / (1000 * 60 * 60));
    if (totalHours < 24) return `${totalHours}h remaining`;
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    if (hours === 0) return `${days}d remaining`;
    return `${days}d ${hours}h remaining`;
  }

  return (
    <li className={[
      "task-item",
      `task-item--${task.load}`,
      isSnoozed ? "task-card--snoozed" : "",
      isKeystone ? "task-card--keystone" : "",
      task.done ? "task-item--done" : "",
    ].filter(Boolean).join(" ")}>

      {isEditing ? (
        <>
          <div className="task-content">
            <input
              className="edit-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <select className="edit-select" value={editLoad} onChange={(e) => setEditLoad(e.target.value)}>
              {Object.entries(loadLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select className="edit-select" value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select className="edit-select" value={editContext} onChange={(e) => setEditContext(e.target.value)}>
              {contextOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="task-actions">
            <button className="save-button" onClick={() => onSaveEdit(task.id)}>Save</button>
            <button className="cancel-button" onClick={onCancelEdit}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <div className="task-content">
            <label className="task-title-row">
              <input
                type="checkbox"
                className="task-checkbox"
                checked={task.done}
                onChange={() => onToggleTask(task.id)}
              />
              <span className="task-title">{task.title}</span>
            </label>

            <div className="task-meta">
              <Pill
                label={LOAD_PILL_LABELS[task.load] ?? task.load}
                bg={loadColors.bg}
                text={loadColors.text}
              />
              <Pill
                label={PRIORITY_PILL_LABELS[priorityValue] ?? priorityValue}
                bg={priorityColors.bg}
                text={priorityColors.text}
              />
              <Pill
                label={contextValue}
                bg={contextColors.bg}
                text={contextColors.text}
              />
            </div>
          </div>

          <div className="task-actions">
            <button className="move-button" onClick={() => onMoveTaskUp(task.id)} aria-label="Move task up">
              <ArrowUpIcon className="icon" />
            </button>
            <button className="move-button" onClick={() => onMoveTaskDown(task.id)} aria-label="Move task down">
              <ArrowDownIcon className="icon" />
            </button>

            {isSnoozed && (
              <span className="task-snooze-info">
                Snoozed · {formatSnoozeRemaining(task.snoozedUntil)}
              </span>
            )}

            {advancedFeaturesEnabled && !isSnoozed && (
              <div className="task-action-menu" ref={snoozeMenuRef}>
                <button type="button" className="task-action-button" onClick={() => setShowSnoozeMenu((prev) => !prev)}>
                  Snooze
                </button>
                {showSnoozeMenu && (
                  <div className="task-submenu">
                    <button type="button" onClick={() => { onSnooze(task.id, 24); setShowSnoozeMenu(false); }}>Snooze 24h</button>
                    <button type="button" onClick={() => { onSnooze(task.id, 48); setShowSnoozeMenu(false); }}>Snooze 48h</button>
                    <button type="button" onClick={() => { onSnooze(task.id, 72); setShowSnoozeMenu(false); }}>Snooze 72h</button>
                  </div>
                )}
              </div>
            )}

            {advancedFeaturesEnabled && isSnoozed && (
              <button onClick={() => onUnsnooze(task.id)}>Un-snooze</button>
            )}

            {advancedFeaturesEnabled && momentumModeEnabled && !momentumRunActive && (
              isKeystone ? (
                <span className="keystone-badge">Keystone</span>
              ) : (
                <button type="button" onClick={() => onSetKeystone(task.id)}>Set Keystone</button>
              )
            )}

            <button className="edit-button icon-button" onClick={() => onStartEdit(task)} aria-label="Edit task">
              <PencilIcon className="icon" />
            </button>
            <button className="delete-button icon-button" onClick={() => onDeleteTask(task.id)} aria-label="Delete task">
              <TrashIcon className="icon" />
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export default TaskCard;