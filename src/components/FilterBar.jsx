import { useRef, useEffect } from 'react';
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
  filtersExpanded,
  onToggleFilters,
  showCompleted,
  setShowCompleted,
  advancedFeaturesEnabled,
  showSnoozedTasks,
  setShowSnoozedTasks,
  focusModeEnabled,
  setFocusModeEnabled,
  snoozedCount,
}) {
  const activeFilterCount =
    (filterLoad !== 'all' ? 1 : 0) +
    (filterPriority !== 'all' ? 1 : 0) +
    (filterContext !== 'all' ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;
  const contentRef = useRef(null);

  // Animate height on expand/collapse
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (filtersExpanded) {
      el.style.maxHeight = el.scrollHeight + 'px';
    } else {
      el.style.maxHeight = '0px';
    }
  }, [filtersExpanded, advancedFeaturesEnabled, showCompleted]);

  return (
    <div className={`filter-bar-wrapper${hasActiveFilters ? ' filter-bar-wrapper--active' : ''}`}>

      {/* ── Header bar (always visible) ── */}
      <button
        type="button"
        className={`filter-bar__header${hasActiveFilters ? ' filter-bar__header--active' : ''}`}
        onClick={onToggleFilters}
        aria-expanded={filtersExpanded}
      >
        <span className="filter-bar__header-label">Filters</span>

        <span className="filter-bar__header-right">
          {hasActiveFilters ? (
            <>
              <span className="filter-bar__count">{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</span>
              <span
                className="filter-bar__reset-inline"
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); onResetFilters(); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onResetFilters(); }}}
              >
                reset filters
              </span>
            </>
          ) : (
            <span className="filter-bar__no-filters">No filters active</span>
          )}
          <span className={`filter-bar__caret${filtersExpanded ? ' filter-bar__caret--open' : ''}`} aria-hidden="true">
            ›
          </span>
        </span>
      </button>

      {/* ── Collapsible content ── */}
      <div
        ref={contentRef}
        className="filter-bar__content"
        aria-hidden={!filtersExpanded}
      >
        <div className="filter-bar__inner">

          {/* Filter dropdowns */}
          <div className="filter-bar__selects">
            <div className={filterLoad !== 'all' ? 'filter-select-wrap filter-select-wrap--active' : 'filter-select-wrap'}>
              <select
                className="filter-select"
                value={filterLoad}
                onChange={(e) => setFilterLoad(e.target.value)}
                aria-label="Filter by cognitive load"
                tabIndex={filtersExpanded ? 0 : -1}
              >
                <option value="all">All cognitive loads</option>
                {Object.entries(loadLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className={filterPriority !== 'all' ? 'filter-select-wrap filter-select-wrap--active' : 'filter-select-wrap'}>
              <select
                className="filter-select"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                aria-label="Filter by priority"
                tabIndex={filtersExpanded ? 0 : -1}
              >
                <option value="all">All priorities</option>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className={filterContext !== 'all' ? 'filter-select-wrap filter-select-wrap--active' : 'filter-select-wrap'}>
              <select
                className="filter-select"
                value={filterContext}
                onChange={(e) => setFilterContext(e.target.value)}
                aria-label="Filter by context"
                tabIndex={filtersExpanded ? 0 : -1}
              >
                <option value="all">All contexts</option>
                {contextOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="filter-bar__toggles">
            {/* Advanced toggles */}
            {advancedFeaturesEnabled && (<label className="toggle toggle--sm">
                <span className="toggle__label">View Snoozed Tasks</span>
                <input
                  type="checkbox"
                  checked={showSnoozedTasks}
                  onChange={(e) => setShowSnoozedTasks(e.target.checked)}
                  tabIndex={filtersExpanded ? 0 : -1}
                />
                <span className="toggle__track" aria-hidden="true">
                  <span className="toggle__state toggle__state--off">OFF</span>
                  <span className="toggle__state toggle__state--on">ON</span>
                  <span className="toggle__thumb" />
                </span>
              </label>)}

              {snoozedCount > 0 && (
                <p className="filter-bar__snooze-hint">
                  {snoozedCount} task{snoozedCount !== 1 ? "s" : ""} currently snoozed
                </p>
              )}

              {advancedFeaturesEnabled && (<label className="toggle toggle--sm">
                <span className="toggle__label">Focus Mode (show only 7 tasks)</span>
                <input
                  type="checkbox"
                  checked={focusModeEnabled}
                  onChange={(e) => setFocusModeEnabled(e.target.checked)}
                  tabIndex={filtersExpanded ? 0 : -1}
                />
                <span className="toggle__track" aria-hidden="true">
                  <span className="toggle__state toggle__state--off">OFF</span>
                  <span className="toggle__state toggle__state--on">ON</span>
                  <span className="toggle__thumb" />
                </span>
              </label>

          )}

          {/* Show completed toggle — always visible */}
            <label className="toggle toggle--sm">
              <span className="toggle__label">Show completed tasks</span>
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                tabIndex={filtersExpanded ? 0 : -1}
              />
              <span className="toggle__track" aria-hidden="true">
                <span className="toggle__state toggle__state--off">OFF</span>
                <span className="toggle__state toggle__state--on">ON</span>
                <span className="toggle__thumb" />
              </span>
            </label>
          </div>
        </div>
        </div>
      </div>
  );
}

export default FilterBar;