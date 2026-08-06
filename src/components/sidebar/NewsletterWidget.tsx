import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase/client';

export const NewsletterWidget: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isValid) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: trimmed }]);

      if (error) {
        if (error.code === '23505') {
          setStatus('success');
          setMessage("You're already subscribed! 🎉 We'll keep sending great content your way.");
        } else {
          throw error;
        }
      } else {
        setStatus('success');
        setMessage("You're subscribed! 🎉 Check your inbox for a confirmation.");
      }
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0891B2] to-[#0369A1] p-6 text-white shadow-lg">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />

      <div className="relative">
        <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center mb-4">
          <Mail size={22} className="text-white" />
        </div>

        <h3 className="font-serif font-bold text-lg mb-1.5">Stay in the Loop</h3>
        <p className="text-white/80 text-sm leading-relaxed mb-5">
          Get the latest articles, tutorials, and industry insights delivered straight to your inbox every week.
        </p>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-2.5 bg-white/15 rounded-xl p-4 text-sm"
            >
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
              <p>{message}</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              noValidate
              className="space-y-3"
            >
              <div>
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="your@email.com"
                  disabled={status === 'loading'}
                  className={`w-full px-4 py-2.5 bg-white/15 border rounded-xl text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 transition disabled:opacity-70 ${
                    status === 'error'
                      ? 'border-red-300 focus:ring-red-300/30'
                      : 'border-white/20 focus:border-white/50 focus:ring-white/20'
                  }`}
                  required
                />
                {status === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 mt-1.5 text-xs text-red-200"
                  >
                    <AlertCircle size={11} />
                    {message}
                  </motion.p>
                )}
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#F97316] hover:bg-orange-500 disabled:opacity-70 text-white font-semibold text-sm py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange-900/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <><Loader2 size={16} className="animate-spin" /> Subscribing...</>
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-white/50 text-xs mt-3">No spam. Unsubscribe at any time.</p>
      </div>
    </div>
  );
};
