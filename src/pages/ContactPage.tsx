import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { supabase } from '../lib/supabase/client';
import { Mail, MessageSquare, Send, MapPin, Phone, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('contact_messages').insert([
        {
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || 'General Inquiry',
          message: message.trim(),
          read: false,
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
      toast.success('Your message has been sent to our editorial team!');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      toast.error(`Failed to send message: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ECFEFF] text-[#0891B2] border border-[#CFFAFE]">
              <Mail size={12} /> Get in Touch
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F172A] leading-tight">
              We’d Love to Hear From You
            </h1>
            <p className="text-base md:text-lg text-[#64748B] leading-relaxed">
              Have a question, feedback, guest post submission, or partnership proposal? Send our editorial team a message.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto">
            
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-6">
                <h3 className="font-serif text-2xl font-bold text-[#0F172A]">Editorial Office</h3>
                
                <div className="space-y-4 text-xs text-[#64748B]">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-[#0891B2] shrink-0 mt-0.5">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[#0F172A] text-sm">Headquarters</p>
                      <p className="mt-0.5">742 Evergreen Terrace, Suite 400<br />San Francisco, CA 94107</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-[#0891B2] shrink-0 mt-0.5">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[#0F172A] text-sm">Email Enquiries</p>
                      <p className="mt-0.5 font-mono">editorial@insightjournal.com</p>
                      <p className="font-mono text-[11px] text-[#94A3B8]">press@insightjournal.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-[#0891B2] shrink-0 mt-0.5">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[#0F172A] text-sm">Response Time</p>
                      <p className="mt-0.5">Mon – Fri: 9:00 AM – 6:00 PM PST</p>
                      <p className="text-[11px] text-[#94A3B8]">Typically within 24 business hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-200 shadow-xs">
                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0F172A]">Message Received!</h3>
                    <p className="text-sm text-[#64748B] max-w-sm mx-auto">
                      Thank you for reaching out. A member of our editorial team will review your message and reply shortly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2.5 bg-[#0891B2] text-white text-xs font-bold rounded-xl hover:bg-[#06B6D4] transition"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/10 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/10 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                        Subject Topic
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Feedback, Editorial Inquiry, Partnership..."
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/10 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                        Your Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message here..."
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/10 transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-[#0891B2] to-[#06B6D4] hover:opacity-95 text-white font-bold py-3.5 rounded-xl shadow-md shadow-[#0891B2]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default ContactPage;
