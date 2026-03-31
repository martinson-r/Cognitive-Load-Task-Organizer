import { describe, it, expect } from 'vitest';
import {
  pickKeystoneForMe,
  getRunwayNeedsFallback,
  hasCrossContextLowerLoadOptions,
  getMomentumTasks,
} from './momentum';
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

// ── pickKeystoneForMe ──────────────────────────────────────────────────────

describe('pickKeystoneForMe', () => {
  it('returns null for empty input', () => {
    expect(pickKeystoneForMe([])).toBeNull();
  });

  it('prefers low load tasks over medium and high', () => {
    const tasks = [
      makeTask({ id: 'high', load: 'high', position: 0 }),
      makeTask({ id: 'medium', load: 'medium', position: 1 }),
      makeTask({ id: 'low', load: 'low', position: 2 }),
    ];
    expect(pickKeystoneForMe(tasks)?.id).toBe('low');
  });

  it('prefers high priority within the same load tier', () => {
    const tasks = [
      makeTask({ id: 'low-priority', load: 'low', priority: 'low', position: 0 }),
      makeTask({ id: 'high-priority', load: 'low', priority: 'high', position: 1 }),
      makeTask({ id: 'med-priority', load: 'low', priority: 'medium', position: 2 }),
    ];
    expect(pickKeystoneForMe(tasks)?.id).toBe('high-priority');
  });

  it('falls back to medium when no low tasks exist', () => {
    const tasks = [
      makeTask({ id: 'high', load: 'high', position: 0 }),
      makeTask({ id: 'medium', load: 'medium', position: 1 }),
    ];
    expect(pickKeystoneForMe(tasks)?.id).toBe('medium');
  });

  it('falls back to high when only high tasks exist', () => {
    const tasks = [makeTask({ id: 'high', load: 'high', position: 0 })];
    expect(pickKeystoneForMe(tasks)?.id).toBe('high');
  });
});

// ── getRunwayNeedsFallback ─────────────────────────────────────────────────

describe('getRunwayNeedsFallback', () => {
  it('returns false when no keystoneTaskId', () => {
    const tasks = [makeTask({ id: 'a', load: 'high' })];
    expect(getRunwayNeedsFallback(tasks, null)).toBe(false);
  });

  it('returns false when keystone is low load', () => {
    const tasks = [makeTask({ id: 'keystone', load: 'low' })];
    expect(getRunwayNeedsFallback(tasks, 'keystone')).toBe(false);
  });

  it('returns false when medium keystone has same-context low task', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'medium', context: 'work' }),
      makeTask({ id: 'runway', load: 'low', context: 'work' }),
    ];
    expect(getRunwayNeedsFallback(tasks, 'keystone')).toBe(false);
  });

  it('returns true when medium keystone has no same-context low tasks', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'medium', context: 'work' }),
      makeTask({ id: 'other', load: 'low', context: 'home' }),
    ];
    expect(getRunwayNeedsFallback(tasks, 'keystone')).toBe(true);
  });

  it('returns false when high keystone has same-context low task', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'high', context: 'work' }),
      makeTask({ id: 'runway', load: 'low', context: 'work' }),
    ];
    expect(getRunwayNeedsFallback(tasks, 'keystone')).toBe(false);
  });

  it('returns false when high keystone has same-context medium task', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'high', context: 'work' }),
      makeTask({ id: 'runway', load: 'medium', context: 'work' }),
    ];
    expect(getRunwayNeedsFallback(tasks, 'keystone')).toBe(false);
  });

  it('returns true when high keystone has no same-context low or medium tasks', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'high', context: 'work' }),
      makeTask({ id: 'other', load: 'low', context: 'home' }),
    ];
    expect(getRunwayNeedsFallback(tasks, 'keystone')).toBe(true);
  });
});

// ── hasCrossContextLowerLoadOptions ────────────────────────────────────────

