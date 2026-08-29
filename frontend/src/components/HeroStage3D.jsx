import React from 'react';
import logoWhite from '../assets/logo-transparent.png';
import logoRedBlack from '../assets/logo-red-black.png';

export default function HeroStage3D({ theme }) {
  const isLight = theme === 'light';
  const logoImg = isLight ? logoRedBlack : logoWhite;
  return (
    <div className="relative w-full max-w-[640px] aspect-square mx-auto flex items-center justify-center select-none">
      
      {/* 1. Background Red Arch Ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-12">
        <div className={`w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] rounded-full border-[3px] border-[#FF1E27] ${
          isLight
            ? 'opacity-80 shadow-md'
            : 'shadow-[0_0_110px_#ff1e27,inset_0_0_55px_#ff1e27] opacity-95 animate-blaze'
        }`} />
      </div>

      {/* 2. Ambient Light Halo */}
      <div className={`absolute w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] rounded-full blur-3xl pointer-events-none ${
        isLight
          ? 'bg-gradient-radial from-[#FF1E27]/15 via-transparent to-transparent'
          : 'bg-gradient-radial from-[#FF1E27]/25 via-[#FF1E27]/5 to-transparent'
      }`} />

      {/* 4. 3D Jet-Black Stage Platform matching Reference Image */}
      <svg className="w-full h-full relative z-10 drop-shadow-[0_30px_70px_rgba(0,0,0,0.98)]" viewBox="0 0 500 500" fill="none">
        <defs>
          <linearGradient id="blackStageTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--stage-top-1)" />
            <stop offset="35%" stopColor="var(--stage-top-2)" />
            <stop offset="100%" stopColor="var(--stage-top-3)" />
          </linearGradient>

          <linearGradient id="blackStageSideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--stage-side-1)" />
            <stop offset="15%" stopColor="var(--stage-side-2)" />
            <stop offset="100%" stopColor="var(--stage-side-3)" />
          </linearGradient>

          <filter id="neonRedGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base Ground Shadow */}
        <ellipse cx="250" cy="410" rx="230" ry="36" fill="var(--shadow-main)" opacity="0.8" />

        {/* Lower Stage Base Platform Wall */}
        <path d="M30 375 C 30 405, 470 405, 470 375 L 470 388 C 470 418, 30 418, 30 388 Z" fill="url(#blackStageSideGrad)" />
        
        {/* Lower Perimeter Glowing Red Neon Line */}
        <path d="M30 388 C 30 418, 470 418, 470 388" fill="none" stroke="#FF1E27" strokeWidth="4" filter="url(#neonRedGlow)" />

        {/* Main Stage Cylinder Wall */}
        <path d="M55 325 L55 372 C 55 402, 445 402, 445 372 L 445 325 Z" fill="url(#blackStageSideGrad)" />
        
        {/* Stage Top Disc Surface */}
        <ellipse cx="250" cy="325" rx="195" ry="30" fill="url(#blackStageTopGrad)" stroke="var(--border-subtle)" strokeWidth="2" />
        
        {/* Top Disc Edge Reflection */}
        <ellipse cx="250" cy="325" rx="185" ry="25" fill="none" stroke="rgba(255,30,39,0.3)" strokeWidth="1" />

        {/* Contact Shadow Under Logo */}
        <ellipse cx="250" cy="320" rx="150" ry="16" fill="var(--shadow-main)" opacity="0.85" />
      </svg>

      {/* 5. 3D Angled Floating Transparent Logo Overlay with Individual Letter 3D Extrusion & Respective Glows */}
      <div 
        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none pb-12 sm:pb-16"
        style={{
          perspective: '1000px',
        }}
      >
        <div className="relative flex items-center justify-center">
          
          {/* Respective Red Core Glow specifically behind central V letter */}
          <div className="absolute w-[130px] sm:w-[170px] h-[130px] sm:h-[170px] bg-[radial-gradient(ellipse_at_center,rgba(255,30,39,0.75)_0%,rgba(204,0,0,0.35)_45%,transparent_70%)] blur-xl pointer-events-none transform -translate-y-2 z-0 animate-pulse" />

          {/* Respective White Specular Spot Glows behind outer A and N letters */}
          <div className="absolute -left-12 sm:-left-16 w-[110px] h-[110px] bg-[radial-gradient(circle,rgba(255,255,255,0.22)_0%,transparent_70%)] blur-lg pointer-events-none z-0" />
          <div className="absolute -right-12 sm:-right-16 w-[110px] h-[110px] bg-[radial-gradient(circle,rgba(255,255,255,0.22)_0%,transparent_70%)] blur-lg pointer-events-none z-0" />

          {/* Multi-Layered 3D Extruded Logo Image matching Master Reference Image */}
          <img
            src={logoImg}
            alt="AVN 3D Brand Logo"
            className="w-[310px] sm:w-[410px] h-auto object-contain relative z-10 transform-gpu"
            style={{
              transform: 'rotateX(10deg) rotateY(-3deg) translateZ(15px)',
              transformStyle: 'preserve-3d',
              filter: `
                drop-shadow(-1px 1px 0px rgba(255,255,255,0.45))
                drop-shadow(-3px 3px 0px #1c1c26)
                drop-shadow(-6px 6px 0px #12121a)
                drop-shadow(-9px 9px 0px #09090d)
                drop-shadow(-12px 12px 0px #030305)
                drop-shadow(0 0 30px rgba(255,30,39,0.7))
                drop-shadow(0 25px 42px rgba(0,0,0,0.98))
              `
            }}
          />
        </div>
      </div>
    </div>
  );
}
