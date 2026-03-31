import { create } from 'zustand';
import { Task, LoadLevel, PriorityLevel } from '../types';
import { getSetting, saveSetting } from '../data/db';

interface EditDraft {
  taskId: string;
  title: string;
  load: LoadLevel;
  priority: PriorityLevel;
  context: string;
}

interface UIStore {
  advancedFeaturesEnabled: boolean;
  settingsOpen: boolean;
  faqOpen: boolean;
  importError: string | null;
  importSuccess: string | null;
  editDraft: EditDraft | null;

  loadUISettings: () => Promise<void>;
  setAdvancedFeaturesEnabled: (value: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
  openFAQ: () => void;
  closeFAQ: () => void;
  setImportError: (message: string | null) => void;
  setImportSuccess: (message: string | null) => void;
  clearImportStatus: () => void;
  startEdit: (task: Task) => void;
  updateEditDraft: (changes: Partial<Omit<EditDraft, 'taskId'>>) => void;
  cancelEdit: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  advancedFeaturesEnabled: false,
  settingsOpen: false,
  faqOpen: false,
  importError: null,
  importSuccess: null,
  editDraft: null,

  loadUISettings: async () => {
    const advancedFeaturesEnabled = await getSetting<boolean>(
      'advancedFeaturesEnabled',
      false
    );
    set({ advancedFeaturesEnabled });
  },

  setAdvancedFeaturesEnabled: (value) => {
    set({ advancedFeaturesEnabled: value });
    saveSetting('advancedFeaturesEnabled', value);
  },

  openSettings: () => set({ settingsOpen: true }),

  closeSettings: () => {
    set({ settingsOpen: false, importError: null, importSuccess: null });
  },

  openFAQ: () => set({ faqOpen: true }),
  closeFAQ: () => set({ faqOpen: false }),

  setImportError: (message) => set({ importError: message }),
  setImportSuccess: (message) => set({ importSuccess: message }),
  clearImportStatus: () => set({ importError: null, importSuccess: null }),

  startEdit: (task) => {
    set({
      editDraft: {
        taskId: task.id,
        title: task.title,
        load: task.load,
        priority: task.priority ?? 'medium',
        context: task.context ?? 'general',
      },
    });
  },

  updateEditDraft: (changes) => {
    const { editDraft } = get();
    if (!editDraft) return;
    set({ editDraft: { ...editDraft, ...changes } });
  },

  cancelEdit: () => set({ editDraft: null }),
}));