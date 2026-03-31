import { Task, LoadLevel, PriorityLevel, ViewMode, SortField, SortDirection } from '../types';
import { LOAD_RANK, PRIORITY_RANK } from '../constants/TaskRanks';

interface GetVisibleTasksParams {
  tasks: Task[];
  advancedFeaturesEnabled: boolean;
  showSnoozedTasks: boolean;
  showCompleted: boolean;
  filterLoad: LoadLevel | 'all';
  filterPriority: PriorityLevel | 'all';
  filterContext: string | 'all';
  viewMode: ViewMode;
  sortBy: SortField;
  sortDirection: SortDirection;
}

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
}: GetVisibleTasksParams): Task[] {
  const now = Date.now();

  let visibleTasks = tasks.filter((task) => {
    if (advancedFeaturesEnabled) {
      const isSnoozed = task.snoozedUntil && task.snoozedUntil > now;
      if (!showSnoozedTasks && isSnoozed) return false;
    }

    if (!showCompleted && task.done) return false;
    if (filterLoad !== 'all' && task.load !== filterLoad) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterContext !== 'all' && task.context !== filterContext) return false;

    return true;
  });

  if (viewMode === 'sorted') {
    const rankMap = sortBy === 'load' ? LOAD_RANK : PRIORITY_RANK;

    visibleTasks = [...visibleTasks].sort((a, b) => {
      const aRank = rankMap[a[sortBy] ?? 'medium'];
      const bRank = rankMap[b[sortBy] ?? 'medium'];

      if (aRank !== bRank) {
        return sortDirection === 'asc' ? aRank - bRank : bRank - aRank;
      }

      return (a.position ?? 0) - (b.position ?? 0);
    });
  }

  return visibleTasks;
}

export function normalizeTaskPositions(tasks: Task[]): Task[] {
  return tasks.map((task, index) => ({
    ...task,
    position: index,
  }));
}

export function reorderByVisibleSwap(
  allTasks: Task[],
  visibleTasks: Task[],
  taskId: string,
  direction: 'up' | 'down'
): Task[] {
  const visibleIndex = visibleTasks.findIndex((task) => task.id === taskId);
  if (visibleIndex === -1) return allTasks;

  const targetIndex = direction === 'up' ? visibleIndex - 1 : visibleIndex + 1;

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