describe('hasCrossContextLowerLoadOptions', () => {
  it('returns false when tasks is empty', () => {
    expect(hasCrossContextLowerLoadOptions([], 'keystone')).toBe(false);
  });

  it('returns false when keystoneTaskId is null', () => {
    const tasks = [makeTask({ id: 'a', load: 'high' })];
    expect(hasCrossContextLowerLoadOptions(tasks, null)).toBe(false);
  });

  it('returns false when keystone is low load', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'low', context: 'work' }),
      makeTask({ id: 'other', load: 'low', context: 'home' }),
    ];
    expect(hasCrossContextLowerLoadOptions(tasks, 'keystone')).toBe(false);
  });

  it('returns true when medium keystone has cross-context low task', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'medium', context: 'work' }),
      makeTask({ id: 'other', load: 'low', context: 'home' }),
    ];
    expect(hasCrossContextLowerLoadOptions(tasks, 'keystone')).toBe(true);
  });

  it('returns false when medium keystone has no cross-context low tasks', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'medium', context: 'work' }),
      makeTask({ id: 'other', load: 'medium', context: 'home' }),
    ];
    expect(hasCrossContextLowerLoadOptions(tasks, 'keystone')).toBe(false);
  });

  it('returns true when high keystone has cross-context low task', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'high', context: 'work' }),
      makeTask({ id: 'other', load: 'low', context: 'home' }),
    ];
    expect(hasCrossContextLowerLoadOptions(tasks, 'keystone')).toBe(true);
  });

  it('returns true when high keystone has cross-context medium task', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'high', context: 'work' }),
      makeTask({ id: 'other', load: 'medium', context: 'home' }),
    ];
    expect(hasCrossContextLowerLoadOptions(tasks, 'keystone')).toBe(true);
  });

  it('returns false when high keystone has no cross-context lower load tasks', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'high', context: 'work' }),
      makeTask({ id: 'other', load: 'high', context: 'home' }),
    ];
    expect(hasCrossContextLowerLoadOptions(tasks, 'keystone')).toBe(false);
  });
});

// ── getMomentumTasks ───────────────────────────────────────────────────────

describe('getMomentumTasks', () => {
  it('returns tasks unchanged when no keystoneTaskId', () => {
    const tasks = [makeTask({ id: 'a' }), makeTask({ id: 'b' })];
    expect(getMomentumTasks({ tasks, keystoneTaskId: null, energy: 'normal' })).toEqual(tasks);
  });

  it('returns tasks unchanged when no energy', () => {
    const tasks = [makeTask({ id: 'a' }), makeTask({ id: 'b' })];
    expect(getMomentumTasks({ tasks, keystoneTaskId: 'a', energy: '' })).toEqual(tasks);
  });

  it('returns tasks unchanged when keystoneTaskId not found', () => {
    const tasks = [makeTask({ id: 'a' }), makeTask({ id: 'b' })];
    expect(getMomentumTasks({ tasks, keystoneTaskId: 'missing', energy: 'normal' })).toEqual(tasks);
  });

  it('keystone appears in the result', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'medium', context: 'work', position: 0 }),
      makeTask({ id: 'low-1', load: 'low', context: 'work', position: 1 }),
      makeTask({ id: 'low-2', load: 'low', context: 'work', position: 2 }),
    ];
    const result = getMomentumTasks({ tasks, keystoneTaskId: 'keystone', energy: 'normal' });
    expect(result.some(t => t.id === 'keystone')).toBe(true);
  });

  it('low tasks appear before medium keystone', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'medium', context: 'work', position: 0 }),
      makeTask({ id: 'low-1', load: 'low', context: 'work', position: 1 }),
      makeTask({ id: 'low-2', load: 'low', context: 'work', position: 2 }),
    ];
    const result = getMomentumTasks({ tasks, keystoneTaskId: 'keystone', energy: 'normal' });
    const keystoneIndex = result.findIndex(t => t.id === 'keystone');
    const lowIndexes = result
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => t.load === 'low')
      .map(({ i }) => i);
    expect(lowIndexes.every(i => i < keystoneIndex)).toBe(true);
  });

  it('same-context tasks appear before cross-context tasks of same load', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'high', context: 'work', position: 0 }),
      makeTask({ id: 'same-low', load: 'low', context: 'work', position: 1 }),
      makeTask({ id: 'other-low', load: 'low', context: 'home', position: 2 }),
    ];
    const result = getMomentumTasks({ tasks, keystoneTaskId: 'keystone', energy: 'normal' });
    const sameIndex = result.findIndex(t => t.id === 'same-low');
    const otherIndex = result.findIndex(t => t.id === 'other-low');
    expect(sameIndex).toBeLessThan(otherIndex);
  });

  it('allowCrossContextRunway includes cross-context tasks before keystone', () => {
    const tasks = [
      makeTask({ id: 'keystone', load: 'medium', context: 'work', position: 0 }),
      makeTask({ id: 'cross-low', load: 'low', context: 'home', position: 1 }),
    ];
    const result = getMomentumTasks({
      tasks,
      keystoneTaskId: 'keystone',
      energy: 'normal',
      allowCrossContextRunway: true,
    });
    const keystoneIndex = result.findIndex(t => t.id === 'keystone');
    const crossIndex = result.findIndex(t => t.id === 'cross-low');
    expect(crossIndex).toBeLessThan(keystoneIndex);
  });

  it('single task list returns just that task', () => {
    const tasks = [makeTask({ id: 'keystone', load: 'medium' })];
    const result = getMomentumTasks({ tasks, keystoneTaskId: 'keystone', energy: 'normal' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('keystone');
  });

  it('returns empty array for empty input', () => {
    const result = getMomentumTasks({ tasks: [], keystoneTaskId: null, energy: 'normal' });
    expect(result).toEqual([]);
  });
});