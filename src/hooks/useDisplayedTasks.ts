import { useState, useEffect, useCallback } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { useFilterStore } from "../store/useFilterStore";
import { useUIStore } from "../store/useUIStore";
import { useMomentumStore } from "../store/useMomentumStore";
import { getVisibleTasks } from "../utils/taskView";
import { getMomentumTasks, getRunwayNeedsFallback } from "../utils/momentum";
import { Task } from "../types";

export const COMPLETED_PAGE_SIZE = 10;

// ── Pure helpers (exported for testing) ──────────────────────────────────────

export function splitTasks(visibleTasks: Task[], showCompleted: boolean) {
  return {
    activeVisibleTasks: visibleTasks.filter((t) => !t.done),
    allCompletedTasks: showCompleted ? visibleTasks.filter((t) => t.done) : [],
  };
}

export function paginateCompleted(allCompletedTasks: Task[], limit: number) {
  const displayedCompletedTasks = allCompletedTasks.slice(0, limit);
  return {
    displayedCompletedTasks,
    completedTotal: allCompletedTasks.length,
    displayedCompletedCount: displayedCompletedTasks.length,
    hasMoreCompleted: displayedCompletedTasks.length < allCompletedTasks.length,
  };
}

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
  const { activeVisibleTasks, allCompletedTasks } = splitTasks(visibleTasks, showCompleted);

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

  const { displayedCompletedTasks, completedTotal, displayedCompletedCount, hasMoreCompleted } =
    paginateCompleted(allCompletedTasks, completedTaskLimit);

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
    completedTotal,
    displayedCompletedCount,
    hasMoreCompleted,
    loadMoreCompleted,
  };
}