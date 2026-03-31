import { useRef, useEffect } from 'react';
import '../styles/filter-bar.css';
import { LOAD_LABELS, PRIORITY_LABELS } from '../constants/TaskOptions';
import { useFilterStore } from '../store/useFilterStore';
import { useUIStore } from '../store/useUIStore';

interface FilterBarProps {
  contextOptions: string[];
  snoozedCount: number;
}

function FilterBar({ contextOptions, snoozedCount }: FilterBarProps) {
  const {
    filterLoad, filterPriority, filterContext,
    showCompleted, showSnoozedTasks, filtersExpanded,
    focusModeEnabled,
    setFilterLoad, setFilterPriority, setFilterContext,
    setShowCompleted, setShowSnoozedTasks,
    setFocusModeEnabled, resetFilters, toggleFiltersExpanded,
  } = useFilterStore();

  const { advancedFeaturesEnabled } = useUIStore();

  const activeFilterCount =
    (filterLoad !== 'all' ? 1 : 0) +
    (filterPriority !== 'all' ? 1 : 0) +
    (filterContext !== 'all' ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.maxHeight = filtersExpanded ? el.scrollHeight + 'px' : '0px';
  }, [filtersExpanded, advancedFeaturesEnabled, showCompleted, snoozedCount]);

  return (
    <div className={`filter-bar-wrapper${hasActiveFilters ? ' filter-bar-wrapper--active' : ''}`}>
      <button
        type="button"
        className={`filter-bar__header${hasActiveFilters ? ' filter-bar__header--active' : ''}`}
        onClick={toggleFiltersExpanded}
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
                onClick={(e) => { e.stopPropagation(); resetFilters(); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); resetFilters(); } }}
              >
                reset filters
              </span>
            </>
          ) : (
            <span className="filter-bar__no-filters">No filters active</span>
          )}
          <span className={`filter-bar__caret${filtersExpanded ? ' filter-bar__caret--open' : ''}`} aria-hidden="true">›</span>
        </span>
      </button>

      <div ref={contentRef} className="filter-bar__content" aria-hidden={!filtersExpanded}>
        <div className="filter-bar__inner">
          <div className="filter-bar__selects">
            <div className={filterLoad !== 'all' ? 'filter-select-wrap filter-select-wrap--active' : 'filter-select-wrap'}>
              <select className="filter-select" value={filterLoad} onChange={(e) => setFilterLoad(e.target.value as typeof filterLoad)} aria-label="Filter by cognitive load" tabIndex={filtersExpanded ? 0 : -1}>
                <option value="all">All cognitive loads</option>
                {Object.entries(LOAD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className={filterPriority !== 'all' ? 'filter-select-wrap filter-select-wrap--active' : 'filter-select-wrap'}>
              <select className="filter-select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as typeof filterPriority)} aria-label="Filter by priority" tabIndex={filtersExpanded ? 0 : -1}>
                <option value="all">All priorities</option>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className={filterContext !== 'all' ? 'filter-select-wrap filter-select-wrap--active' : 'filter-select-wrap'}>
              <select className="filter-select" value={filterContext} onChange={(e) => setFilterContext(e.target.value)} aria-label="Filter by context" tabIndex={filtersExpanded ? 0 : -1}>
                <option value="all">All contexts</option>
                {contextOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-bar__toggles">
            {advancedFeaturesEnabled && (
              <label className="toggle">
                <span className="toggle__label">View Snoozed Tasks</span>
                <input type="checkbox" checked={showSnoozedTasks} onChange={(e) => setShowSnoozedTasks(e.target.checked)} tabIndex={filtersExpanded ? 0 : -1} />
                <span className="toggle__track" aria-hidden="true">
                  <span className="toggle__state toggle__state--off">OFF</span>
                  <span className="toggle__state toggle__state--on">ON</span>
                  <span className="toggle__thumb" />
                </span>
              </label>
            )}
            {snoozedCount > 0 && (
              <p className="filter-bar__snooze-hint">{snoozedCount} task{snoozedCount !== 1 ? 's' : ''} currently snoozed</p>
            )}
            {advancedFeaturesEnabled && (
              <label className="toggle">
                <span className="toggle__label">Focus Mode (show only 7 tasks)</span>
                <input type="checkbox" checked={focusModeEnabled} onChange={(e) => setFocusModeEnabled(e.target.checked)} tabIndex={filtersExpanded ? 0 : -1} />
                <span className="toggle__track" aria-hidden="true">
                  <span className="toggle__state toggle__state--off">OFF</span>
                  <span className="toggle__state toggle__state--on">ON</span>
                  <span className="toggle__thumb" />
                </span>
              </label>
            )}
            <label className="toggle">
              <span className="toggle__label">Show completed tasks</span>
              <input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} tabIndex={filtersExpanded ? 0 : -1} />
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