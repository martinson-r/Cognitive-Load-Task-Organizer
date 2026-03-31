import "../styles/momentum-panel.css";
import { Task } from "../types";
import { useMomentumStore } from "../store/useMomentumStore";

interface MomentumPanelProps {
  visibleTasks: Task[];
  momentumNeedsFallback: boolean;
}

function MomentumPanel({ visibleTasks, momentumNeedsFallback }: MomentumPanelProps) {
  const {
    momentumRunActive, momentumEnergy, momentumError,
    allowCrossContextRunway,
    selectEnergy, startRun, pickKeystone, enableCrossContextRunway, endRun,
  } = useMomentumStore();

  return (
    <div className="momentum-panel">
      {!momentumRunActive ? (
        <>
          <p className="momentum-panel__title">Momentum Mode</p>
          <div className="momentum-panel__section">
            <p>Choose your Keystone task</p>
            <p className="momentum-panel__help">Click a task card to select it.</p>
          </div>
          <div className="momentum-panel__section">
            <p>How tired are you today?</p>
            <div className="momentum-energy-options">
              {(['tired', 'normal', 'ambitious'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`momentum-energy-btn${momentumEnergy === level ? " is-selected" : ""}`}
                  onClick={() => selectEnergy(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {momentumError && <p className="momentum-panel__error">{momentumError}</p>}
          <div className="momentum-panel__actions">
            <button type="button" className="momentum-btn momentum-btn--primary" onClick={startRun}>
              Start Momentum Run
            </button>
            <button type="button" className="momentum-btn" onClick={() => pickKeystone(visibleTasks)}>
              I&apos;m too tired, pick for me
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="momentum-panel__title">Momentum Run active</p>
          <p>Energy: <strong>{momentumEnergy}</strong></p>
          {momentumNeedsFallback && !allowCrossContextRunway && !momentumError && (
            <div className="momentum-panel__fallback">
              <p className="momentum-panel__help">No lower-load tasks available in this context.</p>
              <button type="button" className="momentum-btn" onClick={() => enableCrossContextRunway(visibleTasks)}>
                Bring in easier tasks from another context
              </button>
            </div>
          )}
          {allowCrossContextRunway && !momentumError && (
            <p className="momentum-panel__help">Using lower-load tasks from another context to build runway.</p>
          )}
          {momentumError && <p className="momentum-panel__error">{momentumError}</p>}
          <div className="momentum-panel__run-footer">
            <button type="button" className="momentum-btn" onClick={endRun}>End Run</button>
          </div>
        </>
      )}
    </div>
  );
}

export default MomentumPanel;