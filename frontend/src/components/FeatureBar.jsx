import React from 'react';
import { ShieldCheck, Activity, Award, Zap } from 'lucide-react';

export default function FeatureBar() {
  const features = [
    {
      title: 'PREMIUM QUALITY',
      description: 'Tested & trusted by pro athletes worldwide.',
      icon: <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF1E27] shrink-0" />
    },
    {
      title: 'MAXIMUM SUPPORT',
      description: 'Ergonomic design for maximum joint stability.',
      icon: <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF1E27] shrink-0" />
    },
    {
      title: 'DURABLE MATERIALS',
      description: 'High-grade fabric built for heavy lifters.',
      icon: <Award className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF1E27] shrink-0" />
    },
    {
      title: 'PERFORMANCE DRIVEN',
      description: 'Engineered to help you lift safer & heavier.',
      icon: <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF1E27] shrink-0" />
    }
  ];

  return (
    <section className="py-4 px-6 sm:px-10 lg:px-16 xl:px-20 max-w-[1536px] mx-auto">
      {/* Unified Single Container with Signature Red Corner Border Effect */}
      <div className="red-corner-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-center">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3.5 sm:gap-4 text-left group transition-transform duration-300 hover:translate-y-[-2px]"
            >
              <div className="p-3 rounded-2xl bg-[#FF1E27]/10 border border-[#FF1E27]/25 group-hover:bg-[#FF1E27]/20 group-hover:border-[#FF1E27]/50 transition-all duration-300 shrink-0">
                {feature.icon}
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black italic tracking-wider text-[var(--text-main)] font-sans uppercase group-hover:text-[#FF1E27] transition-colors leading-tight">
                  {feature.title}
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-sub)] leading-relaxed font-normal mt-0.5">
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
