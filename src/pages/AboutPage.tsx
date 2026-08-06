import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { NewsletterWidget } from '../components/sidebar/NewsletterWidget';
import { Target, Award, Sparkles, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ECFEFF] text-[#D80408] border border-[#CFFAFE]">
              <Sparkles size={12} /> About Daily Bharat
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F172A] leading-tight">
              Inspiring the Next Generation of Tech & Design Innovators
            </h1>
            <p className="text-base md:text-lg text-[#64748B] leading-relaxed">
              Daily Bharat is an independent digital publication devoted to technical architecture, design systems, software engineering best practices, and modern SaaS ecosystems.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center"
          >
            <div>
              <p className="font-serif text-3xl md:text-4xl font-bold text-[#D80408]">150K+</p>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mt-1">Monthly Readers</p>
            </div>
            <div>
              <p className="font-serif text-3xl md:text-4xl font-bold text-[#D80408]">480+</p>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mt-1">Published Articles</p>
            </div>
            <div>
              <p className="font-serif text-3xl md:text-4xl font-bold text-[#D80408]">25K+</p>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mt-1">Newsletter Subscribers</p>
            </div>
            <div>
              <p className="font-serif text-3xl md:text-4xl font-bold text-[#D80408]">99.8%</p>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mt-1">Positive Satisfaction</p>
            </div>
          </motion.div>

          {/* Mission & Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-[#D80408]">
                <Target size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F172A]">Our Mission</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                To simplify complex software concepts and provide actionable, high-quality technical guides for developers and product designers worldwide.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-[#D80408]">
                <Award size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F172A]">Editorial Quality</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Every story undergoes rigorous code review, testing, and formatting before publication to guarantee accuracy and practical utility.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-[#D80408]">
                <Heart size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F172A]">Community First</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                We foster open discussions, welcoming reader feedback, community contributions, and constructive technical debates.
              </p>
            </motion.div>
          </div>

          {/* Team Members Section */}
          <div className="mb-20">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="font-serif text-3xl font-bold text-[#0F172A]">Meet Our Editorial Team</h2>
              <p className="text-sm text-[#64748B]">Industry veterans and passionate technical writers crafting stories daily.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-4 shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300"
                  alt="Editor in Chief"
                  className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-cyan-50"
                />
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#0F172A]">Alex Morgan</h4>
                  <p className="text-xs text-[#D80408] font-semibold uppercase tracking-wider">Editor-in-Chief</p>
                </div>
                <p className="text-xs text-[#64748B]">Full-stack architect with 12+ years of experience in distributed systems and React ecosystems.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-4 shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300"
                  alt="Lead Designer"
                  className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-cyan-50"
                />
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#0F172A]">Sophia Lin</h4>
                  <p className="text-xs text-[#D80408] font-semibold uppercase tracking-wider">Head of Design</p>
                </div>
                <p className="text-xs text-[#64748B]">UI/UX Lead specializing in accessibility, motion design, and enterprise SaaS design systems.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-4 shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300"
                  alt="Senior Technical Writer"
                  className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-cyan-50"
                />
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#0F172A]">Marcus Vance</h4>
                  <p className="text-xs text-[#D80408] font-semibold uppercase tracking-wider">Senior Tech Writer</p>
                </div>
                <p className="text-xs text-[#64748B]">Cloud architecture specialist writing in-depth tutorials on Next.js, Supabase, and DevOps pipelines.</p>
              </div>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="max-w-2xl mx-auto">
            <NewsletterWidget />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
export default AboutPage;
