import { describe, it, expect } from 'vitest';
import { splitTasks, paginateCompleted, COMPLETED_PAGE_SIZE } from '../hooks/useDisplayedTasks';
import { getVisibleTasks } from '../utils/taskView';
import { Task } from '../types';

const makeTask = (overrides: Partial<Task>): Task => ({
  id: crypto.randomUUID(),
  title: 'Test task',
  load: 'medium',
  priority: 'medium',
  context: 'general',
  done: false,
  createdAt: Date.now(),
  snoozedUntil: null,
  position: 0,
  ...overrides,
});

const baseParams = {
  advancedFeaturesEnabled: false,
  showSnoozedTasks: false,
  showCompleted: true,
  filterLoad: 'all' as const,
  filterPriority: 'all' as const,
  filterContext: 'all' as const,
  viewMode: 'custom' as const,
  sortBy: 'load' as const,
  sortDirection: 'asc' as const,
};

describe('active / completed task separation', () => {
  it('active tasks contain only non-done tasks', () => {
    const tasks = [makeTask({ id: 'a1' }), makeTask({ id: 'a2' }), makeTask({ id: 'd1', done: true })];
    const { activeVisibleTasks } = splitTasks(tasks, true);
    expect(activeVisibleTasks).toHaveLength(2);
    expect(activeVisibleTasks.every((t) => !t.done)).toBe(true);
  });

  it('completed tasks contain only done tasks', () => {
    const tasks = [makeTask({ id: 'a1' }), makeTask({ id: 'd1', done: true }), makeTask({ id: 'd2', done: true })];
    const { allCompletedTasks } = splitTasks(tasks, true);
    expect(allCompletedTasks).toHaveLength(2);
    expect(allCompletedTasks.every((t) => t.done)).toBe(true);
  });

  it('returns empty completed list when showCompleted is false', () => {
    const tasks = [makeTask({ id: 'a1' }), makeTask({ id: 'd1', done: true })];
    const { allCompletedTasks } = splitTasks(tasks, false);
    expect(allCompletedTasks).toHaveLength(0);
  });

  it('active tasks are unaffected by showCompleted toggle', () => {
    const tasks = [makeTask({ id: 'a1' }), makeTask({ id: 'a2' }), makeTask({ id: 'd1', done: true })];
    const withCompleted = splitTasks(tasks, true).activeVisibleTasks;
    const withoutCompleted = splitTasks(tasks, false).activeVisibleTasks;
    expect(withCompleted.map((t) => t.id)).toEqual(withoutCompleted.map((t) => t.id));
  });

  it('returns empty active list when all tasks are done', () => {
    const tasks = [makeTask({ id: 'd1', done: true }), makeTask({ id: 'd2', done: true })];
    const { activeVisibleTasks } = splitTasks(tasks, true);
    expect(activeVisibleTasks).toHaveLength(0);
  });

  it('returns empty completed list when no tasks are done', () => {
    const tasks = [makeTask({ id: 'a1' }), makeTask({ id: 'a2' })];
    const { allCompletedTasks } = splitTasks(tasks, true);
    expect(allCompletedTasks).toHaveLength(0);
  });

  it('handles empty task array gracefully', () => {
    const { activeVisibleTasks, allCompletedTasks } = splitTasks([], true);
    expect(activeVisibleTasks).toHaveLength(0);
    expect(allCompletedTasks).toHaveLength(0);
  });
});

