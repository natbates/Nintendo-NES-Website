import React from 'react';
import { FaPause, FaPlay, FaVolumeHigh, FaVolumeXmark } from 'react-icons/fa6';
import '../styles/Carousel.css';

function CanvasControlBar({
  className = '',
  showSpinToggle = true,
  showSoundToggle = true,
  spinEnabled = false,
  onSpinToggle,
  soundEnabled = false,
  onSoundToggle,
}) {
  const handleSpinToggle = (event) => {
    if (onSpinToggle) {
      onSpinToggle(event.target.checked);
    }
  };

  const handleSoundToggle = (event) => {
    if (onSoundToggle) {
      onSoundToggle(event.target.checked);
    }
  };

  return (
    <div className={`carousel-toggle-row ${className}`.trim()}>
      {showSpinToggle && (
        <label
        className="carousel-toggle"
        title={spinEnabled ? 'Stop spinning this model' : 'Spin this model'}
        >
        <input
            type="checkbox"
            checked={spinEnabled}
            onChange={handleSpinToggle}
            aria-label="Toggle model spin"
        />
        <span className={`spin-checkbox ${spinEnabled ? 'checked' : ''}`} aria-hidden="true">
            {spinEnabled && <span className="pixel-tick" />}
        </span>
        <span className="spin-toggle-label">Spin the model</span>
        </label>
      )}

      {showSoundToggle && (
        <label
        className="carousel-toggle"
        title={soundEnabled ? 'Mute audio for this model' : 'Unmute audio for this model'}
        >
        <input
            type="checkbox"
            checked={soundEnabled}
            onChange={handleSoundToggle}
            aria-label="Toggle model sounds"
        />
        <span className={`spin-checkbox ${soundEnabled ? 'checked' : ''}`} aria-hidden="true">
            {soundEnabled && <span className="pixel-tick" />}
        </span>
        <span className="spin-toggle-label">Play sound</span>
        </label>
      )}

    </div>
  );
}

export default CanvasControlBar;
