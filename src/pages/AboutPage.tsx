import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Shield, Rocket, Users, Award, Heart, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-grow pt-28 pb-16">
        {/* Hero Section */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFEFF] text-[#0891B2] border border-[#CFFAFE]">
              <Sparkles size={13} /> Elevating Engineering & Design
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F172A] tracking-tight leading-tight">
              About <span className="text-[#0891B2]">Insight Journal</span>
            </h1>
            <p className="text-lg text-[#64748B] leading-relaxed">
              Insight Journal is an open-source technical platform dedicated to sharing high-quality software engineering guides, frontend architectures, UI design patterns, and cloud insights.
            </p>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-xs">
            <div className="text-center space-y-1">
              <p className="text-3xl md:text-4xl font-serif font-bold text-[#0891B2]">500+</p>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Published Articles</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl md:text-4xl font-serif font-bold text-[#0891B2]">120K+</p>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Monthly Readers</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl md:text-4xl font-serif font-bold text-[#0891B2]">50+</p>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Expert Authors</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl md:text-4xl font-serif font-bold text-[#0891B2]">99.9%</p>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Reader Satisfaction</p>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-20 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-serif text-3xl font-bold text-[#0F172A]">Core Architectural Values</h2>
            <p className="text-sm text-[#64748B]">What drives our editorial standard and technical excellence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 space-y-4 shadow-2xs hover:border-[#0891B2]/40 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#ECFEFF] text-[#0891B2] flex items-center justify-center border border-[#CFFAFE]">
                <Rocket size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F172A]">Cutting-Edge Tech</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Deep dives into modern frameworks including React 19, TypeScript, Next.js, Tailwind CSS v4, and distributed backend cloud infrastructure.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 space-y-4 shadow-2xs hover:border-[#0891B2]/40 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#ECFEFF] text-[#0891B2] flex items-center justify-center border border-[#CFFAFE]">
                <Shield size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F172A]">Zero Fluff</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Actionable code walkthroughs, production-tested solutions, and architecture diagrams tested in real-world scale applications.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 space-y-4 shadow-2xs hover:border-[#0891B2]/40 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#ECFEFF] text-[#0891B2] flex items-center justify-center border border-[#CFFAFE]">
                <Heart size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F172A]">Community First</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Open contributions, transparent moderation, and interactive discussions built for developer community growth.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-3xl p-10 md:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="space-y-3 text-center md:text-left">
              <h2 className="font-serif text-3xl font-bold">Ready to Start Writing?</h2>
              <p className="text-slate-300 text-sm max-w-xl">
                Access the CMS control panel to publish new technical guides and manage existing articles.
              </p>
            </div>
            <Link
              to="/admin/login"
              className="px-6 py-3 bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#0891B2]/30 hover:opacity-95 transition shrink-0"
            >
              Access Admin Panel
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
export default AboutPage;