describe('completed task pagination', () => {
  it('returns all completed tasks when count is below page size', () => {
    const COUNT = COMPLETED_PAGE_SIZE - 1;
    const completed = Array.from({ length: COUNT }, (_, i) => makeTask({ id: `d${i}`, done: true }));
    const { displayedCompletedTasks, completedTotal } = paginateCompleted(completed, COMPLETED_PAGE_SIZE);
    expect(displayedCompletedTasks).toHaveLength(COUNT);
    expect(completedTotal).toBe(COUNT);
  });

  it('slices to limit when completed count exceeds page size', () => {
    const completed = Array.from({ length: COMPLETED_PAGE_SIZE + 5 }, (_, i) => makeTask({ id: `d${i}`, done: true }));
    const { displayedCompletedTasks } = paginateCompleted(completed, COMPLETED_PAGE_SIZE);
    expect(displayedCompletedTasks).toHaveLength(COMPLETED_PAGE_SIZE);
  });

  it('hasMoreCompleted is true when list is truncated', () => {
    const completed = Array.from({ length: COMPLETED_PAGE_SIZE + 5 }, (_, i) => makeTask({ id: `d${i}`, done: true }));
    const { hasMoreCompleted } = paginateCompleted(completed, COMPLETED_PAGE_SIZE);
    expect(hasMoreCompleted).toBe(true);
  });

  it('hasMoreCompleted is false when all completed tasks fit within limit', () => {
    const completed = Array.from({ length: COMPLETED_PAGE_SIZE - 1 }, (_, i) => makeTask({ id: `d${i}`, done: true }));
    const { hasMoreCompleted } = paginateCompleted(completed, COMPLETED_PAGE_SIZE);
    expect(hasMoreCompleted).toBe(false);
  });

  it('hasMoreCompleted is false when count exactly equals limit', () => {
    const completed = Array.from({ length: COMPLETED_PAGE_SIZE }, (_, i) => makeTask({ id: `d${i}`, done: true }));
    const { hasMoreCompleted } = paginateCompleted(completed, COMPLETED_PAGE_SIZE);
    expect(hasMoreCompleted).toBe(false);
  });

  it('completedTotal reflects full count regardless of limit', () => {
    const COUNT = COMPLETED_PAGE_SIZE + 27;
    const completed = Array.from({ length: COUNT }, (_, i) => makeTask({ id: `d${i}`, done: true }));
    const { completedTotal } = paginateCompleted(completed, COMPLETED_PAGE_SIZE);
    expect(completedTotal).toBe(COUNT);
  });

  it('displayedCompletedCount matches sliced length', () => {
    const completed = Array.from({ length: COMPLETED_PAGE_SIZE + 15 }, (_, i) => makeTask({ id: `d${i}`, done: true }));
    const { displayedCompletedCount, displayedCompletedTasks } = paginateCompleted(completed, COMPLETED_PAGE_SIZE);
    expect(displayedCompletedCount).toBe(displayedCompletedTasks.length);
    expect(displayedCompletedCount).toBe(COMPLETED_PAGE_SIZE);
  });

  it('extending the limit exposes the next batch', () => {
    const COUNT = COMPLETED_PAGE_SIZE + 15;
    const completed = Array.from({ length: COUNT }, (_, i) => makeTask({ id: `d${i}`, done: true }));
    const first = paginateCompleted(completed, COMPLETED_PAGE_SIZE);
    expect(first.displayedCompletedCount).toBe(COMPLETED_PAGE_SIZE);
    expect(first.hasMoreCompleted).toBe(true);

    const second = paginateCompleted(completed, COUNT);
    expect(second.displayedCompletedCount).toBe(COUNT);
    expect(second.hasMoreCompleted).toBe(false);
  });

  it('returns zero counts when there are no completed tasks', () => {
    const { completedTotal, displayedCompletedCount, hasMoreCompleted } = paginateCompleted([], COMPLETED_PAGE_SIZE);
    expect(completedTotal).toBe(0);
    expect(displayedCompletedCount).toBe(0);
    expect(hasMoreCompleted).toBe(false);
  });
});

