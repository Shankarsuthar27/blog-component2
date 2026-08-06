import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { supabase } from '../lib/supabase/client';
import { Mail, Send, MessageSquare, MapPin, Phone, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
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
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
      toast.success('Your message has been sent successfully!');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      toast.error(`Failed to send message: ${err.message || 'Please try again'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-grow pt-28 pb-16">
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFEFF] text-[#0891B2] border border-[#CFFAFE]">
              <MessageSquare size={13} /> Get in Touch
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F172A] tracking-tight">
              Contact <span className="text-[#0891B2]">Editorial Team</span>
            </h1>
            <p className="text-base text-[#64748B]">
              Have questions, feedback, guest post inquiries, or technical suggestions? Reach out to us below.
            </p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Contact Details Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 space-y-6 shadow-2xs">
                <h3 className="font-serif text-xl font-bold text-[#0F172A]">Direct Channels</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                    <div className="w-10 h-10 rounded-xl bg-[#ECFEFF] text-[#0891B2] flex items-center justify-center shrink-0 border border-[#CFFAFE]">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">Email Us</p>
                      <p className="text-xs text-[#64748B]">contact@insightjournal.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                    <div className="w-10 h-10 rounded-xl bg-[#ECFEFF] text-[#0891B2] flex items-center justify-center shrink-0 border border-[#CFFAFE]">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">Location</p>
                      <p className="text-xs text-[#64748B]">San Francisco, CA & Remote Global</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                    <div className="w-10 h-10 rounded-xl bg-[#ECFEFF] text-[#0891B2] flex items-center justify-center shrink-0 border border-[#CFFAFE]">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">Author Applications</p>
                      <p className="text-xs text-[#64748B]">authors@insightjournal.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 space-y-6 shadow-2xs">
                <h3 className="font-serif text-2xl font-bold text-[#0F172A]">Send Us a Message</h3>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 bg-[#ECFEFF] border border-[#CFFAFE] rounded-2xl text-center space-y-3"
                  >
                    <CheckCircle2 size={36} className="text-[#0891B2] mx-auto" />
                    <h4 className="font-serif text-xl font-bold text-[#0F172A]">Message Sent!</h4>
                    <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                      Thank you for contacting Insight Journal. Our editorial team will get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 bg-[#0891B2] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0F172A] mb-1.5" htmlFor="name">
                          Your Name *
                        </label>
                        <input
                          id="name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0891B2] transition font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0F172A] mb-1.5" htmlFor="email">
                          Email Address *
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0891B2] transition font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1.5" htmlFor="subject">
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Feedback or Guest Post Inquiry"
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0891B2] transition font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1.5" htmlFor="message">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message here..."
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0891B2] transition resize-none leading-relaxed font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] text-white font-bold py-3.5 rounded-xl shadow-md shadow-[#0891B2]/20 hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 size={18} className="animate-spin" />
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
        </section>
      </main>

      <Footer />
    </div>
  );
};
export default ContactPage;
