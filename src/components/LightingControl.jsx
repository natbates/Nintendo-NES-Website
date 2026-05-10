import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa6';
import { useCarousel } from '../context/CarouselContext';

function LightingControl({ className = '', value, onChange }) {
  const { lightStrength: carouselLightStrength, setLightStrength: setCarouselLightStrength } = useCarousel();
  const resolvedValue = typeof value === 'number' ? value : carouselLightStrength;
  const handleChange = onChange || setCarouselLightStrength;

  return (
    <div className={`light-strength-slider ${className}`.trim()}>
      <FaSun className="sun-icon" size={12} />
      <FaMoon className="moon-icon" size={12} />
      <input
        id="lightSlider"
        type="range"
        min="0.3"
        max="2"
        step="0.1"
        value={resolvedValue}
        onChange={(e) => handleChange(parseFloat(e.target.value))}
        className="light-slider-input"
      />
      <span className="light-value">{resolvedValue.toFixed(1)}x</span>
    </div>
  );
}

export default LightingControl;
