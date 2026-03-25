import { useEffect } from "react";
import "../styles/settings-modal.css";

function SettingsModal({ onClose, onExport, onImportFile, onClearAllTasks }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="task-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="task-modal settings-modal" role="dialog" aria-label="Settings">
        <div className="task-modal__header">
          <span className="settings-modal__title">Settings</span>
          <button
            type="button"
            className="task-modal__close"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <section className="settings-modal__section">
          <h2 className="settings-modal__section-title">Data</h2>
          <p className="settings-modal__section-desc">
            Export your tasks and settings to a JSON file, or import a previously exported file.
          </p>
          <div className="settings-modal__row">
            <button
              type="button"
              className="settings-btn"
              onClick={onExport}
            >
              Export tasks
            </button>

            <label className="settings-btn">
              Import tasks
              <input
                type="file"
                accept=".json,application/json"
                onChange={onImportFile}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </section>

        <section className="settings-modal__section settings-modal__section--danger">
          <h2 className="settings-modal__section-title settings-modal__section-title--danger">
            Danger Zone
          </h2>
          <p className="settings-modal__section-desc">
            Permanently delete all tasks. This cannot be undone.
          </p>
          <button
            type="button"
            className="settings-btn settings-btn--danger"
            onClick={onClearAllTasks}
          >
            Clear all tasks
          </button>
        </section>
      </div>
    </div>
  );
}

export default SettingsModal;