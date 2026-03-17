function TaskForm({
  input,
  setInput,
  load,
  setLoad,
  priority,
  setPriority,
  context,
  setContext,
  contextOptions,
  onSubmit,
  loadLabels,
  priorityLabels,
}) {
  return (
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

      <select value={context} onChange={(e) => setContext(e.target.value)}>
        {contextOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <button type="submit">Add</button>
    </form>
  );
}

export default TaskForm;