import "../styles/task-form.css";

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
  loadLabels,
  priorityLabels,
}) {
  return (
    <div className="task-form-wrapper">
      <form className="task-form" onSubmit={onSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task..."
        />

        <select value={load} onChange={(e) => setLoad(e.target.value)}>
          {Object.entries(loadLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {Object.entries(priorityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select value={context} onChange={(e) => onContextChange(e.target.value)}>
          {contextOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          <option value="__add_custom__">+ Add custom context</option>
        </select>

        <button type="submit">Add</button>
      </form>

      {showCustomContextInput && (
        <div className="custom-context-row">
          <input
            value={newContextInput}
            onChange={(e) => setNewContextInput(e.target.value)}
            placeholder="New context name..."
          />
          <button type="button" onClick={onAddCustomContext}>
            Save Context
          </button>
          <button type="button" onClick={onCancelCustomContext}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskForm;