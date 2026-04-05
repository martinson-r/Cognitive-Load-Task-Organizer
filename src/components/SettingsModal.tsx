import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useFocusTrap } from "../hooks/useFocusTrap.ts";
import { useTheme, THEMES, THEME_LABELS } from "../context/ThemeContext";
import { useTaskStore } from "../store/useTaskStore";
import { ColorPair } from "../constants/TaskOptions";
import "../styles/settings-modal.css";

// ── Helpers ────────────────────────────────────────────────────────────────

function getAutoContrastText(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 0.55 ? '#1a1a1a' : '#f5f5f5';
  } catch {
    return '#1a1a1a';
  }
}

// ── Picker mode type ───────────────────────────────────────────────────────

type PickerMode =
  | { type: 'context'; contextName: string; step: 'bg' | 'text'; draftBg: string }
  | { type: 'palette'; step: 'bg' | 'text'; draftBg: string };

// ── ContextRow ─────────────────────────────────────────────────────────────

interface ContextRowProps {
  name: string;
  currentColor: ColorPair;
  isRenaming: boolean;
  isConfirmingDelete: boolean;
  onStartRename: () => void;
  onCommitRename: (newName: string) => void;
  onCancelRename: () => void;
  onStartDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onOpenColorPicker: () => void;
}

function ContextRow({
  name, currentColor, isRenaming, isConfirmingDelete,
  onStartRename, onCommitRename, onCancelRename,
  onStartDelete, onConfirmDelete, onCancelDelete,
  onOpenColorPicker,
}: ContextRowProps) {
  const [renameValue, setRenameValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      setRenameValue(name);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isRenaming, name]);

  if (isRenaming) {
    return (
      <div className="context-row context-row--editing">
        <input
          ref={inputRef}
          className="context-row__rename-input"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommitRename(renameValue);
            if (e.key === "Escape") onCancelRename();
          }}
        />
        <button type="button" className="context-row__action context-row__action--confirm" onClick={() => onCommitRename(renameValue)} aria-label="Confirm rename">✓</button>
        <button type="button" className="context-row__action" onClick={onCancelRename} aria-label="Cancel rename">✕</button>
      </div>
    );
  }

  if (isConfirmingDelete) {
    return (
      <div className="context-row context-row--deleting">
        <div className="context-row__pill-preview" style={{ background: currentColor.bg, color: currentColor.text }}>{name}</div>
        <div className="context-row__delete-confirm">
          <p className="context-row__delete-warning">Delete <strong>{name}</strong>? Tasks using it will move to General. You can't recover it.</p>
          <div className="context-row__delete-actions">
            <button type="button" className="context-row__delete-confirm-btn" onClick={onConfirmDelete}>Confirm</button>
            <button type="button" className="context-row__action-text" onClick={onCancelDelete}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="context-row">
      <div className="context-row__pill-preview" style={{ background: currentColor.bg, color: currentColor.text }}>{name}</div>
      <div className="context-row__actions">
        <button type="button" className="context-row__action" onClick={onStartRename} aria-label={`Rename ${name}`} title="Rename">✎</button>
        <button type="button" className="context-row__action context-row__action--color" onClick={onOpenColorPicker} aria-label={`Change color for ${name}`} title="Change color" style={{ background: currentColor.bg, color: currentColor.text }}>◉</button>
        <button type="button" className="context-row__action context-row__action--delete" onClick={onStartDelete} aria-label={`Delete ${name}`} title="Delete">🗑</button>
      </div>
    </div>
  );
}

// ── ColorPickerView ────────────────────────────────────────────────────────

interface ColorPickerViewProps {
  mode: PickerMode;
  onUpdateMode: (mode: PickerMode) => void;
  onAccept: (colorPair: ColorPair) => void;
  onCancel: () => void;
}

