import React, { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export default function WhyChoose() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 } // Triggers video playback as soon as 10% of the video section is visible
    );

    observer.observe(video);

    return () => {
      if (video) observer.unobserve(video);
    };
  }, []);

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

        {/* Right Video Card with Athlete Squat Thumbnail & 10% Viewport Autoplay */}
        <div className="lg:col-span-6 glass-panel rounded-3xl overflow-hidden relative group min-h-[380px] lg:min-h-[440px] border border-white/5 flex items-center justify-center">

          {/* Autoplay Video Stream with Athlete Squat Thumbnail Poster */}
          <video
            ref={videoRef}
            poster="/athelete-squat.png"
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 contrast-105 group-hover:scale-105 transition-transform duration-700"
          >
            <source src="/blazing-effect.mp4" type="video/mp4" />
          </video>

          {/* Dark & Red Ambient Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709]/80 via-transparent to-black/30 pointer-events-none" />

        </div>

      </div>

    </section>
  );
}
