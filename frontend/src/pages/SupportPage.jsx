import React, { useState, useEffect } from 'react';
import { Headset, ArrowLeft, Search, PackageCheck, RotateCcw, ShieldCheck, Ticket, MessageSquare, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { fetchSupportTicketsApi, submitSupportTicketApi } from '../services/api';

export default function SupportPage({
  onBack,
  onNavigateOrders,
  initialOrderId = '',
  theme = 'dark'
}) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  // Tickets List
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Ticket Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Exchange',
    orderId: initialOrderId || '',
    message: ''
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const localTickets = JSON.parse(localStorage.getItem('avn-support-tickets') || '[]');
      const userEmail = user?.email || JSON.parse(localStorage.getItem('avn-user') || 'null')?.email;
      let apiTickets = [];
      if (userEmail) {
        apiTickets = await fetchSupportTicketsApi(userEmail);
      }

      // Combine local and API tickets without duplicates
      const merged = [...localTickets];
      apiTickets.forEach((t) => {
        if (!merged.some((m) => m.id === t.id)) {
          merged.push(t);
        }
      });

      setMyTickets(merged);
    } catch (e) {
      console.warn('Unable to load tickets', e);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets();
    window.addEventListener('avn-ticket-submitted', loadTickets);
    return () => window.removeEventListener('avn-ticket-submitted', loadTickets);
  }, [user]);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!ticketForm.message.trim()) {
      setErrorMsg('Please enter a message for your support ticket.');
      return;
    }

    setIsSubmitting(true);

    const ticketObj = {
      id: 'TCK-' + Math.floor(1000 + Math.random() * 9000),
      userEmail: user?.email || 'customer@avngear.com',
      userName: user?.name || 'AVN Athlete',
      subject: ticketForm.subject || 'Support Ticket',
      category: ticketForm.category || 'General',
      orderId: ticketForm.orderId || 'N/A',
      message: ticketForm.message,
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    // 1. Update state immediately
    setMyTickets((prev) => [ticketObj, ...prev]);

    // 2. Persist to localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('avn-support-tickets') || '[]');
      localStorage.setItem('avn-support-tickets', JSON.stringify([ticketObj, ...saved]));
      window.dispatchEvent(new Event('avn-ticket-submitted'));
    } catch (err) {}

    setSuccessMsg(`✓ Ticket submitted successfully! Reference ID: ${ticketObj.id}`);
    setTicketForm({ subject: '', category: 'Exchange', orderId: '', message: '' });
    setIsSubmitting(false);

    // 3. Sync to API in background
    submitSupportTicketApi({
      userEmail: ticketObj.userEmail,
      userName: ticketObj.userName,
      subject: ticketObj.subject,
      category: ticketObj.category,
      orderId: ticketObj.orderId,
      message: ticketObj.message
    });
  };

  const faqList = [
    {
      id: 1,
      category: 'Shipping & Delivery',
      question: 'What is the standard delivery timeframe for AVN equipment?',
      answer: 'All orders are processed and dispatched within 24 hours. Express shipping takes 2-4 business days across metro cities in India. Live tracking SMS updates are sent automatically upon dispatch.'
    },
    {
      id: 2,
      category: 'Returns & Exchanges',
      question: 'How do I initiate a size exchange or product return?',
      answer: 'You can initiate a return or exchange within 10 days of delivery. Go to your Account > Orders & Returns, select the relevant item, and choose your preferred replacement size or refund method.'
    },
    {
      id: 3,
      category: 'Warranty Claims',
      question: 'What does the 12-Month AVN Hardware Warranty cover?',
      answer: 'Our competition lever belts and wrist wraps are backed by a 12-month structural warranty covering stitching, leather delamination, and lever hardware defects.'
    },
    {
      id: 4,
      category: 'Gear Maintenance',
      question: 'How should I clean and maintain my knee wraps and leather belt?',
      answer: 'Wipe leather belts with a damp cloth and apply leather conditioner every 3 months. Hand-wash knee/elbow wraps in cold water with mild detergent and air-dry flat. Do not machine dry!'
    }
  ];

  const filteredFaqs = faqList.filter(
    (f) => f.question.toLowerCase().includes(searchQuery.toLowerCase()) || f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-10 px-4 sm:px-8 lg:px-16 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-[var(--border-subtle)]">
          <Button
            onClick={onBack}
            variant="icon"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black font-heading italic uppercase text-[var(--text-main)] flex items-center gap-2">
              <Headset className="w-6 h-6 text-[#FF1E27]" /> ATHLETE SUPPORT HUB
            </h1>
            <p className="text-xs text-[var(--text-sub)] font-medium">
              Get instant help with orders, size exchanges, warranties, and technical assistance.
            </p>
          </div>
        </div>

        {/* Hero Search Banner */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-[var(--border-subtle)] relative overflow-hidden text-center space-y-6 shadow-2xl bg-gradient-to-b from-[#FF1E27]/10 to-transparent">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF1E27] font-heading px-3 py-1 rounded-full bg-[#FF1E27]/10 border border-[#FF1E27]/30">
              24/7 ATHLETE ASSISTANCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-heading italic uppercase text-[var(--text-main)]">
              HOW CAN WE HELP YOU TODAY?
            </h2>
          </div>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics, order tracking, return policy, warranty..."
              className="w-full pl-12 pr-4 py-3 bg-[var(--bg-main)] text-[var(--text-main)] text-sm rounded-2xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none shadow-lg"
            />
          </div>
        </div>

        {/* Quick Action Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={onNavigateOrders}
            className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] hover:border-[#FF1E27] transition-all cursor-pointer space-y-3 group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF1E27]/10 text-[#FF1E27] flex items-center justify-center group-hover:scale-110 transition-transform">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-heading uppercase text-[var(--text-main)]">TRACK SHIPMENT</h3>
              <p className="text-[11px] text-[var(--text-sub)]">Check active dispatch status & tracking numbers</p>
            </div>
          </div>

          <div
            onClick={onNavigateOrders}
            className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] hover:border-[#FF1E27] transition-all cursor-pointer space-y-3 group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF1E27]/10 text-[#FF1E27] flex items-center justify-center group-hover:scale-110 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-heading uppercase text-[var(--text-main)]">RETURNS & EXCHANGES</h3>
              <p className="text-[11px] text-[var(--text-sub)]">Free size swaps & 10-day return policy</p>
            </div>
          </div>

          <div
            onClick={() => {
              const el = document.getElementById('ticket-form-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] hover:border-[#FF1E27] transition-all cursor-pointer space-y-3 group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF1E27]/10 text-[#FF1E27] flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-heading uppercase text-[var(--text-main)]">WARRANTY CLAIMS</h3>
              <p className="text-[11px] text-[var(--text-sub)]">12-month hardware & stitching guarantee</p>
            </div>
          </div>

          <div
            onClick={() => {
              const el = document.getElementById('ticket-form-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] hover:border-[#FF1E27] transition-all cursor-pointer space-y-3 group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF1E27]/10 text-[#FF1E27] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-heading uppercase text-[var(--text-main)]">HUMAN SUPPORT</h3>
              <p className="text-[11px] text-[var(--text-sub)]">Submit a ticket for dedicated agent assistance</p>
            </div>
          </div>
        </div>

        {/* ACTIVE SUPPORT TICKETS */}
        <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
          <h2 className="text-lg font-black font-heading italic uppercase text-[var(--text-main)] flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#FF1E27]" /> MY SUPPORT TICKETS ({myTickets.length})
          </h2>

          {myTickets.length === 0 ? (
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] text-center text-xs text-[var(--text-sub)] italic">
              No active support tickets found. Need help? Fill out the inquiry form below.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myTickets.map((t) => (
                <div key={t.id} className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-heading text-[#FF1E27]">{t.id}</span>
                    <span className={"text-[10px] font-extrabold uppercase font-heading px-2.5 py-0.5 rounded-full " + (
                      t.status === 'Open' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    )}>
                      {t.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-black font-heading uppercase text-[var(--text-main)]">{t.subject}</h4>
                  <p className="text-[11px] text-[var(--text-sub)] leading-relaxed">{t.message}</p>
                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-sub)]">
                    <span>Order: {t.orderId || 'N/A'}</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TICKET SUBMISSION FORM */}
        <div id="ticket-form-section" className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-6 shadow-xl">
          <div>
            <h2 className="text-lg font-black font-heading italic uppercase text-[var(--text-main)] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#FF1E27]" /> SUBMIT A SUPPORT TICKET
            </h2>
            <p className="text-xs text-[var(--text-sub)] font-medium mt-0.5">
              Fill out your inquiry and our support team will respond within 12 hours.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)]">Issue Category</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                >
                  <option value="Exchange">Size / Color Exchange</option>
                  <option value="Return">Order Return & Refund</option>
                  <option value="Delivery">Shipping / Tracking Help</option>
                  <option value="Warranty">Warranty Claim</option>
                  <option value="General">General Inquiry</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)]">Order ID (Optional)</label>
                <input
                  type="text"
                  value={ticketForm.orderId}
                  onChange={(e) => setTicketForm({ ...ticketForm, orderId: e.target.value })}
                  placeholder="e.g. AVN-ORD-1001"
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)]">Subject</label>
              <input
                type="text"
                required
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                placeholder="Brief subject of your issue..."
                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)]">Detailed Description</label>
              <textarea
                required
                rows={5}
                value={ticketForm.message}
                onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                placeholder="Explain what assistance you need, item details, or preferred replacement options..."
                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-sm px-4 py-3 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none resize-none"
              />
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              variant="primary"
              size="lg"
            >
              SUBMIT SUPPORT TICKET
            </Button>
          </form>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <div className="space-y-6 pt-4 border-t border-[var(--border-subtle)]">
          <div>
            <h2 className="text-lg font-black font-heading italic uppercase text-[var(--text-main)]">
              KNOWLEDGE BASE & FAQS
            </h2>
            <p className="text-xs text-[var(--text-sub)] font-medium">
              Instant answers to common questions regarding orders, equipment care & policies.
            </p>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isExpanded = activeFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  onClick={() => setActiveFaq(isExpanded ? null : faq.id)}
                  className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] hover:border-[#FF1E27]/50 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-black font-heading uppercase text-[var(--text-main)] flex items-center gap-2">
                      <span className="text-[10px] text-[#FF1E27] px-2 py-0.5 rounded bg-[#FF1E27]/10 border border-[#FF1E27]/30">{faq.category}</span>
                      <span>{faq.question}</span>
                    </h3>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#FF1E27]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-sub)]" />}
                  </div>

                  {isExpanded && (
                    <p className="text-xs text-[var(--text-sub)] font-medium leading-relaxed pt-2 border-t border-[var(--border-subtle)] animate-fade-in">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