function ColorPickerView({ mode, onUpdateMode, onAccept, onCancel }: ColorPickerViewProps) {
  const [textColor, setTextColor] = useState(() => getAutoContrastText(mode.draftBg));

  const previewBg = mode.draftBg;
  const previewText = mode.step === 'text' ? textColor : getAutoContrastText(mode.draftBg);

  const title = mode.type === 'context' ? `Color for "${mode.contextName}"` : 'Create custom color';

  function handleNext() {
    setTextColor(getAutoContrastText(mode.draftBg));
    onUpdateMode({ ...mode, step: 'text' });
  }

  function handleAccept() {
    if (mode.step === 'bg') {
      onAccept({ bg: mode.draftBg, text: getAutoContrastText(mode.draftBg) });
    } else {
      onAccept({ bg: mode.draftBg, text: textColor });
    }
  }

  return (
    <div className="color-picker-view">
      <div className="color-picker-view__header">
        <button type="button" className="color-picker-view__back-btn" onClick={onCancel}>← Back</button>
        <div className="color-picker-view__titles">
          <span className="color-picker-view__title">{mode.step === 'bg' ? 'Select Background Color' : 'Select Text Color'}</span>
          <span className="color-picker-view__subtitle">{title}</span>
        </div>
      </div>

      <div className="color-picker-view__picker">
        {mode.step === 'bg' ? (
          <HexColorPicker color={mode.draftBg} onChange={(c) => onUpdateMode({ ...mode, draftBg: c })} />
        ) : (
          <HexColorPicker color={textColor} onChange={setTextColor} />
        )}
      </div>

      <p className="color-picker-view__preview-label">Preview:</p>
      <div className="color-picker-view__preview-pill" style={{ background: previewBg, color: previewText }}>
        Sample Pill
      </div>

      <div className="color-picker-view__actions">
        {mode.step === 'bg' ? (
          <button type="button" className="color-picker-view__step-btn" onClick={handleNext}>
            Next: Select Text Color →
          </button>
        ) : (
          <button type="button" className="color-picker-view__step-btn" onClick={() => onUpdateMode({ ...mode, step: 'bg' })}>
            ← Back: Change Background Color
          </button>
        )}
        <span className="color-picker-view__or">Or:</span>
        <button type="button" className="color-picker-view__accept-btn" onClick={handleAccept}>
          Accept ✓
        </button>
      </div>
    </div>
  );
}

// ── SettingsModal ──────────────────────────────────────────────────────────

interface SettingsModalProps {
  onClose: () => void;
  onExport: () => Promise<void>;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onClearAllTasks: () => Promise<void>;
}

