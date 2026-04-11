import './ControlsPanel.css';
import type { ControlsPanelProps } from '../types';

const ControlsPanel = ({
  algorithm,
  setAlgorithm,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  threshold,
  setThreshold,
  bayerSize,
  setBayerSize,
  invert,
  setInvert,
  onReset,
  onProcess,
  onDownload,
  isProcessing,
  downloadDisabled,
  processDisabled
}: ControlsPanelProps) => {
  return (
    <div className="controls-panel">
      <div className="control-group">
        <label>Dithering algorithm</label>
        <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value as typeof algorithm)}>
          <option value="floyd">Floyd‑Steinberg (classic)</option>
          <option value="atkinson">Atkinson (thermal optimized)</option>
          <option value="ordered">Ordered (Bayer)</option>
          <option value="threshold">Simple threshold</option>
        </select>
      </div>

      {algorithm === 'threshold' && (
        <div className="control-group">
          <label>
            Threshold level <span className="value-label">({threshold})</span>
          </label>
          <input
            type="range"
            min="0"
            max="255"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
          />
        </div>
      )}

      {algorithm === 'ordered' && (
        <div className="control-group">
          <label>Bayer matrix size</label>
          <select
            value={bayerSize}
            onChange={(e) => setBayerSize(parseInt(e.target.value, 10) as typeof bayerSize)}
          >
            <option value={2}>2×2 (coarse)</option>
            <option value={4}>4×4 (balanced)</option>
            <option value={8}>8×8 (smooth)</option>
          </select>
        </div>
      )}

      <div className="control-group">
        <label>
          Brightness <span className="value-label">({brightness})</span>
        </label>
        <input
          type="range"
          min="-100"
          max="100"
          value={brightness}
          onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
        />
      </div>

      <div className="control-group">
        <label>
          Contrast <span className="value-label">({contrast})</span>
        </label>
        <input
          type="range"
          min="-100"
          max="100"
          value={contrast}
          onChange={(e) => setContrast(parseInt(e.target.value, 10))}
        />
      </div>

      <div className="control-group checkbox-group">
        <label>Invert colors</label>
        <input
          type="checkbox"
          checked={invert}
          onChange={(e) => setInvert(e.target.checked)}
        />
      </div>

      <div className="button-group">
        <button className="btn btn-outline" onClick={onReset}>
          ↻ Reset
        </button>
        <button
          className="btn btn-primary"
          onClick={onProcess}
          disabled={processDisabled}
        >
          {isProcessing ? 'Processing...' : 'Process'}
        </button>
      </div>
      
      <div className="button-group" style={{ marginTop: 12 }}>
        <button
          className="btn btn-primary"
          onClick={onDownload}
          disabled={downloadDisabled}
          style={{ background: downloadDisabled ? '#94a3b8' : '#1e293b' }}
        >
          Download
        </button>
      </div>

      {isProcessing && (
        <div className="processing-indicator">Rendering image, please wait...</div>
      )}
    </div>
  );
};

export default ControlsPanel;
