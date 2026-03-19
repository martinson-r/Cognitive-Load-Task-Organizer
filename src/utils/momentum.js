// src/utils/momentum.js

export const LOAD_RANK = {
  low: 0,
  medium: 1,
  high: 2,
};

export const PRIORITY_RANK = {
  low: 0,
  medium: 1,
  high: 2,
};

function getPriorityRank(priority) {
  return PRIORITY_RANK[priority] ?? PRIORITY_RANK.medium;
}

function getPosition(task) {
  return task.position ?? 0;
}

export function sortByPriorityThenPosition(tasks) {
  return [...tasks].sort((a, b) => {
    const priorityDiff = getPriorityRank(b.priority) - getPriorityRank(a.priority);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return getPosition(a) - getPosition(b);
  });
}

export function groupTasksByLoad(tasks) {
  return {
    low: tasks.filter((task) => task.load === "low"),
    medium: tasks.filter((task) => task.load === "medium"),
    high: tasks.filter((task) => task.load === "high"),
  };
}

export function pickKeystoneForMe(tasks) {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  const { low, medium, high } = groupTasksByLoad(tasks);

  const lowCandidates = sortByPriorityThenPosition(low);
  if (lowCandidates.length > 0) {
    return lowCandidates[0];
  }

  const mediumCandidates = sortByPriorityThenPosition(medium);
  if (mediumCandidates.length > 0) {
    return mediumCandidates[0];
  }

  const anyCandidates = sortByPriorityThenPosition(high.length > 0 ? high : tasks);
  return anyCandidates[0] ?? null;
}

// Logic to build task list based on selection
function takeUpTo(source, count) {
  if (count <= 0 || source.length === 0) return [];
  return source.splice(0, count);
}

function buildOrderedPools(tasks) {
  const { low, medium, high } = groupTasksByLoad(tasks);

  return {
    low: sortByPriorityThenPosition(low),
    medium: sortByPriorityThenPosition(medium),
    high: sortByPriorityThenPosition(high),
  };
}

function takeFromPairedPools(samePools, otherPools, load, count) {
  const fromSame = takeUpTo(samePools[load], count);
  const remaining = count - fromSame.length;

  if (remaining <= 0) {
    return fromSame;
  }

  return [...fromSame, ...takeUpTo(otherPools[load], remaining)];
}

function drainPoolsInOrder(samePools, otherPools, loadOrder) {
  const results = [];

  loadOrder.forEach((load) => {
    results.push(...samePools[load]);
    samePools[load] = [];
    results.push(...otherPools[load]);
    otherPools[load] = [];
  });

  return results;
}

function getBeforeLowCount(keystoneLoad, energy) {
  if (keystoneLoad === "low") {
    return energy === "ambitious" ? 1 : 0;
  }

  if (keystoneLoad === "medium") {
    if (energy === "tired") return 3;
    if (energy === "normal") return 2;
    return 1;
  }

  // keystoneLoad === "high"
  if (energy === "tired") return 3;
  if (energy === "normal") return 2;
  return 1;
}

function buildBeforeKeystoneTasksWithFallback({
  keystoneTask,
  sameContextPools,
  otherContextPools,
  energy,
}) {
  const before = [];

  if (keystoneTask.load === "medium") {
    const targetLowCount = 2;

    before.push(...takeUpTo(sameContextPools.low, targetLowCount));

    const remainingLowNeeded = targetLowCount - before.length;
    if (remainingLowNeeded > 0) {
      before.push(...takeUpTo(otherContextPools.low, remainingLowNeeded));
    }

    return before;
  }

  if (keystoneTask.load === "high") {
    const targetLowCount =
      energy === "tired" ? 2 : energy === "normal" ? 2 : 1;

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
}) {
  const before = [];

  const lowCount = getBeforeLowCount(keystoneTask.load, energy);

  // Same-context low tasks first
  before.push(...takeUpTo(sameContextPools.low, lowCount));

  if (keystoneTask.load === "high") {
    // At most one same-context medium before a high keystone
    before.push(...takeUpTo(sameContextPools.medium, 1));
  }

  return before;
}

function getAfterOrder(keystoneLoad, energy) {
  if (keystoneLoad === "high") {
    // Only ambitious allows another high soon after a high keystone
    return energy === "ambitious"
      ? ["medium", "high", "low"]
      : ["medium", "low", "high"];
  }

  if (keystoneLoad === "medium") {
    // High can come after a medium keystone
    return ["medium", "high", "low"];
  }

  // low keystone
  return energy === "tired"
    ? ["low", "medium", "high"]
    : ["medium", "low", "high"];
}

function buildAfterKeystoneTasks({
  keystoneTask,
  sameContextPools,
  otherContextPools,
  energy,
}) {
  const afterOrder = getAfterOrder(keystoneTask.load, energy);
  return drainPoolsInOrder(sameContextPools, otherContextPools, afterOrder);
}

export function getMomentumTasks({ tasks, keystoneTaskId, energy, allowCrossContextRunway = false, }) {
  if (!tasks || tasks.length === 0 || !keystoneTaskId || !energy) {
    return tasks ?? [];
  }

  const keystoneTask = tasks.find((task) => task.id === keystoneTaskId);

  if (!keystoneTask) {
    return tasks;
  }

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

export function hasCrossContextLowerLoadOptions(tasks, keystoneTaskId) {
  if (!tasks || !keystoneTaskId) return false;

  const keystoneTask = tasks.find((task) => task.id === keystoneTaskId);
  if (!keystoneTask || keystoneTask.load === "low") return false;

  const otherContextTasks = tasks.filter(
    (task) => task.id !== keystoneTaskId && task.context !== keystoneTask.context
  );

  if (keystoneTask.load === "medium") {
    return otherContextTasks.some((task) => task.load === "low");
  }

  // high keystone
  return otherContextTasks.some(
    (task) => task.load === "low" || task.load === "medium"
  );
}

export function getRunwayNeedsFallback(tasks, keystoneTaskId) {
  if (!keystoneTaskId) return false;

  const keystone = tasks.find((task) => task.id === keystoneTaskId);
  if (!keystone) return false;
  if (keystone.load === "low") return false;

  const sameContextTasks = tasks.filter(
    (task) => task.id !== keystone.id && task.context === keystone.context
  );

  const sameLowCount = sameContextTasks.filter((task) => task.load === "low").length;
  const sameMediumCount = sameContextTasks.filter((task) => task.load === "medium").length;

  if (keystone.load === "medium") {
    return sameLowCount < 1;
  }

  // high keystone
  return sameLowCount < 1 && sameMediumCount < 1;
}

export function getMomentumRunwayMessage(visibleTasks, keystoneTaskId) {
  if (!keystoneTaskId) return "";

  const keystone = visibleTasks.find((task) => task.id === keystoneTaskId);
  if (!keystone) return "";

  if (keystone.load === "low") return "";

  const sameContextTasks = visibleTasks.filter(
    (task) => task.id !== keystone.id && task.context === keystone.context
  );

  const hasLowerLoadTask =
    keystone.load === "medium"
      ? sameContextTasks.some((task) => task.load === "low")
      : sameContextTasks.some(
          (task) => task.load === "low" || task.load === "medium"
        );

  if (hasLowerLoadTask) return "";

  if (keystone.load === "medium") {
    return "No lower-load tasks available in this context.";
  }

  return "No lower-load tasks available in this context. This run may begin with your Keystone.";
}