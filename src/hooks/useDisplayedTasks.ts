import { useState, useEffect, useCallback } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { useFilterStore } from "../store/useFilterStore";
import { useUIStore } from "../store/useUIStore";
import { useMomentumStore } from "../store/useMomentumStore";
import { getVisibleTasks } from "../utils/taskView";
import { getMomentumTasks, getRunwayNeedsFallback } from "../utils/momentum";

const COMPLETED_PAGE_SIZE = 20;

export function useDisplayedTasks() {
  const { tasks } = useTaskStore();
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

  // ── All tasks passing filter/sort/snooze rules ────────────────────────────
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

  // ── Split active from completed ───────────────────────────────────────────
  // Momentum mode and focus mode apply only to active (non-done) tasks.
  // Completed tasks are handled separately with pagination below.
  const activeVisibleTasks = visibleTasks.filter((t) => !t.done);
  const allCompletedTasks = showCompleted ? visibleTasks.filter((t) => t.done) : [];

  // ── Momentum / focus mode (active tasks only) ─────────────────────────────
  const activeTasks =
    momentumModeEnabled && momentumRunActive
      ? getMomentumTasks({
          tasks: activeVisibleTasks,
          keystoneTaskId,
          energy: momentumEnergy,
          allowCrossContextRunway,
        })
      : activeVisibleTasks;

  const displayedActiveTasks =
    focusModeEnabled || (momentumModeEnabled && momentumRunActive)
      ? activeTasks.slice(0, 7)
      : activeTasks;

  // ── Completed task pagination ─────────────────────────────────────────────
  const [completedTaskLimit, setCompletedTaskLimit] = useState(COMPLETED_PAGE_SIZE);

  // Reset the limit whenever the toggle goes off so the next open starts fresh.
  useEffect(() => {
    if (!showCompleted) {
      setCompletedTaskLimit(COMPLETED_PAGE_SIZE);
    }
  }, [showCompleted]);

  const loadMoreCompleted = useCallback(() => {
    setCompletedTaskLimit((prev) => prev + COMPLETED_PAGE_SIZE);
  }, []);

  const displayedCompletedTasks = allCompletedTasks.slice(0, completedTaskLimit);

  // ── Final displayed list ──────────────────────────────────────────────────
  const displayedTasks = [...displayedActiveTasks, ...displayedCompletedTasks];

  // ── Counts (focus-mode counts active tasks only — completed are separate) ─
  const totalVisibleCount = activeTasks.length;
  const displayedCount = displayedActiveTasks.length;

  const momentumNeedsFallback =
    momentumModeEnabled &&
    keystoneTaskId &&
    getRunwayNeedsFallback(activeVisibleTasks, keystoneTaskId);

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
    // ── Completed pagination ────────────────────────────────────────────────
    completedTotal: allCompletedTasks.length,
    displayedCompletedCount: displayedCompletedTasks.length,
    hasMoreCompleted: displayedCompletedTasks.length < allCompletedTasks.length,
    loadMoreCompleted,
  };
}