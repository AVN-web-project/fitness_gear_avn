import React, { useState } from 'react';
import { ArrowRight, Play, X } from 'lucide-react';

export default function WhyChoose() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section id="why-avn" className="py-6 px-6 sm:px-10 lg:px-16 xl:px-20 max-w-[1536px] mx-auto">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* Left Content Card with Red Neon Corner Border Highlight */}
        <div className="lg:col-span-6 red-corner-border rounded-3xl p-8 sm:p-12 flex flex-col justify-between space-y-6 text-left relative overflow-hidden">

          <div className="space-y-4 z-10">
            <p className="text-xs sm:text-sm font-sans font-extrabold tracking-widest text-[#FF1E27] uppercase">
              WHY CHOOSE AVN?
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black italic tracking-tight uppercase text-[var(--text-main)] leading-tight">
              ENGINEERED FOR STRENGTH. BUILT FOR <span className="text-[#FF1E27] py-0.5">YOU.</span>
            </h2>
            <p className="text-[var(--text-sub)] text-sm sm:text-base leading-relaxed font-normal pt-2 max-w-lg">
              Every product is crafted with precision and passion to help you perform at your best. Whether you're a beginner or a pro, AVN has your back.
            </p>
          </div>

          <div className="pt-4 z-10">
            <a
              href="#about"
              className="red-highlight-btn inline-flex items-center gap-3 px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase text-[var(--text-main)] group cursor-pointer"
            >
              <span className="relative z-10">LEARN MORE</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform relative z-10" />
            </a>
          </div>

        </div>

        {/* Right Video Preview Card */}
        <div className="lg:col-span-6 glass-panel rounded-3xl overflow-hidden relative group min-h-[380px] lg:min-h-[440px] border border-white/5 flex items-center justify-center">

          {/* Background Gym Athlete Photo */}
          <img
            src='/athelete-squat.png'
            alt="AVN Athlete Heavy Barbell Squat"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-75 group-hover:scale-105 transition-transform duration-700"
          />

          {/* Dark & Red Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-black/40" />

          {/* Central Glowing Red Play Button */}
          <button
            onClick={() => setIsVideoOpen(true)}
            aria-label="Play Brand Video"
            className="relative z-10 w-20 h-20 rounded-full bg-[#FF1E27] hover:bg-[#ff3b42] text-white flex items-center justify-center shadow-[0_0_40px_rgba(255,30,39,0.9)] hover:scale-110 transition-all duration-300 group-hover:shadow-[0_0_60px_rgba(255,30,39,1)]"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
            <span className="absolute -inset-2 rounded-full border-2 border-[#FF1E27]/50 animate-ping" />
          </button>

        </div>

      </div>

      {/* Video Lightbox Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="relative w-full max-w-4xl bg-[#0b0b0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-[#FF1E27] flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative aspect-video w-full">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="AVN Brand Film"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
