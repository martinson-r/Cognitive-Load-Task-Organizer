import { Task, LoadLevel, EnergyLevel } from '../types';
import { LOAD_RANK, PRIORITY_RANK } from '../constants/TaskRanks';

// Re-export for any consumers that imported these from momentum.js directly
export { LOAD_RANK, PRIORITY_RANK };

// ── Internal types ─────────────────────────────────────────────────────────

interface LoadPools {
  low: Task[];
  medium: Task[];
  high: Task[];
}

interface BeforeKeystoneParams {
  keystoneTask: Task;
  sameContextPools: LoadPools;
  otherContextPools: LoadPools;
  energy: EnergyLevel;
}

interface AfterKeystoneParams {
  keystoneTask: Task;
  sameContextPools: LoadPools;
  otherContextPools: LoadPools;
  energy: EnergyLevel;
}

interface GetMomentumTasksParams {
  tasks: Task[];
  keystoneTaskId: string | null;
  energy: EnergyLevel | '';
  allowCrossContextRunway?: boolean;
}

// ── Internal helpers ───────────────────────────────────────────────────────

function getPriorityRank(priority: string): number {
  return PRIORITY_RANK[priority as keyof typeof PRIORITY_RANK] ?? PRIORITY_RANK.medium;
}

function getPosition(task: Task): number {
  return task.position ?? 0;
}

export function sortByPriorityThenPosition(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const priorityDiff = getPriorityRank(b.priority) - getPriorityRank(a.priority);
    if (priorityDiff !== 0) return priorityDiff;
    return getPosition(a) - getPosition(b);
  });
}

export function groupTasksByLoad(tasks: Task[]): LoadPools {
  return {
    low: tasks.filter((task) => task.load === 'low'),
    medium: tasks.filter((task) => task.load === 'medium'),
    high: tasks.filter((task) => task.load === 'high'),
  };
}

export function pickKeystoneForMe(tasks: Task[]): Task | null {
  if (!tasks || tasks.length === 0) return null;

  const { low, medium, high } = groupTasksByLoad(tasks);

  const lowCandidates = sortByPriorityThenPosition(low);
  if (lowCandidates.length > 0) return lowCandidates[0];

  const mediumCandidates = sortByPriorityThenPosition(medium);
  if (mediumCandidates.length > 0) return mediumCandidates[0];

  const anyCandidates = sortByPriorityThenPosition(high.length > 0 ? high : tasks);
  return anyCandidates[0] ?? null;
}

function takeUpTo(source: Task[], count: number): Task[] {
  if (count <= 0 || source.length === 0) return [];
  return source.splice(0, count);
}

function buildOrderedPools(tasks: Task[]): LoadPools {
  const { low, medium, high } = groupTasksByLoad(tasks);
  return {
    low: sortByPriorityThenPosition(low),
    medium: sortByPriorityThenPosition(medium),
    high: sortByPriorityThenPosition(high),
  };
}

function drainPoolsInOrder(
  samePools: LoadPools,
  otherPools: LoadPools,
  loadOrder: LoadLevel[]
): Task[] {
  const results: Task[] = [];

  loadOrder.forEach((load) => {
    results.push(...samePools[load]);
    samePools[load] = [];
    results.push(...otherPools[load]);
    otherPools[load] = [];
  });

  return results;
}

function getBeforeLowCount(keystoneLoad: LoadLevel, energy: EnergyLevel): number {
  if (keystoneLoad === 'low') {
    return energy === 'ambitious' ? 1 : 0;
  }

  if (keystoneLoad === 'medium') {
    if (energy === 'tired') return 3;
    if (energy === 'normal') return 2;
    return 1;
  }

  // keystoneLoad === 'high'
  if (energy === 'tired') return 3;
  if (energy === 'normal') return 2;
  return 1;
}

function buildBeforeKeystoneTasksWithFallback({
  keystoneTask,
  sameContextPools,
  otherContextPools,
  energy,
}: BeforeKeystoneParams): Task[] {
  const before: Task[] = [];

  if (keystoneTask.load === 'medium') {
    const targetLowCount = 2;
    before.push(...takeUpTo(sameContextPools.low, targetLowCount));
    const remainingLowNeeded = targetLowCount - before.length;
    if (remainingLowNeeded > 0) {
      before.push(...takeUpTo(otherContextPools.low, remainingLowNeeded));
    }
    return before;
  }

  if (keystoneTask.load === 'high') {
    const targetLowCount = energy === 'tired' ? 2 : energy === 'normal' ? 2 : 1;
    before.push(...takeUpTo(sameContextPools.low, targetLowCount));
    const remainingLowNeeded = targetLowCount - before.length;
    if (remainingLowNeeded > 0) {
      before.push(...takeUpTo(otherContextPools.low, remainingLowNeeded));
    }
    const sameMedium = takeUpTo(sameContextPools.medium, 1);
    if (sameMedium.length > 0) {
      before.push(...sameMedium);
    } else {
      before.push(...takeUpTo(otherContextPools.medium, 1));
    }
    return before;
  }

  return before;
}