describe('"Showing X of Y completed tasks" indicator', () => {
  it('is visible when list is truncated', () => {
    const completed = Array.from({ length: COMPLETED_PAGE_SIZE + 5 }, (_, i) => makeTask({ id: `d${i}`, done: true }));
    const { displayedCompletedCount, completedTotal } = paginateCompleted(completed, COMPLETED_PAGE_SIZE);
    expect(displayedCompletedCount < completedTotal).toBe(true);
  });

  it('is hidden when all completed tasks are visible', () => {
    const completed = Array.from({ length: COMPLETED_PAGE_SIZE - 1 }, (_, i) => makeTask({ id: `d${i}`, done: true }));
    const { displayedCompletedCount, completedTotal } = paginateCompleted(completed, COMPLETED_PAGE_SIZE);
    expect(displayedCompletedCount < completedTotal).toBe(false);
  });

  it('reports correct X and Y values when truncated', () => {
    const COUNT = COMPLETED_PAGE_SIZE + 27;
    const completed = Array.from({ length: COUNT }, (_, i) => makeTask({ id: `d${i}`, done: true }));
    const { displayedCompletedCount, completedTotal } = paginateCompleted(completed, COMPLETED_PAGE_SIZE);
    expect(displayedCompletedCount).toBe(COMPLETED_PAGE_SIZE);
    expect(completedTotal).toBe(COUNT);
  });

  it('is hidden after loading all pages', () => {
    const COUNT = COMPLETED_PAGE_SIZE + 15;
    const completed = Array.from({ length: COUNT }, (_, i) => makeTask({ id: `d${i}`, done: true }));
    const { displayedCompletedCount, completedTotal } = paginateCompleted(completed, COUNT);
    expect(displayedCompletedCount < completedTotal).toBe(false);
  });
});

describe('active task behaviour with completed tasks present', () => {
  it('active tasks still pass through getVisibleTasks filters correctly', () => {
    const tasks = [
      makeTask({ id: 'active-work', context: 'work' }),
      makeTask({ id: 'active-home', context: 'home' }),
      makeTask({ id: 'done-work', done: true, context: 'work' }),
      makeTask({ id: 'done-home', done: true, context: 'home' }),
    ];
    const visible = getVisibleTasks({ ...baseParams, tasks, filterContext: 'work' });
    const { activeVisibleTasks, allCompletedTasks } = splitTasks(visible, true);
    expect(activeVisibleTasks.map((t) => t.id)).toEqual(['active-work']);
    expect(allCompletedTasks.map((t) => t.id)).toEqual(['done-work']);
  });

  it('active task count is not inflated by completed tasks', () => {
    const tasks = [
      makeTask({ id: 'a1' }), makeTask({ id: 'a2' }), makeTask({ id: 'a3' }),
      makeTask({ id: 'd1', done: true }), makeTask({ id: 'd2', done: true }),
    ];
    const visible = getVisibleTasks({ ...baseParams, tasks });
    const { activeVisibleTasks } = splitTasks(visible, true);
    expect(activeVisibleTasks).toHaveLength(3);
  });

  it('focus mode slice of 7 applies only to active tasks, not completed', () => {
    const COMPLETED_COUNT = COMPLETED_PAGE_SIZE - 1;
    const tasks = [
      ...Array.from({ length: 10 }, (_, i) => makeTask({ id: `active-${i}` })),
      ...Array.from({ length: COMPLETED_COUNT }, (_, i) => makeTask({ id: `done-${i}`, done: true })),
    ];
    const visible = getVisibleTasks({ ...baseParams, tasks });
    const { activeVisibleTasks, allCompletedTasks } = splitTasks(visible, true);
    const focusSliced = activeVisibleTasks.slice(0, 7);
    const { displayedCompletedTasks } = paginateCompleted(allCompletedTasks, COMPLETED_PAGE_SIZE);
    // focus mode caps active at 7; all completed fit within one page so all show
    expect(focusSliced).toHaveLength(7);
    expect(displayedCompletedTasks).toHaveLength(COMPLETED_COUNT);
    expect([...focusSliced, ...displayedCompletedTasks]).toHaveLength(7 + COMPLETED_COUNT);
  });

  it('completed tasks do not appear when showCompleted is false, active tasks do', () => {
    const tasks = [makeTask({ id: 'a1' }), makeTask({ id: 'a2' }), makeTask({ id: 'd1', done: true })];
    const visible = getVisibleTasks({ ...baseParams, tasks, showCompleted: false });
    const { activeVisibleTasks, allCompletedTasks } = splitTasks(visible, false);
    expect(activeVisibleTasks).toHaveLength(2);
    expect(allCompletedTasks).toHaveLength(0);
    expect([...activeVisibleTasks, ...allCompletedTasks].some((t) => t.done)).toBe(false);
  });
});