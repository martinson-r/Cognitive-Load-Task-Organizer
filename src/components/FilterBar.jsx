import '../styles/filter-bar.css';

function FilterBar({
  filterLoad,
  setFilterLoad,
  filterPriority,
  setFilterPriority,
  filterContext,
  setFilterContext,
  contextOptions,
  loadLabels,
  priorityLabels,
}) {
  return (
    <div className="filter-bar">
      <select value={filterLoad} onChange={(e) => setFilterLoad(e.target.value)}>
        <option value="all">All cognitive loads</option>
        {Object.entries(loadLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={filterPriority}
        onChange={(e) => setFilterPriority(e.target.value)}
      >
        <option value="all">All priorities</option>
        {Object.entries(priorityLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select value={filterContext} onChange={(e) => setFilterContext(e.target.value)}>
        <option value="all">All contexts</option>
        {contextOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterBar;