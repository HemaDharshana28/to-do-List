import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SidebarGames from '../components/SidebarGames';

const QUOTES = [
  { text: "The secret of getting ahead is getting started.",    author: "Mark Twain"        },
  { text: "Done is better than perfect.",                       author: "Sheryl Sandberg"   },
  { text: "Focus on being productive instead of busy.",         author: "Tim Ferriss"        },
  { text: "Action is the foundational key to all success.",     author: "Pablo Picasso"     },
  { text: "Your future is created by what you do today.",       author: "Robert Kiyosaki"   },
  { text: "Small daily improvements lead to stunning results.", author: "Robin Sharma"      },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form,     setForm]     = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [fadeQ,    setFadeQ]    = useState(true);

  useEffect(() => {
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length));
    const id = setInterval(() => {
      setFadeQ(false);
      setTimeout(() => { setQuoteIdx(i => (i + 1) % QUOTES.length); setFadeQ(true); }, 500);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const quote = QUOTES[quoteIdx];

  return (
    <div className="min-h-screen flex font-body" style={{ background: '#fdf9f2' }}>

      {/* ── Left luxury panel ── */}
      <div className="hidden lg:flex flex-col w-[460px] panel-gradient p-10 relative">
        {/* Floating orbs */}
        <div className="absolute top-20 right-10 w-36 h-36 rounded-full pointer-events-none animate-float"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.2), transparent)', filter: 'blur(24px)' }} />
        <div className="absolute bottom-32 left-6 w-28 h-28 rounded-full pointer-events-none animate-float"
          style={{ background: 'radial-gradient(circle, rgba(245,208,32,0.15), transparent)', filter: 'blur(18px)', animationDelay: '2s' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8860b)', boxShadow: '0 4px 12px rgba(184,134,11,0.4)' }}>
            <Crown className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-display font-bold text-xl gold-shimmer">TaskFlow</span>
        </div>

        {/* Rotating quote */}
        <div className="relative z-10 mb-6 p-5 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(212,175,55,0.18)',
            backdropFilter: 'blur(8px)',
            transition: 'opacity 0.5s ease',
            opacity: fadeQ ? 1 : 0,
          }}>
          <span className="text-2xl mb-2 block" style={{ color: 'rgba(212,175,55,0.6)' }}>"</span>
          <p className="text-white font-display font-medium text-base leading-snug mb-3">{quote.text}</p>
          <p className="text-xs tracking-wide" style={{ color: 'rgba(212,175,55,0.5)' }}>— {quote.author}</p>
        </div>

        {/* ── GAMES ── */}
        <div className="relative z-10 flex-1">
          <SidebarGames />
        </div>

        <p className="relative z-10 mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>© 2026 TaskFlow. All rights reserved.</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-slide-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #d4af37, #b8860b)' }}>
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold" style={{ color: '#1a1404' }}>TaskFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#1a1404' }}>Welcome back 👋</h1>
            <p className="text-sm" style={{ color: '#7a6835' }}>Your tasks are waiting. Let's make today count.</p>
          </div>

          {/* Mobile quote */}
          <div className="lg:hidden mb-6 p-4 rounded-xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(184,134,11,0.04))',
              borderColor: 'rgba(212,175,55,0.2)',
              transition: 'opacity 0.5s', opacity: fadeQ ? 1 : 0,
            }}>
            <p className="text-sm font-medium italic" style={{ color: '#3d3010' }}>"{quote.text}"</p>
            <p className="text-xs mt-1" style={{ color: '#b09f65' }}>— {quote.author}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d3010' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d3010' }}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#b09f65' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" /> Signing in...</>
                : <>Sign in <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#7a6835' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-bold transition-colors" style={{ color: '#b8860b' }}
              onMouseEnter={e => e.target.style.color = '#9a6f08'}
              onMouseLeave={e => e.target.style.color = '#b8860b'}>
              Create one free
            </Link>
          </p>

          <p className="mt-8 text-center text-xs" style={{ color: '#b09f65' }}>
            ✦ Every great journey starts with a single task ✦
          </p>
        </div>
      </div>
    </div>
  );
}