function SettingsModal({ onClose, onExport, onImportFile, onClearAllTasks }: SettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const {
    customContexts, contextColorOverrides, customColorPalette,
    setContextColorOverride, addToPalette, removeFromPalette,
    deleteCustomContext, renameCustomContext,
  } = useTaskStore();

  useFocusTrap(modalRef);

  const [manageContextsOpen, setManageContextsOpen] = useState(false);
  const [changeThemeOpen, setChangeThemeOpen] = useState(false);
  const [renamingContext, setRenamingContext] = useState<string | null>(null);
  const [deletingContext, setDeletingContext] = useState<string | null>(null);
  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (pickerMode) setPickerMode(null);
      else onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, pickerMode]);

  async function handleColorAccept(colorPair: ColorPair) {
    if (!pickerMode) return;
    if (pickerMode.type === 'context') {
      await setContextColorOverride(pickerMode.contextName, colorPair);
    } else {
      await addToPalette(colorPair);
    }
    setPickerMode(null);
  }

  // Color picker sub-view replaces modal content
  if (pickerMode) {
    return (
      <div className="task-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setPickerMode(null); }}>
        <div className="task-modal settings-modal" role="dialog" aria-modal="true" aria-label="Color picker" ref={modalRef}>
          <ColorPickerView
            mode={pickerMode}
            onUpdateMode={setPickerMode}
            onAccept={handleColorAccept}
            onCancel={() => setPickerMode(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="task-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="task-modal settings-modal" role="dialog" aria-modal="true" aria-label="Settings" ref={modalRef}>

        <div className="task-modal__header">
          <span className="settings-modal__title">Settings</span>
          <button type="button" className="task-modal__close" onClick={onClose} aria-label="Close settings" autoFocus>✕</button>
        </div>

        {/* ── CUSTOMIZATION ─────────────────────────────────────────────── */}
        <section className="settings-modal__section">
          <h2 className="settings-modal__section-title">Customization</h2>

          <div className="settings-accordion">
            <button
              type="button"
              className="settings-accordion__trigger"
              onClick={() => { setManageContextsOpen((v) => !v); setDeletingContext(null); setRenamingContext(null); }}
              aria-expanded={manageContextsOpen}
            >
              <span>Manage Contexts</span>
              <span className={`settings-accordion__caret${manageContextsOpen ? ' settings-accordion__caret--open' : ''}`} aria-hidden="true">›</span>
            </button>

            {manageContextsOpen && (
              <div className="settings-accordion__content">
                <p className="settings-accordion__desc">
                  Customize colors for your contexts. Changes appear everywhere the context is used.
                </p>

                {customContexts.length === 0 ? (
                  <p className="settings-accordion__empty">No custom contexts yet. Add one from the task form.</p>
                ) : (
                  customContexts.map((name) => {
                    const currentColor = contextColorOverrides[name] ?? { bg: '#f3f4f6', text: '#4b5563' };
                    return (
                      <ContextRow
                        key={name}
                        name={name}
                        currentColor={currentColor}
                        isRenaming={renamingContext === name}
                        isConfirmingDelete={deletingContext === name}
                        onStartRename={() => { setRenamingContext(name); setDeletingContext(null); }}
                        onCommitRename={async (newName) => { await renameCustomContext(name, newName); setRenamingContext(null); }}
                        onCancelRename={() => setRenamingContext(null)}
                        onStartDelete={() => { setDeletingContext(name); setRenamingContext(null); }}
                        onConfirmDelete={async () => { await deleteCustomContext(name); setDeletingContext(null); }}
                        onCancelDelete={() => setDeletingContext(null)}
                        onOpenColorPicker={() => setPickerMode({ type: 'context', contextName: name, step: 'bg', draftBg: contextColorOverrides[name]?.bg ?? '#f3f4f6' })}
                      />
                    );
                  })
                )}

                {customColorPalette.length > 0 && (
                  <div className="settings-accordion__palette">
                    <p className="settings-accordion__palette-label">Saved color pairs — tap to remove</p>
                    <div className="settings-accordion__palette-swatches">
                      {customColorPalette.map((pair, i) => (
                        <button
                          key={i}
                          type="button"
                          className="palette-swatch"
                          style={{ background: pair.bg, color: pair.text }}
                          onClick={async () => await removeFromPalette(i)}
                          aria-label={`Remove color pair ${i + 1}`}
                          title={`${pair.bg} / ${pair.text} — click to remove`}
                        >
                          Aa
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="settings-accordion__add-color-btn"
                  onClick={() => setPickerMode({ type: 'palette', step: 'bg', draftBg: '#f3f4f6' })}
                >
                  + Create custom color
                </button>
              </div>
            )}
          </div>

          <div className="settings-accordion settings-accordion--bordered">
            <button
              type="button"
              className="settings-accordion__trigger"
              onClick={() => setChangeThemeOpen((v) => !v)}
              aria-expanded={changeThemeOpen}
            >
              <span>Change Theme</span>
              <span className={`settings-accordion__caret${changeThemeOpen ? ' settings-accordion__caret--open' : ''}`} aria-hidden="true">›</span>
            </button>

            {changeThemeOpen && (
              <div className="settings-accordion__content">
                <select
                  className="settings-select"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as typeof theme)}
                  aria-label="Theme"
                >
                  {THEMES.map((t) => (
                    <option key={t} value={t}>{THEME_LABELS[t]}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>

        {/* ── DATA ──────────────────────────────────────────────────────── */}
        <section className="settings-modal__section">
          <h2 className="settings-modal__section-title">Data</h2>
          <p className="settings-modal__section-desc">
            Export your tasks and settings to a JSON file, or import a previously exported file.
          </p>
          <div className="settings-modal__row">
            <button type="button" className="settings-btn" onClick={onExport}>Export tasks</button>
            <label className="settings-btn">
              Import tasks
              <input type="file" accept=".json,application/json" onChange={onImportFile} style={{ display: "none" }} />
            </label>
          </div>
        </section>

        {/* ── DANGER ZONE ───────────────────────────────────────────────── */}
        <section className="settings-modal__section settings-modal__section--danger">
          <h2 className="settings-modal__section-title settings-modal__section-title--danger">Danger Zone</h2>
          <p className="settings-modal__section-desc">Permanently delete all tasks. This cannot be undone.</p>
          <button type="button" className="settings-btn settings-btn--danger" onClick={onClearAllTasks}>
            Clear all tasks
          </button>
        </section>

      </div>
    </div>
  );
}

export default SettingsModal;