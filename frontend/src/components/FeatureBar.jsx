import React from 'react';

export default function FeatureBar() {
  const features = [
    {
      title: 'PREMIUM QUALITY',
      description: 'Tested & trusted by athletes worldwide.',
      renderIcon: () => (
        <svg className="w-14 h-14 sm:w-16 sm:h-16 text-[#FF1E27] shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 48 48" fill="none" stroke="currentColor">
          {/* Outer Shield Outline */}
          <path d="M24 4L4 12v12c0 13.5 9 22 20 24 11-2 20-10.5 20-24V12L24 4z" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          {/* Inner Shield Contour */}
          <path d="M24 8.5L9.5 14v9.5c0 10.5 6.5 17 14.5 18.5 8-1.5 14.5-8 14.5-18.5V14L24 8.5z" strokeWidth="1" strokeOpacity="0.4" />
          {/* Thick Checkmark */}
          <path d="M16 23.5l5.5 5.5 10.5-11" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      title: 'MAXIMUM SUPPORT',
      description: 'Ergonomic designs for ultimate stability.',
      renderIcon: () => (
        <svg className="w-14 h-14 sm:w-16 sm:h-16 text-[#FF1E27] shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 48 48" fill="none" stroke="currentColor">
          {/* Top Strap Loop */}
          <path d="M17 4h14v9H17z" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          {/* Bottom Strap Loop */}
          <path d="M17 35h14v9H17z" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          {/* Octagonal Support Casing */}
          <rect x="10" y="12" width="28" height="24" rx="6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Pulse Curve */}
          <path d="M16.5 24h4l2.5-4.5 3.5 8.5 3-5H31.5" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      title: 'DURABLE MATERIALS',
      description: 'High-grade fabric for long-lasting use.',
      renderIcon: () => (
        <svg className="w-14 h-14 sm:w-16 sm:h-16 text-[#FF1E27] shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 48 48" fill="none" stroke="currentColor">
          {/* Outer Diamond Outline */}
          <polygon points="14,6 34,6 44,18 24,44 4,18" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          {/* Top Crown Horizontal Line */}
          <line x1="4" y1="18" x2="44" y2="18" strokeWidth="2.2" />
          {/* Upper Triangular Facets */}
          <polygon points="14,6 24,18 34,6" strokeWidth="2" strokeLinejoin="round" />
          <line x1="4" y1="18" x2="14" y2="6" strokeWidth="2" />
          <line x1="44" y1="18" x2="34" y2="6" strokeWidth="2" />
          {/* Lower Pavilion Facets */}
          <line x1="14" y1="18" x2="24" y2="44" strokeWidth="2.2" />
          <line x1="34" y1="18" x2="24" y2="44" strokeWidth="2.2" />
          <line x1="24" y1="18" x2="24" y2="44" strokeWidth="2" />
        </svg>
      )
    },
    {
      title: 'PERFORMANCE DRIVEN',
      description: 'Built to help you lift heavier and safer.',
      renderIcon: () => (
        <svg className="w-14 h-14 sm:w-16 sm:h-16 text-[#FF1E27] shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 48 48" fill="none" stroke="currentColor">
          {/* Outlined Angular Lightning Bolt */}
          <path d="M27 4L11 25h12L17 44l20-23H26L32 4z" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Inner Accent Line */}
          <path d="M25 9.5L16 23h9l-3.5 12 11.5-13H24.5l3.5-12.5z" strokeWidth="1" strokeOpacity="0.35" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-2 px-6 sm:px-10 lg:px-16 xl:px-20 max-w-[1536px] mx-auto">
      {/* Unified Single Container with Signature Red Corner Border Effect */}
      <div className="red-corner-border rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-8 items-center">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 sm:gap-5 group text-left p-1.5 sm:p-2 rounded-xl transition-all duration-300"
            >
              {/* Icon Container with Inverted Glass Floor Mirror Reflection */}
              <div className="relative shrink-0 flex flex-col items-center justify-center my-2">
                {/* Primary Icon */}
                <div className="relative z-10">
                  {feature.renderIcon()}
                </div>

                {/* Inverted Glass Floor Mirror Reflection Effect */}
                <div 
                  className="absolute top-[85%] pointer-events-none transform scale-y-[-0.55] opacity-35 blur-[1px] group-hover:opacity-65 transition-opacity duration-300 overflow-hidden [mask-image:linear-gradient(to_bottom,black_10%,transparent_90%)]"
                  aria-hidden="true"
                >
                  {feature.renderIcon()}
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-extrabold tracking-wider text-[var(--text-main)] font-sans font-black italic uppercase group-hover:text-[#FF1E27] transition-colors leading-tight">
                  {feature.title}
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-sub)] leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
