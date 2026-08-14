import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { ShieldCheck, Mail, Lock, LogIn, ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const AgentLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Verify if currently authenticated user has active agent account
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await verifyAndRedirectAgent(session.user.id);
      }
    };
    checkExistingSession();
  }, []);

  const verifyAndRedirectAgent = async (userId: string) => {
    try {
      // Check in agents table
      const { data: agentData } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (agentData && agentData.status === 'active') {
        toast.success(`Welcome back, ${agentData.full_name}!`);
        navigate('/agent/dashboard', { replace: true });
        return true;
      }

      // Also check profiles role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (profileData && (profileData.role === 'agent' || profileData.role === 'admin' || profileData.role === 'superadmin')) {
        navigate('/agent/dashboard', { replace: true });
        return true;
      }

      // If not an approved active agent
      setErrorMsg("You don't have an active agent account. Please apply to become a news agent.");
      return false;
    } catch {
      setErrorMsg("Failed to verify agent credentials.");
      return false;
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        const isAgent = await verifyAndRedirectAgent(data.user.id);
        if (!isAgent) {
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/agent/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google authentication failed.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="Daily Bharat" className="h-10 w-auto" />
          <span className="font-serif font-bold text-2xl text-[#0F172A]">
            Daily <span className="text-[#D80408]">Bharat</span>
          </span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-50 text-[#0891B2] border border-cyan-200 mb-3">
          <ShieldCheck size={14} /> Agent Portal Access
        </div>

        <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#0F172A]">
          Agent Sign In
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Authorized Ground Reporters & News Agents Only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200 space-y-6">

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-bold">{errorMsg}</p>
                {errorMsg.includes('apply') && (
                  <Link to="/become-agent" className="text-[#0891B2] underline font-bold mt-1 block">
                    Submit Agent Application →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Google OAuth Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3.5 px-4 border border-slate-200 rounded-2xl shadow-xs bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
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
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest absolute">or</span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5 uppercase tracking-wider">
                Agent Email *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@dailybharat.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0891B2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5 uppercase tracking-wider">
                Password *
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0891B2]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0891B2] to-[#0EA5E9] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#0891B2]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  <LogIn size={16} /> Agent Sign In
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Not registered as a News Agent yet?
            </p>
            <Link
              to="/become-agent"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D80408] hover:underline"
            >
              <Sparkles size={13} /> Become a News Agent →
            </Link>
          </div>

        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900">
            <ArrowLeft size={14} /> Back to Daily Bharat Website
          </Link>
        </div>
      </div>
    </div>
  );
};
export default AgentLoginPage;
