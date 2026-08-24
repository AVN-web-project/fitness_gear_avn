import React, { useState, useEffect } from 'react';

export default function ProductGraphic({ image, imageLight, type, theme, className = "w-full h-52" }) {
  const [hasError, setHasError] = useState(false);

  const isEnlarged = type === 'knee-wrap' || type === 'elbow-wrap' || type === 'wrist-wrap' || type?.includes('knee') || type?.includes('elbow') || type?.includes('wrist');
  const scaleClass = isEnlarged
    ? 'scale-105 sm:scale-110 group-hover:scale-115'
    : 'scale-100 group-hover:scale-105';

  const activeSrc = (theme === 'light' && imageLight) ? imageLight : (image || imageLight);

  useEffect(() => {
    setHasError(false);
  }, [activeSrc]);

  return (
    <div className={`relative flex items-center justify-center bg-[var(--bg-card-solid)] overflow-hidden group ${className}`}>
      {activeSrc && !hasError ? (
        <img
          src={activeSrc}
          alt={type || 'Product Image'}
          className={`w-full h-full object-contain object-center transition-transform duration-500 ease-out rounded-xl transform-gpu ${scaleClass} drop-shadow-md ${theme === 'light' ? 'mix-blend-multiply' : ''}`}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
          <svg className="w-8 h-8 text-gray-400 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        </div>
      )}
    </div>
  );
}
