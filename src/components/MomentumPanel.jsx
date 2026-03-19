import "../styles/momentum-panel.css";

function MomentumPanel({
  momentumRunActive,
  momentumEnergy,
  momentumError,
  momentumNeedsFallback,
  allowCrossContextRunway,
  onSelectEnergy,
  onStartMomentumRun,
  onPickKeystoneForMe,
  onEnableCrossContextRunway,
  onEndMomentumRun,
}) {
  return (
    <div className="momentum-panel">
      {!momentumRunActive ? (
        <>
          <p className="momentum-panel__title">Momentum Mode</p>

          <div className="momentum-panel__section">
            <p>Choose your Keystone task</p>
            <p className="momentum-panel__help">
              Click a task card to select it.
            </p>
          </div>

          <div className="momentum-panel__section">
            <p>How tired are you today?</p>
            <div className="momentum-energy-options">
              <button
                type="button"
                className={momentumEnergy === "tired" ? "is-selected" : ""}
                onClick={() => onSelectEnergy("tired")}
              >
                Tired
              </button>

              <button
                type="button"
                className={momentumEnergy === "normal" ? "is-selected" : ""}
                onClick={() => onSelectEnergy("normal")}
              >
                Normal
              </button>

              <button
                type="button"
                className={momentumEnergy === "ambitious" ? "is-selected" : ""}
                onClick={() => onSelectEnergy("ambitious")}
              >
                Ambitious
              </button>
            </div>
          </div>

          {momentumError && (
            <p className="momentum-panel__error">{momentumError}</p>
          )}

          <div className="momentum-panel__actions">
            <button type="button" onClick={onStartMomentumRun}>
              Start Momentum Run
            </button>

            <button type="button" onClick={onPickKeystoneForMe}>
              I&apos;m too tired, pick for me
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="momentum-panel__title">Momentum Run active</p>
          <p>
            Energy: <strong>{momentumEnergy}</strong>
          </p>

          {momentumNeedsFallback && !allowCrossContextRunway && !momentumError && (
            <div className="momentum-panel__fallback">
              <p className="momentum-panel__help">
                No lower-load tasks available in this context.
              </p>
              <button type="button" onClick={onEnableCrossContextRunway}>
                Bring in easier tasks from another context
              </button>
            </div>
          )}

          {allowCrossContextRunway && !momentumError && (
            <p className="momentum-panel__help">
              Using lower-load tasks from another context to build runway.
            </p>
          )}

          {momentumError && (
            <p className="momentum-panel__error">{momentumError}</p>
          )}

          <button type="button" onClick={onEndMomentumRun}>
            End Run
          </button>
        </>
      )}
    </div>
  );
}

export default MomentumPanel;