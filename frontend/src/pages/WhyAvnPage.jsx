import React from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Flame, Dumbbell, Layers, Truck, BadgeCheck, Target } from 'lucide-react';
import Button from '../components/Button';

/**
 * Why AVN — a dedicated page.
 *
 * The home page carries a condensed WhyChoose section; this is the long-form version for
 * visitors who arrive from a footer link, an ad, or a shared URL.
 */
export default function WhyAvnPage({ onBack, onNavigateAbout, onNavigateSearch, theme = 'dark' }) {
  const pillars = [
    {
      icon: ShieldCheck,
      title: 'BUILT FOR THE LIFT',
      body: 'Every strap, sleeve and wrap is tested under load before it ships. If it cannot survive a heavy squat session, it does not carry the AVN mark.',
    },
    {
      icon: Layers,
      title: 'MATERIALS THAT HOLD',
      body: 'Reinforced stitching, high-density neoprene and industrial-grade velcro. The parts that fail first on cheap gear are the parts we overbuild.',
    },
    {
      icon: Target,
      title: 'FIT THAT WORKS',
      body: 'Sized and shaped around real Indian athletes, not scaled down from a foreign template. Support where you need it, freedom where you do not.',
    },
    {
      icon: BadgeCheck,
      title: 'HONEST PRICING',
      body: 'No inflated MRP, no permanent discount. You pay for the material and the build, not for a struck-through number.',
    },
    {
      icon: Dumbbell,
      title: 'FOR EVERY STAGE',
      body: 'From a first pair of wrist wraps to a competition-grade knee sleeve. The range grows with you instead of forcing you to switch brands.',
    },
    {
      icon: Truck,
      title: 'SUPPORT THAT ANSWERS',
      body: 'Real people on the other end of the support hub — sizing questions, replacements, order issues. Not a form that disappears.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-10 px-4 sm:px-8 lg:px-16 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-[var(--border-subtle)]">
          <Button onClick={onBack} variant="icon" title="Back to Home">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-sans font-black italic tracking-tight uppercase text-[var(--text-main)] flex items-center gap-2">
              <Flame className="w-6 h-6 text-[#FF1E27]" /> WHY AVN
            </h1>
            <p className="text-sm text-[var(--text-sub)] font-normal">
              Engineered for strength. Built for you.
            </p>
          </div>
        </div>

        {/* Hero */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-[var(--border-subtle)] relative overflow-hidden space-y-5 shadow-2xl bg-gradient-to-b from-[#FF1E27]/10 via-transparent to-transparent">
          <span className="inline-block text-xs sm:text-sm font-sans font-extrabold uppercase tracking-widest text-[#FF1E27] px-3 py-1 rounded-full bg-[#FF1E27]/10 border border-[#FF1E27]/30">
            THE AVN STANDARD
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black italic tracking-tight uppercase leading-tight max-w-3xl">
            GEAR THAT DOESN'T QUIT <span className="text-[#FF1E27]">BEFORE YOU DO.</span>
          </h2>
          <p className="text-[var(--text-sub)] text-sm sm:text-base leading-relaxed max-w-2xl">
            Most fitness accessories are made to a price. Ours are made to a standard — then
            priced as fairly as we can. That single decision shapes everything below.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateSearch}
              className="btn-glow-red px-6 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm tracking-wider uppercase text-white inline-flex items-center gap-2 cursor-pointer"
            >
              SHOP THE RANGE <ArrowRight className="w-4 h-4" />
            </button>
            {onNavigateAbout && (
              <button
                type="button"
                onClick={onNavigateAbout}
                className="btn-outline-dark px-6 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm tracking-wider uppercase inline-flex items-center gap-2 cursor-pointer"
              >
                OUR STORY <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* The pillars */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-sans font-extrabold tracking-widest text-[#FF1E27] uppercase">
              WHAT WE HOLD OURSELVES TO
            </p>
            <h2 className="text-2xl sm:text-3xl font-sans font-black italic tracking-tight uppercase">
              SIX THINGS WE WON'T COMPROMISE
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-main)] hover:border-[#FF1E27]/40 transition-colors space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF1E27]/10 border border-[#FF1E27]/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#FF1E27]" />
                </div>
                <h3 className="text-base font-sans font-black uppercase tracking-wide">{title}</h3>
                <p className="text-sm text-[var(--text-sub)] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing CTA */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-[var(--border-subtle)] text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-sans font-black italic tracking-tight uppercase">
            READY TO <span className="text-[#FF1E27]">TRAIN?</span>
          </h2>
          <p className="text-sm text-[var(--text-sub)] max-w-xl mx-auto">
            Every piece in the range is covered by the same standard described above.
            If something falls short, tell us — we will make it right.
          </p>
          <button
            type="button"
            onClick={onNavigateSearch}
            className="btn-glow-red inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-heading font-bold text-xs sm:text-sm tracking-wider uppercase text-white cursor-pointer"
          >
            BROWSE ALL PRODUCTS <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
