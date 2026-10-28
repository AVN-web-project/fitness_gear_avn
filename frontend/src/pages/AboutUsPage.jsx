import React from 'react';
import { ArrowLeft, ArrowRight, Users, MapPin, Heart, Sparkles, Building2, MessageSquare } from 'lucide-react';
import Button from '../components/Button';

/**
 * About Us — a dedicated page.
 *
 * NOTE FOR CONTENT REVIEW: the sections below are written from what the product range and
 * storefront copy tell us. The founder story, founding year, and location are intentionally
 * left generic — add the specifics in the marked spots so the page says something only AVN
 * could say.
 */
export default function AboutUsPage({ onBack, onNavigateWhyAvn, onNavigateSearch, onNavigateContact, theme = 'dark' }) {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-10 px-4 sm:px-8 lg:px-16 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-[var(--border-subtle)]">
          <Button onClick={onBack} variant="icon" title="Back to Home">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-sans font-black italic tracking-tight uppercase text-[var(--text-main)] flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#FF1E27]" /> ABOUT AVN ATHLETICS
            </h1>
            <p className="text-sm text-[var(--text-sub)] font-normal">
              Who we are, and why we build gear the way we do.
            </p>
          </div>
        </div>

        {/* Opening statement */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-[var(--border-subtle)] space-y-5 shadow-2xl bg-gradient-to-b from-[#FF1E27]/10 via-transparent to-transparent">
          <span className="inline-block text-xs sm:text-sm font-sans font-extrabold uppercase tracking-widest text-[#FF1E27] px-3 py-1 rounded-full bg-[#FF1E27]/10 border border-[#FF1E27]/30">
            OUR STORY
          </span>
          <h2 className="text-3xl sm:text-4xl font-sans font-black italic tracking-tight uppercase leading-tight max-w-3xl">
            WE STARTED WITH A <span className="text-[#FF1E27]">SIMPLE FRUSTRATION.</span>
          </h2>
          <p className="text-[var(--text-sub)] text-sm sm:text-base leading-relaxed max-w-2xl">
            Good lifting gear was either imported and overpriced, or local and unreliable.
            Wraps that lost their tension in a month. Sleeves that split at the seam. Sizing
            that clearly assumed a different body. AVN Athletics exists to close that gap —
            equipment built to a real standard, made for the people actually training here.
          </p>
          <p className="text-[var(--text-sub)] text-sm sm:text-base leading-relaxed max-w-2xl">
            {/* ADD: founding year and the first product — one or two sentences is enough. */}
            We began with support gear for powerlifting and strength training, and have grown
            into a full range covering lifting accessories, yoga and everyday athletic wear.
          </p>
        </div>

        {/* What we stand for */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {[
            {
              icon: Users,
              title: 'ATHLETES FIRST',
              body: 'Every decision is judged by whether it helps someone train better. Not by what looks good in a catalogue.',
            },
            {
              icon: Heart,
              title: 'BUILT TO LAST',
              body: 'We would rather sell you one sleeve that lasts three years than three that last one.',
            },
            {
              icon: MapPin,
              title: 'MADE FOR INDIA',
              body: 'Sizing, materials and pricing shaped around Indian athletes and Indian conditions.',
            },
            {
              icon: Sparkles,
              title: 'STRAIGHT TALK',
              body: 'Honest product descriptions, honest pricing, honest answers when something goes wrong.',
            },
          ].map(({ icon: Icon, title, body }) => (
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

        {/* Behind the brand */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-[var(--border-subtle)] space-y-4">
          <h2 className="text-2xl sm:text-3xl font-sans font-black italic tracking-tight uppercase">
            BEHIND THE <span className="text-[#FF1E27]">BRAND</span>
          </h2>
          {/* ADD: founder name, background, and the moment that started it. This is the section
              visitors actually read — two short paragraphs is the right length. */}
          <p className="text-sm text-[var(--text-sub)] leading-relaxed">
            AVN Athletics is run by a small team of people who train, compete and coach.
            That is why the product range looks the way it does — it is built around problems
            we have hit ourselves, not around a spreadsheet of categories.
          </p>
          <p className="text-sm text-[var(--text-sub)] leading-relaxed">
            If you have a question about sizing, a product, or an order, the support hub
            reaches a person who can actually help.
          </p>
        </div>

        {/* CTA */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-[var(--border-subtle)] text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-sans font-black italic tracking-tight uppercase">
            SEE WHAT WE <span className="text-[#FF1E27]">STAND FOR</span>
          </h2>
          <p className="text-sm text-[var(--text-sub)] max-w-xl mx-auto">
            The standards behind every product, and what we refuse to compromise on.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onNavigateWhyAvn && (
              <button
                type="button"
                onClick={onNavigateWhyAvn}
                className="btn-glow-red inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-heading font-bold text-xs sm:text-sm tracking-wider uppercase text-white cursor-pointer"
              >
                WHY AVN <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {onNavigateContact && (
              <button
                type="button"
                onClick={onNavigateContact}
                className="btn-outline-dark inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-heading font-bold text-xs sm:text-sm tracking-wider uppercase cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> TALK TO US
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
