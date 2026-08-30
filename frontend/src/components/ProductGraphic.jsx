import React, { useState, useEffect } from 'react';

export default function ProductGraphic({ image, imageLight, type, theme, className = "w-full h-52" }) {
  const [hasError, setHasError] = useState(false);

  const activeSrc = (theme === 'light' && imageLight)
    ? imageLight
    : (image || imageLight);

  useEffect(() => {
    setHasError(false);
  }, [activeSrc, theme]);

  const isEnlarged = type === 'knee-wrap' || type === 'elbow-wrap' || type === 'wrist-wrap' || type?.includes('knee') || type?.includes('elbow') || type?.includes('wrist');
  const scaleClass = isEnlarged
    ? 'scale-105 sm:scale-110 group-hover:scale-115'
    : 'scale-100 group-hover:scale-105';

  // Subtle radial gradient: very faint lighter center fading to transparent.
  // Makes dark transparent-PNG products distinguishable from dark card backgrounds
  // without a visible box border or drop-shadow glow.
  const containerStyle = theme === 'light'
    ? {}
    : {
        background: 'radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.07) 0%, transparent 72%)',
      };

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden group ${className}`}
      style={containerStyle}
    >
      {activeSrc && !hasError ? (
        <img
          src={activeSrc}
          alt={type || 'Product Image'}
          className={`relative z-10 max-w-full max-h-full object-contain object-center transition-all duration-500 ease-out rounded-xl transform-gpu ${scaleClass}`}
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
