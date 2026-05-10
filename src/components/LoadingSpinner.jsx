import React from 'react';
import { SquareLoader } from 'react-spinners';
import '../styles/LoadingSpinner.css';

function LoadingSpinner({ fullScreen = false, message = 'Loading...' }) {
  return (
    <div className={`loading-spinner-wrapper ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="loading-spinner-container">
        <SquareLoader color="#d32f2f" size={60} />
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
