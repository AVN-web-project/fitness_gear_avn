import React from 'react';
import { PhoneCall, Mail, MapPin, Clock, ArrowLeft, Ticket, ShieldCheck, MessageSquare, ExternalLink, Headphones } from 'lucide-react';
import Button from '../components/Button';

export default function ContactPage({
  onBack,
  onNavigateSupport,
  theme = 'dark'
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-10 px-4 sm:px-8 lg:px-16 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-3 pb-6 border-b border-[var(--border-subtle)]">
          <Button
            onClick={onBack}
            variant="icon"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black font-heading italic uppercase text-[var(--text-main)] flex items-center gap-2">
              <Headphones className="w-6 h-6 text-[#FF1E27]" /> CONTACT AVN ATHLETICS
            </h1>
            <p className="text-xs text-[var(--text-sub)] font-medium">
              We are here to support your powerlifting and athletic training. Get in touch with our team.
            </p>
          </div>
        </div>

        {/* Hero Banner with Primary CTAs */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-[var(--border-subtle)] relative overflow-hidden space-y-6 shadow-2xl bg-gradient-to-b from-[#FF1E27]/10 via-transparent to-transparent">
          <div className="max-w-2xl space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF1E27] font-heading px-3 py-1 rounded-full bg-[#FF1E27]/10 border border-[#FF1E27]/30">
              OFFICIAL CUSTOMER SUPPORT
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-heading italic uppercase text-[var(--text-main)]">
              DIRECT ATHLETE HELP LINE
            </h2>
            <p className="text-xs text-[var(--text-sub)] font-medium leading-relaxed">
              Have questions about order tracking, equipment specifications, or size exchanges? Contact our dedicated support desk directly via toll-free phone or official email.
            </p>
          </div>

          {/* Raise Ticket CTA Card */}
          <div className="p-6 rounded-2xl bg-[var(--bg-main)]/80 border border-[#FF1E27]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF1E27]/20 text-[#FF1E27] flex items-center justify-center shrink-0 border border-[#FF1E27]/40">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black font-heading uppercase text-[var(--text-main)]">
                  NEED FORMAL TICKET ASSISTANCE?
                </h3>
                <p className="text-xs text-[var(--text-sub)] font-medium">
                  Submit a formal support ticket to track order returns, size swaps, or warranty claims.
                </p>
              </div>
            </div>

            <Button
              onClick={() => onNavigateSupport && onNavigateSupport()}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shrink-0 shadow-[0_0_20px_rgba(255,30,39,0.4)]"
            >
              <Ticket className="w-4 h-4" />
              <span>RAISE A TICKET</span>
            </Button>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Toll Free Phone Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] hover:border-[#FF1E27]/60 transition-all space-y-4 shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-[#FF1E27]/10 text-[#FF1E27] flex items-center justify-center group-hover:scale-110 transition-transform">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF1E27] font-heading">
                TOLL-FREE HELPLINE
              </span>
              <h3 className="text-lg font-black font-mono text-[var(--text-main)]">
                1800-890-2868
              </h3>
              <p className="text-[11px] text-[var(--text-sub)] font-medium pt-1">
                Mon – Sat, 9:00 AM – 7:00 PM IST
              </p>
            </div>
            <a
              href="tel:18008902868"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#FF1E27] hover:underline pt-2"
            >
              <span>Call Toll-Free Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Email Support Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] hover:border-[#FF1E27]/60 transition-all space-y-4 shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-[#FF1E27]/10 text-[#FF1E27] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF1E27] font-heading">
                EMAIL SUPPORT
              </span>
              <h3 className="text-base font-black font-mono text-[var(--text-main)] truncate">
                support@avngear.com
              </h3>
              <p className="text-[11px] text-[var(--text-sub)] font-medium pt-1">
                Average response time: 2-4 hours
              </p>
            </div>
            <a
              href="mailto:support@avngear.com"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#FF1E27] hover:underline pt-2"
            >
              <span>Send Support Email</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Headquarters Location Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] hover:border-[#FF1E27]/60 transition-all space-y-4 shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-[#FF1E27]/10 text-[#FF1E27] flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF1E27] font-heading">
                HEADQUARTERS & WAREHOUSE
              </span>
              <h3 className="text-sm font-extrabold font-heading text-[var(--text-main)]">
                AVN ATHLETICS PVT LTD
              </h3>
              <p className="text-[11px] text-[var(--text-sub)] font-medium leading-relaxed pt-1">
                Cyber City, Phase III, Building 10-C<br />
                Gurugram, Haryana 122002, India
              </p>
            </div>
          </div>

        </div>

        {/* Operating Hours & Guarantee Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-4">
            <Clock className="w-8 h-8 text-[#FF1E27] shrink-0" />
            <div>
              <h4 className="text-xs font-black font-heading uppercase text-[var(--text-main)]">SUPPORT HOURS</h4>
              <p className="text-[11px] text-[var(--text-sub)]">Monday to Saturday: 9 AM to 7 PM IST</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-[#FF1E27] shrink-0" />
            <div>
              <h4 className="text-xs font-black font-heading uppercase text-[var(--text-main)]">100% ATHLETE GUARANTEE</h4>
              <p className="text-[11px] text-[var(--text-sub)]">Fast 24-hour response & free size exchanges</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
