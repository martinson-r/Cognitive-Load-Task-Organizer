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
  onResetFilters,
}) {
  const hasActiveFilters =
    filterLoad !== "all" ||
    filterPriority !== "all" ||
    filterContext !== "all";

  const filterSelectClass = "filter-select";

  return (
    <div className="filter-bar-wrapper">
      <div className="filter-bar">
        <div className={filterLoad !== "all" ? "filter-select-wrap filter-select-wrap--active" : "filter-select-wrap"}>
          <select
            className={filterSelectClass}
            value={filterLoad}
            onChange={(e) => setFilterLoad(e.target.value)}
          >
            <option value="all">All cognitive loads</option>
            {Object.entries(loadLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className={filterPriority !== "all" ? "filter-select-wrap filter-select-wrap--active" : "filter-select-wrap"}>
          <select
            className={filterSelectClass}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All priorities</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className={filterContext !== "all" ? "filter-select-wrap filter-select-wrap--active" : "filter-select-wrap"}>
          <select
            className={filterSelectClass}
            value={filterContext}
            onChange={(e) => setFilterContext(e.target.value)}
          >
            <option value="all">All contexts</option>
            {contextOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="filter-bar__status">
          <span className="filter-bar__active-label">Filters active</span>
          <button
            type="button"
            className="filter-bar__reset"
            onClick={onResetFilters}
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}

export default FilterBar;