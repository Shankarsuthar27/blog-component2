import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { supabase } from '../lib/supabase/client';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Newspaper,
  Users,
  TrendingUp,
  BadgeCheck,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Jalore News',
  'Rajasthan Local',
  'Crime & Police',
  'Politics & Governance',
  'Education & Schools',
  'Weather & Environment',
  'Business & Mandi',
  'Sports & Youth',
  'Culture & Events',
];

export const BecomeAgentPage: React.FC = () => {
  const navigate = useNavigate();

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('Jalore');
  const [state, setState] = useState('Rajasthan');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [experience, setExperience] = useState('');
  const [motivation, setMotivation] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // UI & Password Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Loading State
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto fill details if user is signed in with Google / Supabase
  useEffect(() => {
    const autofillUserSession = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const u = data.user;
          const meta = u.user_metadata || {};
          if (meta.full_name || meta.name) setFullName(meta.full_name || meta.name || '');
          if (u.email) setEmail(u.email);
        }
      } catch (err) {
        console.error('Session autofill error:', err);
      }
    };
    autofillUserSession();
  }, []);

  // Google OAuth Initiator
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/become-an-agent`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err?.message || 'Google Sign-In failed.');
      setGoogleLoading(false);
    }
  };

  // Validation Check
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) newErrors.email = 'Valid email address required';

    const phoneClean = phone.replace(/[^\d+]/g, '');
    if (!phone.trim() || phoneClean.length < 10) newErrors.phone = 'Valid 10-digit mobile number required';

    if (!city.trim()) newErrors.city = 'City/location is required';

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please resolve validation errors before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      let authUserId: string | null = null;

      // 1. Create Supabase Auth user account if not signed in already
      const { data: existingUser } = await supabase.auth.getUser();
      if (existingUser?.user) {
        authUserId = existingUser.user.id;
      } else {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              role: 'user',
            },
          },
        });

        if (signUpErr && !signUpErr.message.includes('already registered')) {
          console.warn('Auth signup notice:', signUpErr.message);
        }
        if (signUpData?.user) {
          authUserId = signUpData.user.id;
        }
      }

      // 2. Insert into agent_requests table in Supabase
      const payload = {
        user_id: authUserId,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        city: city.trim(),
        district: district.trim(),
        state: state.trim(),
        news_category: category,
        experience: experience.trim() || 'Community reporter',
        motivation: motivation.trim() || null,
        status: 'pending',
      };

      const { error: insertErr } = await supabase.from('agent_requests').insert([payload]);

      if (insertErr) {
        if (insertErr.code === 'PGRST205' || insertErr.message.includes('agent_requests')) {
          toast.error(
            'Supabase table "agent_requests" is not created yet. Please execute supabase/agent_schema.sql in your Supabase SQL Editor.',
            { duration: 8000 }
          );
        } else {
          throw insertErr;
        }
      }

      setSubmitted(true);
      toast.success('Agent application submitted successfully!');
    } catch (err: any) {
      console.error('Submission failed:', err);
      toast.error(err?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] relative overflow-hidden text-slate-800">
      {/* Background subtle technical grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none z-0" />

      <Header />

      <main className="flex-grow pt-24 pb-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Success State View */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={44} />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-3xl font-bold text-slate-900">Application Submitted</h2>
                <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                  Your application has been submitted successfully. Our admin team will review your application and notify you once a decision has been made.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-xs text-slate-600 text-left space-y-1.5 font-mono">
                <p>✓ Status: <strong className="text-amber-600">Pending Admin Review</strong></p>
                <p>✓ Email: <span className="font-bold text-slate-900">{email}</span></p>
                <p>✓ Applicant: <span className="font-bold text-slate-900">{fullName}</span></p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-2xl shadow-md transition cursor-pointer"
                >
                  Back to Home
                </button>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="w-full sm:w-auto px-6 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-2xl transition cursor-pointer"
                >
                  Submit Another Application
                </button>
              </div>
            </motion.div>
          ) : (
            /* Main Two-Column Desktop Grid Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* ── LEFT CARD: Registration Form ─────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6"
              >
                {/* Form Header */}
                <div className="border-b border-slate-100 pb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-50 text-[#0891B2] border border-cyan-200 mb-2">
                    <Sparkles size={12} /> News Agent Network
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                    Become an Agent
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Join our network and contribute news, stories and local updates.
                  </p>
                </div>

                {/* Google Sign-In Autofill Button */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    className="w-full py-3.5 px-4 border border-slate-200 rounded-2xl shadow-2xs bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
                  >
                    {googleLoading ? (
                      <Loader2 size={16} className="animate-spin text-[#0891B2]" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">or</span>
                  </div>
                </div>

                {/* Main Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {/* Full Name */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (errors.fullName) setErrors({ ...errors, fullName: '' });
                        }}
                        placeholder="Enter your full name"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50/70 border rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition ${
                          errors.fullName ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {errors.fullName && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        placeholder="Enter your email address"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50/70 border rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition ${
                          errors.email ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.email}</p>}
                  </div>

                  {/* Mobile Number & City / Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (errors.phone) setErrors({ ...errors, phone: '' });
                          }}
                          placeholder="Enter your mobile number"
                          className={`w-full pl-10 pr-4 py-3 bg-slate-50/70 border rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition ${
                            errors.phone ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200'
                          }`}
                        />
                      </div>
                      {errors.phone && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        City / Location *
                      </label>
                      <div className="relative">
                        <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value);
                            if (errors.city) setErrors({ ...errors, city: '' });
                          }}
                          placeholder="Enter your city or location"
                          className={`w-full pl-10 pr-4 py-3 bg-slate-50/70 border rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition ${
                            errors.city ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200'
                          }`}
                        />
                      </div>
                      {errors.city && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.city}</p>}
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors({ ...errors, password: '' });
                        }}
                        placeholder="Create a password"
                        className={`w-full pl-10 pr-10 py-3 bg-slate-50/70 border rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition ${
                          errors.password ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                        }}
                        placeholder="Confirm your password"
                        className={`w-full pl-10 pr-10 py-3 bg-slate-50/70 border rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition ${
                          errors.confirmPassword ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.confirmPassword}</p>}
                  </div>

                  {/* District & State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        District
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Jalore"
                        className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900 transition"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        State
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Rajasthan"
                        className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900 transition"
                      />
                    </div>
                  </div>

                  {/* News Category Selection */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Preferred Reporting Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900 transition"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Reporting Experience & Motivation */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Prior Reporting Experience (Optional)
                    </label>
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. 2 years local newspaper reporter / Freelancer"
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Why do you want to become an agent? (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      placeholder="Tell us about your local network or news reporting plans..."
                      className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900 transition resize-none"
                    />
                  </div>

                  {/* Terms Acceptance */}
                  <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-[11px] text-slate-500 leading-snug">
                      I agree to the terms of service and editorial reporting guidelines for Daily Bharat News Agents.
                    </span>
                  </label>
                  {errors.terms && <p className="text-[11px] text-rose-500 font-semibold">{errors.terms}</p>}

                  {/* Dark Charcoal Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-bold text-xs rounded-2xl shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-4"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-cyan-400" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Apply to Become an Agent</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Login Link */}
                <div className="pt-4 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500">
                    Already an agent?{' '}
                    <Link to="/agent/login" className="font-bold text-slate-900 underline hover:text-black">
                      Login
                    </Link>
                  </p>
                </div>
              </motion.div>

              {/* ── RIGHT CARD: Agent Network Benefits ─────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6"
              >
                {/* Header */}
                <div className="border-b border-slate-100 pb-5">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                    Become Part of Our Network
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Share local stories. Reach more people. Grow with us.
                  </p>
                </div>

                {/* 4 Feature Boxes (Matching reference button cards aesthetic) */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-slate-200/70 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition flex items-start gap-3.5 group">
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200/60 text-[#0891B2] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Newspaper size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Publish Local News</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Share verified local news, events and important updates.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200/70 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition flex items-start gap-3.5 group">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Users size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Build Your Audience</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Reach readers through our growing news platform.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200/70 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition flex items-start gap-3.5 group">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Track Your Performance</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Monitor your articles, views and engagement.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200/70 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition flex items-start gap-3.5 group">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <BadgeCheck size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Become a Verified Agent</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Get an official agent profile after approval.
                      </p>
                    </div>
                  </div>
                </div>

                {/* What happens after you apply? 3-Step Process */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    What happens after you apply?
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-xs">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">Submit Application</p>
                        <p className="text-[11px] text-slate-500">Provide your personal and location details.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">Admin Review</p>
                        <p className="text-[11px] text-slate-500">Our admin team reviews your application.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">Get Approved</p>
                        <p className="text-[11px] text-slate-500">Once approved, log in as an agent and start publishing.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Card Footer Link */}
                <div className="pt-2 text-center border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Want to know more?{' '}
                    <a href="#about-agent" onClick={(e) => { e.preventDefault(); toast('News agents report authentic local stories and receive official verified credentials.', { icon: 'ℹ️' }); }} className="font-bold text-slate-900 underline hover:text-black">
                      Learn about becoming an agent
                    </a>
                  </p>
                </div>
              </motion.div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};
export default BecomeAgentPage;
