import {
  LOAD_RANK,
  PRIORITY_RANK,
} from "../constants/TaskRanks";

export function getVisibleTasks({
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
}) {
  const now = Date.now();

  let visibleTasks = tasks.filter((task) => {
    // Snooze filtering only applies in Advanced Mode
    if (advancedFeaturesEnabled) {
      const isSnoozed = task.snoozedUntil && task.snoozedUntil > now;
      if (!showSnoozedTasks && isSnoozed) return false;
    }

    if (!showCompleted && task.done) return false;
    if (filterLoad !== "all" && task.load !== filterLoad) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    if (filterContext !== "all" && task.context !== filterContext) return false;

    return true;
  });

  if (viewMode === "sorted") {
    visibleTasks = [...visibleTasks].sort((a, b) => {
      const rankMap = sortBy === "load" ? LOAD_RANK : PRIORITY_RANK;

      const aRank = rankMap[a[sortBy] ?? "medium"];
      const bRank = rankMap[b[sortBy] ?? "medium"];

      if (aRank !== bRank) {
        return sortDirection === "asc" ? aRank - bRank : bRank - aRank;
      }

      return (a.position ?? 0) - (b.position ?? 0);
    });
  }

  return visibleTasks;
}

 export function normalizeTaskPositions(tasks) {
    // Make sure tasks persist in the same order, not loaded randomly
    return tasks.map((task, index) => ({
      ...task,
      position: index,
    }));
  }

// Helper to avoid filtered, completed, or snoozed tasks from interfering with reordering tasks
export  function reorderByVisibleSwap(allTasks, visibleTasks, taskId, direction) {
    const visibleIndex = visibleTasks.findIndex((task) => task.id === taskId);
    if (visibleIndex === -1) return allTasks;
  
    const targetIndex =
      direction === "up" ? visibleIndex - 1 : visibleIndex + 1;
  
    if (targetIndex < 0 || targetIndex >= visibleTasks.length) {
      return allTasks;
    }
  
    const currentVisibleTask = visibleTasks[visibleIndex];
    const targetVisibleTask = visibleTasks[targetIndex];
  
    const updatedTasks = allTasks.map((task) => {
      if (task.id === currentVisibleTask.id) {
        return { ...task, position: targetVisibleTask.position };
      }
      if (task.id === targetVisibleTask.id) {
        return { ...task, position: currentVisibleTask.position };
      }
      return task;
    });
  
    return [...updatedTasks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }