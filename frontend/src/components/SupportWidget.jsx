import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, HelpCircle, Ticket, Bot, CheckCircle, Search, ChevronRight, AlertCircle } from 'lucide-react';
import Button from './Button';
import { sendSupportChatMessageApi, submitSupportTicketApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SupportWidget({ onOpenFullSupport, initialOrderId = '' }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'ticket' | 'faq'

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Welcome to AVN Athlete Support! I can help you track orders, process size exchanges, or check gear specs. What can I assist you with today?",
      time: 'Just now'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Exchange',
    orderId: initialOrderId || '',
    message: ''
  });
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);

  // FAQ Search State
  const [faqSearch, setFaqSearch] = useState('');

  const faqs = [
    { q: 'How do I return or exchange an item?', a: 'Go to My Account > Orders & Returns, select your order and click Request Return. You can also swap sizes for free within 10 days of delivery.' },
    { q: 'When will my order be shipped?', a: 'Orders placed before 2 PM IST are dispatched same-day. Delivery takes 2-4 business days across India with live SMS tracking.' },
    { q: 'What warranty covers AVN lever belts?', a: 'AVN competition belts carry a 12-month structural warranty covering stitching, leather integrity, and stainless lever hardware.' },
    { q: 'How do I measure for a powerlifting belt?', a: 'Measure firmly around your navel (mid-waist) at tightest exhaled stance. Do not use your standard pant size!' }
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  useEffect(() => {
    if (initialOrderId) {
      setTicketForm((prev) => ({ ...prev, orderId: initialOrderId }));
    }
  }, [initialOrderId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMsgText = inputMsg.trim();
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: userMsgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
    setIsTyping(true);

    try {
      const res = await sendSupportChatMessageApi(userMsgText);
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: res.reply || "Thanks for reaching out! Our athlete support team has received your query.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 700);
    } catch (err) {
      setIsTyping(false);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.message.trim()) return;

    setTicketLoading(true);
    setTicketSuccess('');

    const ticketObj = {
      id: 'TCK-' + Math.floor(1000 + Math.random() * 9000),
      userEmail: user?.email || 'guest@avngear.com',
      userName: user?.name || 'AVN Athlete',
      subject: ticketForm.subject || 'Support Ticket',
      category: ticketForm.category || 'General',
      orderId: ticketForm.orderId || 'N/A',
      message: ticketForm.message,
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    // Persist locally & notify SupportPage
    try {
      const saved = JSON.parse(localStorage.getItem('avn-support-tickets') || '[]');
      localStorage.setItem('avn-support-tickets', JSON.stringify([ticketObj, ...saved]));
      window.dispatchEvent(new Event('avn-ticket-submitted'));
    } catch (e) {}

    setTicketSuccess(`✓ Ticket submitted! Reference ID: ${ticketObj.id}`);
    setTicketForm({ subject: '', category: 'Exchange', orderId: '', message: '' });
    setTicketLoading(false);

    submitSupportTicketApi({
      userEmail: ticketObj.userEmail,
      userName: ticketObj.userName,
      subject: ticketObj.subject,
      category: ticketObj.category,
      orderId: ticketObj.orderId,
      message: ticketObj.message
    });
  };

  const filteredFaqs = faqs.filter(
    (f) => f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-5 sm:bottom-8 sm:right-8 z-40 p-4 rounded-full bg-[#FF1E27] text-white shadow-[0_8px_30px_rgba(255,30,39,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5 font-heading font-black text-xs uppercase tracking-wider group"
          title="AVN Athlete Support & Live Chat"
        >
          <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">LIVE SUPPORT</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      )}

      {/* FLOATING SUPPORT WIDGET PANEL */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[620px] h-[85vh] glass-panel rounded-3xl border border-[var(--border-subtle)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-black/60 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF1E27]/20 border border-[#FF1E27] text-[#FF1E27] flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black font-heading uppercase text-white tracking-wider flex items-center gap-1.5">
                  AVN ATHLETE SUPPORT <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Instant AI Chat & Ticket Hub</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onOpenFullSupport && (
                <button
                  onClick={() => { setIsOpen(false); onOpenFullSupport(); }}
                  className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[10px] font-bold text-slate-300 hover:text-white transition-colors"
                  title="Open Full Support Center"
                >
                  Full Hub
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 bg-black/40 border-b border-[var(--border-subtle)] text-xs font-extrabold font-heading uppercase">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-3 flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'chat' ? 'text-[#FF1E27] border-b-2 border-[#FF1E27] bg-[#FF1E27]/10' : 'text-slate-400 hover:text-white'}`}
            >
              <Bot className="w-3.5 h-3.5" /> Chat
            </button>
            <button
              onClick={() => setActiveTab('ticket')}
              className={`py-3 flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'ticket' ? 'text-[#FF1E27] border-b-2 border-[#FF1E27] bg-[#FF1E27]/10' : 'text-slate-400 hover:text-white'}`}
            >
              <Ticket className="w-3.5 h-3.5" /> Ticket
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-3 flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'faq' ? 'text-[#FF1E27] border-b-2 border-[#FF1E27] bg-[#FF1E27]/10' : 'text-slate-400 hover:text-white'}`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> FAQs
            </button>
          </div>

          {/* TAB CONTENT: CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[var(--bg-main)]">
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#FF1E27] text-white rounded-br-none shadow-md font-medium'
                          : 'bg-black/60 border border-[var(--border-subtle)] text-slate-200 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-slate-500 pt-1 font-mono">{msg.time}</span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-black/40 p-2.5 rounded-xl border border-[var(--border-subtle)] w-fit">
                    <Bot className="w-3.5 h-3.5 text-[#FF1E27] animate-bounce" />
                    <span>AVN Assistant is typing...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-black/60 border-t border-[var(--border-subtle)] flex items-center gap-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Ask about shipping, returns or sizing..."
                  className="flex-1 bg-[var(--bg-main)] text-white text-xs px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim()}
                  className="p-2.5 rounded-xl bg-[#FF1E27] hover:bg-red-600 disabled:opacity-40 text-white transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB CONTENT: TICKET FORM */}
          {activeTab === 'ticket' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[var(--bg-main)]">
              {ticketSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{ticketSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSubmitTicket} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase font-heading">Issue Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full bg-black/60 text-white text-xs px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                  >
                    <option value="Exchange">Size / Color Exchange</option>
                    <option value="Return">Order Return & Refund</option>
                    <option value="Delivery">Shipping / Tracking Help</option>
                    <option value="Warranty">Warranty Claim</option>
                    <option value="General">General Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase font-heading">Order Reference (Optional)</label>
                  <input
                    type="text"
                    value={ticketForm.orderId}
                    onChange={(e) => setTicketForm({ ...ticketForm, orderId: e.target.value })}
                    placeholder="e.g. AVN-ORD-1001"
                    className="w-full bg-black/60 text-white text-xs px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase font-heading">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    className="w-full bg-black/60 text-white text-xs px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase font-heading">Message / Details</label>
                  <textarea
                    required
                    rows={4}
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    placeholder="Provide details about your query or equipment issue..."
                    className="w-full bg-black/60 text-white text-xs px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  loading={ticketLoading}
                  variant="primary"
                  fullWidth
                  size="md"
                >
                  SUBMIT SUPPORT TICKET
                </Button>
              </form>
            </div>
          )}

          {/* TAB CONTENT: FAQS */}
          {activeTab === 'faq' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[var(--bg-main)]">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Search FAQ answers..."
                  className="w-full pl-9 pr-3.5 py-2 bg-black/60 text-white text-xs rounded-xl border border-[var(--border-subtle)] focus:border-[#FF1E27] focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                {filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-black/40 border border-[var(--border-subtle)] space-y-1.5">
                    <h4 className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-normal">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}
