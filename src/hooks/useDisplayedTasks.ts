import { useTaskStore } from "../store/useTaskStore";
import { useFilterStore } from "../store/useFilterStore";
import { useUIStore } from "../store/useUIStore";
import { useMomentumStore } from "../store/useMomentumStore";
import { getVisibleTasks } from "../utils/taskView";
import { getMomentumTasks, getRunwayNeedsFallback } from "../utils/momentum";

export function useDisplayedTasks() {
  const { tasks, customContexts } = useTaskStore();
  const {
    filterLoad, filterPriority, filterContext,
    showCompleted, showSnoozedTasks,
    viewMode, sortBy, sortDirection, focusModeEnabled,
  } = useFilterStore();
  const { advancedFeaturesEnabled } = useUIStore();
  const {
    momentumModeEnabled, momentumRunActive, momentumEnergy,
    keystoneTaskId, allowCrossContextRunway,
  } = useMomentumStore();

  const visibleTasks = getVisibleTasks({
    tasks,
    advancedFeaturesEnabled,
    showSnoozedTasks,
    showCompleted,
    filterLoad,
    filterPriority,
    filterContext,
    viewMode,
    sortBy,
    sortDirection,
  });

  const activeTasks =
    momentumModeEnabled && momentumRunActive
      ? getMomentumTasks({
          tasks: visibleTasks,
          keystoneTaskId,
          energy: momentumEnergy,
          allowCrossContextRunway,
        })
      : visibleTasks;

  const displayedTasks =
    focusModeEnabled || (momentumModeEnabled && momentumRunActive)
      ? activeTasks.slice(0, 7)
      : activeTasks;

  const totalVisibleCount = activeTasks.length;
  const displayedCount = displayedTasks.length;

  const momentumNeedsFallback =
    momentumModeEnabled &&
    keystoneTaskId &&
    getRunwayNeedsFallback(visibleTasks, keystoneTaskId);

  const now = Date.now();
  const hasActiveFilters =
    filterLoad !== "all" || filterPriority !== "all" || filterContext !== "all";
  const activeFilterCount =
    (filterLoad !== "all" ? 1 : 0) +
    (filterPriority !== "all" ? 1 : 0) +
    (filterContext !== "all" ? 1 : 0);

  const nonDoneTasks = tasks.filter((t) => !t.done);
  const snoozedNonDoneTasks = advancedFeaturesEnabled
    ? nonDoneTasks.filter((t) => t.snoozedUntil && t.snoozedUntil > now)
    : [];
  const snoozedCount = snoozedNonDoneTasks.length;
  const showEmptyState = displayedTasks.length === 0;
  const allDone = nonDoneTasks.length === 0 && tasks.length > 0;
  const noTasksAtAll = tasks.length === 0;

  return {
    visibleTasks,
    activeTasks,
    displayedTasks,
    totalVisibleCount,
    displayedCount,
    momentumNeedsFallback,
    showEmptyState,
    noTasksAtAll,
    allDone,
    hasActiveFilters,
    activeFilterCount,
    snoozedCount,
  };
}