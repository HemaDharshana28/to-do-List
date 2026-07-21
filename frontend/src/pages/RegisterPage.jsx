import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Crown, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PERKS = [
  { emoji: '🎯', text: 'Set priorities that actually matter' },
  { emoji: '⚡', text: 'Move fast, stay organized' },
  { emoji: '🏆', text: 'Celebrate every win, big or small' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form,     setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      toast.success('✨ Welcome to TaskFlow! Your golden era starts now.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-body relative"
      style={{ background: '#fdf9f2' }}>
      {/* Background glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(212,175,55,0.07) 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at bottom left, rgba(184,134,11,0.05) 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm relative animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8860b)', boxShadow: '0 4px 12px rgba(184,134,11,0.35)' }}>
            <Crown className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-display font-bold text-xl" style={{ color: '#1a1404' }}>TaskFlow</span>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#1a1404' }}>Let's get you started 🚀</h1>
          <p className="text-sm" style={{ color: '#7a6835' }}>Your most productive self is one step away.</p>
        </div>

        {/* Perks card */}
        <div className="mb-6 p-4 rounded-2xl border"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(184,134,11,0.04))',
            borderColor: 'rgba(212,175,55,0.2)',
          }}>
          {PERKS.map(p => (
            <div key={p.text} className="flex items-center gap-2.5 text-sm py-1" style={{ color: '#3d3010' }}>
              <span className="text-base">{p.emoji}</span>
              <span>{p.text}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d3010' }}>Full name</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className={`input-field ${errors.name ? 'border-red-400' : ''}`} placeholder="Jane Doe" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d3010' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className={`input-field ${errors.email ? 'border-red-400' : ''}`} placeholder="you@example.com" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d3010' }}>Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                placeholder="At least 6 characters" />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#b09f65' }}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d3010' }}>Confirm password</label>
            <input type="password" value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
              className={`input-field ${errors.confirm ? 'border-red-400' : ''}`} placeholder="Repeat your password" />
            {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" /> Creating account...</>
              : <>Create my account <ArrowRight className="w-4 h-4" /></>
            }
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: '#7a6835' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-bold" style={{ color: '#b8860b' }}>Sign in</Link>
        </p>

        <div className="mt-8 flex items-center justify-center gap-2">
          <Star className="w-3 h-3" style={{ color: '#d4af37' }} />
          <p className="text-xs" style={{ color: '#b09f65' }}>Join thousands achieving more every day</p>
          <Star className="w-3 h-3" style={{ color: '#d4af37' }} />
        </div>
      </div>
    </div>
  );
}
