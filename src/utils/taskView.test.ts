import { describe, it, expect } from 'vitest';
import { getVisibleTasks, normalizeTaskPositions, reorderByVisibleSwap } from './taskView';
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
  showCompleted: false,
  filterLoad: 'all' as const,
  filterPriority: 'all' as const,
  filterContext: 'all' as const,
  viewMode: 'custom' as const,
  sortBy: 'load' as const,
  sortDirection: 'asc' as const,
};

// ── getVisibleTasks ────────────────────────────────────────────────────────

describe('getVisibleTasks', () => {
  it('returns all tasks when no filters active', () => {
    const tasks = [makeTask({ id: 'a' }), makeTask({ id: 'b' })];
    expect(getVisibleTasks({ ...baseParams, tasks })).toHaveLength(2);
  });

  it('hides completed tasks by default', () => {
    const tasks = [
      makeTask({ id: 'active' }),
      makeTask({ id: 'done', done: true }),
    ];
    expect(getVisibleTasks({ ...baseParams, tasks })).toHaveLength(1);
    expect(getVisibleTasks({ ...baseParams, tasks })[0].id).toBe('active');
  });

  it('shows completed tasks when showCompleted is true', () => {
    const tasks = [
      makeTask({ id: 'active' }),
      makeTask({ id: 'done', done: true }),
    ];
    expect(getVisibleTasks({ ...baseParams, tasks, showCompleted: true })).toHaveLength(2);
  });

  it('filters by load', () => {
    const tasks = [
      makeTask({ id: 'low', load: 'low' }),
      makeTask({ id: 'high', load: 'high' }),
    ];
    const result = getVisibleTasks({ ...baseParams, tasks, filterLoad: 'low' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('low');
  });

  it('filters by priority', () => {
    const tasks = [
      makeTask({ id: 'low', priority: 'low' }),
      makeTask({ id: 'high', priority: 'high' }),
    ];
    const result = getVisibleTasks({ ...baseParams, tasks, filterPriority: 'high' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('high');
  });

  it('filters by context', () => {
    const tasks = [
      makeTask({ id: 'work', context: 'work' }),
      makeTask({ id: 'home', context: 'home' }),
    ];
    const result = getVisibleTasks({ ...baseParams, tasks, filterContext: 'work' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('work');
  });

  it('hides snoozed tasks in advanced mode when showSnoozedTasks is false', () => {
    const tasks = [
      makeTask({ id: 'normal' }),
      makeTask({ id: 'snoozed', snoozedUntil: Date.now() + 100000 }),
    ];
    const result = getVisibleTasks({
      ...baseParams,
      tasks,
      advancedFeaturesEnabled: true,
      showSnoozedTasks: false,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('normal');
  });

  it('shows snoozed tasks when showSnoozedTasks is true', () => {
    const tasks = [
      makeTask({ id: 'normal' }),
      makeTask({ id: 'snoozed', snoozedUntil: Date.now() + 100000 }),
    ];
    const result = getVisibleTasks({
      ...baseParams,
      tasks,
      advancedFeaturesEnabled: true,
      showSnoozedTasks: true,
    });
    expect(result).toHaveLength(2);
  });

  it('does not hide snoozed tasks when advanced mode is off', () => {
    const tasks = [
      makeTask({ id: 'normal' }),
      makeTask({ id: 'snoozed', snoozedUntil: Date.now() + 100000 }),
    ];
    const result = getVisibleTasks({
      ...baseParams,
      tasks,
      advancedFeaturesEnabled: false,
    });
    expect(result).toHaveLength(2);
  });

  it('sorts by load ascending in sorted mode', () => {
    const tasks = [
      makeTask({ id: 'high', load: 'high', position: 0 }),
      makeTask({ id: 'low', load: 'low', position: 1 }),
      makeTask({ id: 'medium', load: 'medium', position: 2 }),
    ];
    const result = getVisibleTasks({
      ...baseParams,
      tasks,
      viewMode: 'sorted',
      sortBy: 'load',
      sortDirection: 'asc',
    });
    expect(result.map(t => t.id)).toEqual(['low', 'medium', 'high']);
  });

  it('sorts by load descending in sorted mode', () => {
    const tasks = [
      makeTask({ id: 'low', load: 'low', position: 0 }),
      makeTask({ id: 'high', load: 'high', position: 1 }),
      makeTask({ id: 'medium', load: 'medium', position: 2 }),
    ];
    const result = getVisibleTasks({
      ...baseParams,
      tasks,
      viewMode: 'sorted',
      sortBy: 'load',
      sortDirection: 'desc',
    });
    expect(result.map(t => t.id)).toEqual(['high', 'medium', 'low']);
  });

  it('sorts by priority ascending in sorted mode', () => {
    const tasks = [
      makeTask({ id: 'high', priority: 'high', position: 0 }),
      makeTask({ id: 'low', priority: 'low', position: 1 }),
      makeTask({ id: 'medium', priority: 'medium', position: 2 }),
    ];
    const result = getVisibleTasks({
      ...baseParams,
      tasks,
      viewMode: 'sorted',
      sortBy: 'priority',
      sortDirection: 'asc',
    });
    expect(result.map(t => t.id)).toEqual(['low', 'medium', 'high']);
  });

  it('uses position as tiebreaker when sort ranks are equal', () => {
    const tasks = [
      makeTask({ id: 'second', load: 'medium', position: 1 }),
      makeTask({ id: 'first', load: 'medium', position: 0 }),
    ];
    const result = getVisibleTasks({
      ...baseParams,
      tasks,
      viewMode: 'sorted',
      sortBy: 'load',
      sortDirection: 'asc',
    });
    expect(result.map(t => t.id)).toEqual(['first', 'second']);
  });

  it('returns empty array when all tasks filtered out', () => {
    const tasks = [makeTask({ load: 'high' })];
    expect(getVisibleTasks({ ...baseParams, tasks, filterLoad: 'low' })).toHaveLength(0);
  });
});

// ── normalizeTaskPositions ─────────────────────────────────────────────────

describe('normalizeTaskPositions', () => {
  it('assigns sequential positions starting from 0', () => {
    const tasks = [
      makeTask({ id: 'a', position: 99 }),
      makeTask({ id: 'b', position: 50 }),
      makeTask({ id: 'c', position: 12 }),
    ];
    const result = normalizeTaskPositions(tasks);
    expect(result.map(t => t.position)).toEqual([0, 1, 2]);
  });

  it('preserves task order', () => {
    const tasks = [
      makeTask({ id: 'a' }),
      makeTask({ id: 'b' }),
      makeTask({ id: 'c' }),
    ];
    const result = normalizeTaskPositions(tasks);
    expect(result.map(t => t.id)).toEqual(['a', 'b', 'c']);
  });

  it('returns empty array for empty input', () => {
    expect(normalizeTaskPositions([])).toEqual([]);
  });

  it('does not mutate original tasks', () => {
    const tasks = [makeTask({ id: 'a', position: 5 })];
    normalizeTaskPositions(tasks);
    expect(tasks[0].position).toBe(5);
  });
});

// ── reorderByVisibleSwap ───────────────────────────────────────────────────

describe('reorderByVisibleSwap', () => {
  it('returns original array when taskId not found in visible tasks', () => {
    const tasks = [makeTask({ id: 'a', position: 0 })];
    const result = reorderByVisibleSwap(tasks, tasks, 'missing', 'up');
    expect(result).toBe(tasks);
  });

  it('returns original array when moving first task up', () => {
    const tasks = [
      makeTask({ id: 'a', position: 0 }),
      makeTask({ id: 'b', position: 1 }),
    ];
    const result = reorderByVisibleSwap(tasks, tasks, 'a', 'up');
    expect(result).toBe(tasks);
  });

  it('returns original array when moving last task down', () => {
    const tasks = [
      makeTask({ id: 'a', position: 0 }),
      makeTask({ id: 'b', position: 1 }),
    ];
    const result = reorderByVisibleSwap(tasks, tasks, 'b', 'down');
    expect(result).toBe(tasks);
  });

  it('swaps positions when moving task up', () => {
    const tasks = [
      makeTask({ id: 'a', position: 0 }),
      makeTask({ id: 'b', position: 1 }),
    ];
    const result = reorderByVisibleSwap(tasks, tasks, 'b', 'up');
    expect(result.find(t => t.id === 'b')?.position).toBe(0);
    expect(result.find(t => t.id === 'a')?.position).toBe(1);
  });

  it('swaps positions when moving task down', () => {
    const tasks = [
      makeTask({ id: 'a', position: 0 }),
      makeTask({ id: 'b', position: 1 }),
    ];
    const result = reorderByVisibleSwap(tasks, tasks, 'a', 'down');
    expect(result.find(t => t.id === 'a')?.position).toBe(1);
    expect(result.find(t => t.id === 'b')?.position).toBe(0);
  });

  it('returns tasks sorted by position after swap', () => {
    const tasks = [
      makeTask({ id: 'a', position: 0 }),
      makeTask({ id: 'b', position: 1 }),
      makeTask({ id: 'c', position: 2 }),
    ];
    const result = reorderByVisibleSwap(tasks, tasks, 'a', 'down');
    expect(result.map(t => t.id)).toEqual(['b', 'a', 'c']);
  });

  it('does not affect tasks outside the visible set', () => {
    const hidden = makeTask({ id: 'hidden', position: 0 });
    const visible1 = makeTask({ id: 'v1', position: 1 });
    const visible2 = makeTask({ id: 'v2', position: 2 });
    const allTasks = [hidden, visible1, visible2];
    const visibleTasks = [visible1, visible2];

    const result = reorderByVisibleSwap(allTasks, visibleTasks, 'v1', 'down');
    expect(result.find(t => t.id === 'hidden')?.position).toBe(0);
  });
});