import { create } from 'zustand';
import { Task, EnergyLevel } from '../types';
import { getSetting, saveSetting } from '../data/db';
import { pickKeystoneForMe, hasCrossContextLowerLoadOptions } from '../utils/momentum';

interface MomentumStore {
  momentumModeEnabled: boolean;
  momentumRunActive: boolean;
  momentumEnergy: EnergyLevel | '';
  keystoneTaskId: string | null;
  momentumError: string;
  allowCrossContextRunway: boolean;

  loadMomentumSettings: () => Promise<void>;
  setMomentumModeEnabled: (value: boolean) => void;
  selectEnergy: (energy: EnergyLevel) => void;
  setKeystone: (taskId: string) => void;
  pickKeystone: (visibleTasks: Task[]) => void;
  startRun: () => void;
  endRun: () => void;
  enableCrossContextRunway: (visibleTasks: Task[]) => void;
  clearKeystoneIfMissing: (tasks: Task[]) => void;
}

export const useMomentumStore = create<MomentumStore>((set, get) => ({
  momentumModeEnabled: false,
  momentumRunActive: false,
  momentumEnergy: '',
  keystoneTaskId: null,
  momentumError: '',
  allowCrossContextRunway: false,

  loadMomentumSettings: async () => {
    const [
      momentumModeEnabled,
      momentumRunActive,
      momentumEnergy,
      keystoneTaskId,
    ] = await Promise.all([
      getSetting<boolean>('momentumModeEnabled', false),
      getSetting<boolean>('momentumRunActive', false),
      getSetting<EnergyLevel | ''>('momentumEnergy', ''),
      getSetting<string | null>('keystoneTaskId', null),
    ]);

    set({
      momentumModeEnabled,
      momentumRunActive,
      momentumEnergy,
      keystoneTaskId,
    });
  },

  setMomentumModeEnabled: (value) => {
    set({ momentumModeEnabled: value });
    saveSetting('momentumModeEnabled', value);
  },

  selectEnergy: (energy) => {
    set({ momentumEnergy: energy, momentumError: '' });
    saveSetting('momentumEnergy', energy);
  },

  setKeystone: (taskId) => {
    set({
      keystoneTaskId: taskId,
      allowCrossContextRunway: false,
      momentumError: '',
    });
    saveSetting('keystoneTaskId', taskId);
  },

  pickKeystone: (visibleTasks) => {
    const suggested = pickKeystoneForMe(visibleTasks);
    if (!suggested) {
      set({ momentumError: 'No eligible tasks available to choose from.' });
      return;
    }
    set({
      keystoneTaskId: suggested.id,
      momentumEnergy: 'tired',
      momentumError: '',
    });
    saveSetting('keystoneTaskId', suggested.id);
    saveSetting('momentumEnergy', 'tired');
  },

  startRun: () => {
    const { keystoneTaskId, momentumEnergy } = get();
    if (!keystoneTaskId) {
      set({ momentumError: 'Select a Keystone task to start.' });
      return;
    }
    if (!momentumEnergy) {
      set({ momentumError: 'Choose how tired you are first.' });
      return;
    }
    set({ momentumRunActive: true, momentumError: '' });
    saveSetting('momentumRunActive', true);
  },

  endRun: () => {
    set({
      momentumRunActive: false,
      keystoneTaskId: null,
      momentumEnergy: '',
      momentumError: '',
      allowCrossContextRunway: false,
    });
    saveSetting('momentumRunActive', false);
    saveSetting('keystoneTaskId', null);
    saveSetting('momentumEnergy', '');
  },

  enableCrossContextRunway: (visibleTasks) => {
    const { keystoneTaskId } = get();
    const hasOptions = hasCrossContextLowerLoadOptions(visibleTasks, keystoneTaskId);
    if (!hasOptions) {
      set({ momentumError: 'No lower-load tasks are available from another context.' });
      return;
    }
    set({ allowCrossContextRunway: true, momentumError: '' });
  },

  clearKeystoneIfMissing: (tasks) => {
    const { keystoneTaskId, momentumRunActive } = get();
    if (!momentumRunActive || !keystoneTaskId) return;
    const keystoneExists = tasks.some((task) => task.id === keystoneTaskId);
    if (!keystoneExists) {
      set({ keystoneTaskId: null, momentumRunActive: false });
      saveSetting('keystoneTaskId', null);
      saveSetting('momentumRunActive', false);
    }
  },
}));