function buildBeforeKeystoneTasks({
  keystoneTask,
  sameContextPools,
  energy,
}: Omit<BeforeKeystoneParams, 'otherContextPools'>): Task[] {
  const before: Task[] = [];
  const lowCount = getBeforeLowCount(keystoneTask.load, energy);
  before.push(...takeUpTo(sameContextPools.low, lowCount));
  if (keystoneTask.load === 'high') {
    before.push(...takeUpTo(sameContextPools.medium, 1));
  }
  return before;
}

function getAfterOrder(keystoneLoad: LoadLevel, energy: EnergyLevel): LoadLevel[] {
  if (keystoneLoad === 'high') {
    return energy === 'ambitious'
      ? ['medium', 'high', 'low']
      : ['medium', 'low', 'high'];
  }
  if (keystoneLoad === 'medium') {
    return ['medium', 'high', 'low'];
  }
  return energy === 'tired'
    ? ['low', 'medium', 'high']
    : ['medium', 'low', 'high'];
}

function buildAfterKeystoneTasks({
  keystoneTask,
  sameContextPools,
  otherContextPools,
  energy,
}: AfterKeystoneParams): Task[] {
  const afterOrder = getAfterOrder(keystoneTask.load, energy);
  return drainPoolsInOrder(sameContextPools, otherContextPools, afterOrder);
}

// ── Public API ─────────────────────────────────────────────────────────────

export function getMomentumTasks({
  tasks,
  keystoneTaskId,
  energy,
  allowCrossContextRunway = false,
}: GetMomentumTasksParams): Task[] {
  if (!tasks || tasks.length === 0 || !keystoneTaskId || !energy) {
    return tasks ?? [];
  }

  const keystoneTask = tasks.find((task) => task.id === keystoneTaskId);
  if (!keystoneTask) return tasks;

  const remainingTasks = tasks.filter((task) => task.id !== keystoneTaskId);
  const sameContextTasks = remainingTasks.filter(
    (task) => task.context === keystoneTask.context
  );
  const otherContextTasks = remainingTasks.filter(
    (task) => task.context !== keystoneTask.context
  );

  const sameContextPools = buildOrderedPools(sameContextTasks);
  const otherContextPools = buildOrderedPools(otherContextTasks);

  const beforeKeystone = allowCrossContextRunway
    ? buildBeforeKeystoneTasksWithFallback({
        keystoneTask,
        sameContextPools,
        otherContextPools,
        energy,
      })
    : buildBeforeKeystoneTasks({
        keystoneTask,
        sameContextPools,
        energy,
      });

  const afterKeystone = buildAfterKeystoneTasks({
    keystoneTask,
    sameContextPools,
    otherContextPools,
    energy,
  });

  return [...beforeKeystone, keystoneTask, ...afterKeystone];
}

export function hasCrossContextLowerLoadOptions(
  tasks: Task[],
  keystoneTaskId: string | null
): boolean {
  if (!tasks || !keystoneTaskId) return false;

  const keystoneTask = tasks.find((task) => task.id === keystoneTaskId);
  if (!keystoneTask || keystoneTask.load === 'low') return false;

  const otherContextTasks = tasks.filter(
    (task) => task.id !== keystoneTaskId && task.context !== keystoneTask.context
  );

  if (keystoneTask.load === 'medium') {
    return otherContextTasks.some((task) => task.load === 'low');
  }

  return otherContextTasks.some(
    (task) => task.load === 'low' || task.load === 'medium'
  );
}

export function getRunwayNeedsFallback(
  tasks: Task[],
  keystoneTaskId: string | null
): boolean {
  if (!keystoneTaskId) return false;

  const keystone = tasks.find((task) => task.id === keystoneTaskId);
  if (!keystone) return false;
  if (keystone.load === 'low') return false;

  const sameContextTasks = tasks.filter(
    (task) => task.id !== keystone.id && task.context === keystone.context
  );

  const sameLowCount = sameContextTasks.filter((task) => task.load === 'low').length;
  const sameMediumCount = sameContextTasks.filter(
    (task) => task.load === 'medium'
  ).length;

  if (keystone.load === 'medium') return sameLowCount < 1;

  return sameLowCount < 1 && sameMediumCount < 1;
}

export function getMomentumRunwayMessage(
  visibleTasks: Task[],
  keystoneTaskId: string | null
): string {
  if (!keystoneTaskId) return '';

  const keystone = visibleTasks.find((task) => task.id === keystoneTaskId);
  if (!keystone) return '';
  if (keystone.load === 'low') return '';

  const sameContextTasks = visibleTasks.filter(
    (task) => task.id !== keystone.id && task.context === keystone.context
  );

  const hasLowerLoadTask =
    keystone.load === 'medium'
      ? sameContextTasks.some((task) => task.load === 'low')
      : sameContextTasks.some(
          (task) => task.load === 'low' || task.load === 'medium'
        );

  if (hasLowerLoadTask) return '';

  if (keystone.load === 'medium') {
    return 'No lower-load tasks available in this context.';
  }

  return 'No lower-load tasks available in this context. This run may begin with your Keystone.';
}