import { 
        PencilIcon, 
        TrashIcon,
        ArrowUpIcon,
        ArrowDownIcon, 
        } from "@heroicons/react/24/outline";

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
  loadLabels,
  priorityLabels,
}) {
  const isEditing = editingTaskId === task.id;
  const priorityValue = task.priority ?? "medium";

  return (
    <li
      className={`task-item task-item--${task.load} ${
        task.done ? "task-item--done" : ""
      }`}
    >
      {isEditing ? (
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
              {Object.entries(loadLabels).map(([value, label]) => (
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
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
                className="edit-select"
                value={editContext}
                onChange={(e) => setEditContext(e.target.value)}
                >
                {contextOptions.map((option) => (
                    <option key={option} value={option}>
                    {option}
                    </option>
                ))}
            </select>
          </div>

          <div className="task-actions">
            <button
              className="save-button"
              onClick={() => onSaveEdit(task.id)}
            >
              Save
            </button>
            <button className="cancel-button" onClick={onCancelEdit}>
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
                onChange={() => onToggleTask(task.id)}
              />
              <span className="task-title">{task.title}</span>
            </label>

            <span className="task-load">
              {loadLabels[task.load] ?? loadLabels.medium}
            </span>

            <span className={`task-priority task-priority--${priorityValue}`}>
              {priorityLabels[priorityValue] ?? priorityLabels.medium}
            </span>

            <span className="task-context">
                {task.context ?? "general"}
            </span>
          </div>

          <div className="task-actions">
            <button
                className="move-button"
                onClick={() => onMoveTaskUp(task.id)}
                aria-label="Move task up"
            >
                <ArrowUpIcon className="icon" />
            </button>

            <button
                className="move-button"
                onClick={() => onMoveTaskDown(task.id)}
                aria-label="Move task down"
            >
                <ArrowDownIcon className="icon" />
            </button>

            <button
                className="edit-button"
                onClick={() => onStartEdit(task)}
                aria-label="Edit task"
            >
                <PencilIcon className="icon" />
            </button>

            <button
                className="delete-button"
                onClick={() => onDeleteTask(task.id)}
                aria-label="Delete task"
            >
                <TrashIcon className="icon" />
            </button>
        </div>
        </>
      )}
    </li>
  );
}

export default TaskCard;