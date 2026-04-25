import React, { useRef, useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import PixelCard from '../components/PixelCard';
import { supabase } from '../lib/supabase';

const FEATURES = [
  {
    icon: '⚡', variant: 'indigo',
    title: 'Forward Simulation Engine',
    desc: 'Year-by-year compounding that correctly deducts each milestone cost at its target age, reducing the compounding base for every subsequent milestone. No shortcut formula.',
  },
  {
    icon: '🎲', variant: 'teal',
    title: 'Monte Carlo Cone',
    desc: 'Toggle probability bands (+3/+2/+1% to -1/-2/-3%) to visualise best-case and worst-case wealth trajectories across your lifetime.',
  },
  {
    icon: '🤖', variant: 'purple',
    title: 'AI Debt & Wealth Copilot',
    desc: 'AI analyses your savings rate, outstanding loans, and retirement corpus — recommending Debt Avalanche or Snowball strategy with exact EMI breakdowns.',
  },
  {
    icon: '🎯', variant: 'amber',
    title: 'Life Milestone Tracker',
    desc: 'Set goals (Home, Car, Education, Travel) with today\'s cost. The engine inflation-adjusts each one and calculates your exact funded percentage in real time.',
  },
  {
    icon: '📊', variant: 'green',
    title: 'Return Glide Path',
    desc: 'Set aggressive, moderate, and conservative return rates for three life phases (20-40, 40-60, 60+) to model a realistic investment journey.',
  },
  {
    icon: '🏦', variant: 'red',
    title: 'EMI Auto-Converter',
    desc: 'Shortfalls automatically become Home, Car, or Personal loans with correctly computed EMIs deducted from ongoing savings month by month.',
  },
];

const STEPS = [
  {
    n: 1, title: 'Set Up Your Profile',
    desc: 'Enter your name, age, city, CTC, monthly expenses, and risk profile to personalise your simulation.',
  },
  {
    n: 2, title: 'Define Your Milestones',
    desc: 'Add life goals — Dream Home, Car, Education — with target age and today\'s cost. Choose loan types for shortfalls.',
  },
  {
    n: 3, title: 'Simulate & Optimise',
    desc: 'Get AI insights, adjust sliders in real-time, and see your net worth projection update instantly to reach financial freedom.',
  },
];

const TESTIMONIALS = [
  {
    text: 'MileniumX helped me realise I needed to save ₹15k more per month to afford my dream home without a massive loan. The inflation-adjusted projections are eye-opening.',
    name: 'Rahul Sharma', role: 'Software Engineer, Bengaluru', avatar: 'RS',
    color: 'linear-gradient(135deg, #6366f1, #a78bfa)',
  },
  {
    text: 'The AI Copilot recommended Debt Avalanche for my three active loans — the interest savings projection alone convinced me to restructure my entire repayment plan.',
    name: 'Priya Nair', role: 'Doctor, Mumbai', avatar: 'PN',
    color: 'linear-gradient(135deg, #14b8a6, #06b6d4)',
  },
  {
    text: 'Monte Carlo bands made me realise my retirement plan was fragile. After adjusting my step-up from 5% to 9%, even worst-case projections showed a solid corpus.',
    name: 'Karan Mehta', role: 'Entrepreneur, Delhi', avatar: 'KM',
    color: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  },
];

const STATS = [
  { val: '₹50Cr+', label: 'Wealth Projected by Users' },
  { val: '3',      label: 'Loan Types Supported'       },
  { val: '7',      label: 'Monte Carlo Scenarios'       },
  { val: '100%',   label: 'Free, No Account Needed'     },
];

export default function LandingPage({ onSuccess, onLogin, onSignup, onEnter }) {
  const featRef  = useRef(null);
  const howRef   = useRef(null);
  const [splineOk, setSplineOk] = useState(true);
  const [scrollY, setScrollY]   = useState(0);
  
  // Auth Form State
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleInlineLogin = async () => {
    setAuthError('');
    if (!email || !password) { setAuthError('Please fill in both fields.'); return; }
    
    setLoading(true);
    
    if (email === 'demo@mileniumx.com' && password === 'milenium123') {
      await new Promise(r => setTimeout(r, 600));
      if (onSuccess) onSuccess({ name: 'Demo User', email });
      return;
    } 

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return;
    }
    
    const name = data.user.user_metadata?.name || 'MileniumX User';
    if (onSuccess) onSuccess({ name, email });
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth' });

  // Map scroll to transform
  const splineTransform = `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.0002})`;
  const splineOpacity   = Math.max(0, 1 - scrollY / 800);

  return (
    <div className="landing-page">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="land-nav" style={{ 
        background: scrollY > 50 ? 'rgba(5,5,8,0.85)' : 'transparent',
        borderBottomColor: scrollY > 50 ? 'var(--border)' : 'transparent'
      }}>
        <div className="land-nav-logo">
          <div className="land-nav-logo-icon">M</div>
          Milenium<span style={{ color: 'var(--indigo)' }}>X</span>
        </div>
        <div className="land-nav-links">
          <span className="land-nav-link" onClick={() => scrollTo(featRef)}>Features</span>
          <span className="land-nav-link" onClick={() => scrollTo(howRef)}>How It Works</span>
          <span className="land-nav-link">About</span>
        </div>
        <div className="land-nav-actions">
          <button className="btn" onClick={onLogin}>Log In</button>
          <button className="btn btn-primary" onClick={onSignup}>Get Started Free</button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="land-hero">
        <div className="land-hero-spline" style={{ 
            transform: splineTransform, 
            opacity: splineOpacity,
            transition: 'transform 0.1s ease-out'
        }}>
          {/* Fallback gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99,102,241,0.2) 0%, transparent 60%)',
          }} />
          
          {splineOk && (
            <Spline
              scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
              onLoad={() => console.log("Spline Loaded")}
              onError={() => {
                  console.error("Spline Error Fallback");
                  setSplineOk(false);
              }}
              style={{ position: 'absolute', inset: 0 }}
            />
          )}
        </div>
        <div className="land-hero-overlay" />
        <div className="land-hero-content" style={{ 
          display: 'flex', 
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '60px', 
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'left',
          padding: '120px 20px 60px 20px'
        }}>
          <div style={{ flex: '1 1 500px', maxWidth: '650px' }}>
            <div className="land-hero-badge">
              <div className="land-hero-badge-dot" />
              MileniumX — AI-Powered Wealth Simulator
            </div>
            <h1 className="land-hero-title" style={{ textAlign: 'left', margin: '0 0 20px 0' }}>
              Your wealth.<br />
              <span className="grad">Reimagined by MileniumX.</span>
            </h1>
            <p className="land-hero-sub" style={{ textAlign: 'left', margin: '0 0 40px 0' }}>
              Model your entire financial life — salary, expenses, loans, milestones —
              and get AI-driven insights to optimise every rupee you earn.
              Free, real-time, and beautifully visual.
            </p>
            <div className="land-hero-ctas" style={{ justifyContent: 'flex-start' }}>
              <button className="btn btn-primary" onClick={onSignup} style={{ padding: '14px 32px', fontSize: '1rem' }}>
                Start Simulating Free
              </button>
            </div>
          </div>
          
          <div style={{
            flex: '0 1 400px',
            background: 'rgba(10, 10, 15, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '40px',
            borderRadius: '24px',
            backdropFilter: 'blur(30px)',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'left',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            animation: 'fadeSlideUp 0.8s ease'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Log In to MileniumX</h2>
            <p style={{ color: 'var(--text-2)', marginBottom: '24px', fontSize: '0.85rem' }}>Pick up exactly where you left off.</p>
            
            <div className="auth-field" style={{ marginBottom: '16px' }}>
              <label className="auth-label">Email Address</label>
              <input 
                className={`auth-input ${authError ? 'error' : ''}`} 
                type="email" 
                placeholder="demo@mileniumx.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="auth-field" style={{ marginBottom: '24px' }}>
              <label className="auth-label">Password</label>
              <input 
                className={`auth-input ${authError ? 'error' : ''}`} 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            
            {authError && <div className="auth-error" style={{ marginBottom: '16px' }}>{authError}</div>}
            
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginBottom: '16px' }} 
              onClick={handleInlineLogin}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            
            <button 
              className="btn" 
              style={{ width: '100%', color: 'var(--text-2)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }} 
              onClick={() => {
                setEmail('demo@mileniumx.com');
                setPassword('milenium123');
              }}
            >
              ✨ Fill Demo Credentials
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div style={{ padding: '0 60px' }}>
        <div className="stats-row">
          {STATS.map((s, i) => (
            <div className="stat-block" key={i}>
              <div className="stat-block-val" style={{ color: ['var(--indigo)','var(--teal)','var(--green)','var(--amber)'][i] }}>{s.val}</div>
              <div className="stat-block-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="land-section" ref={featRef}>
        <div className="land-section-label">What's Inside</div>
        <h2 className="land-section-title">Every tool you need to<br />engineer your financial future</h2>
        <p className="land-section-sub">
          Built with the same rigour as institutional financial models — but designed for
          every Indian professional to understand and act on.
        </p>
        <div className="feat-grid">
          {FEATURES.map((f, i) => (
            <PixelCard
              key={i}
              variant={f.variant}
              style={{ width: '100%', height: '240px' }}
            >
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                padding: '28px', justifyContent: 'flex-end',
                background: 'linear-gradient(to top, rgba(5,5,8,0.98) 40%, rgba(5,5,8,0.4) 100%)',
                borderRadius: '16px',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            </PixelCard>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section ref={howRef} style={{ padding: '0 60px 100px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="land-section-label">How It Works</div>
          <h2 className="land-section-title" style={{ marginBottom: '50px' }}>Up and running in 3 steps</h2>
          <div className="steps-row">
            {STEPS.map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────── */}
      <section className="land-section" style={{ paddingTop: 0 }}>
        <div className="land-section-label">Real Stories</div>
        <h2 className="land-section-title" style={{ marginBottom: '50px' }}>
          Trusted by professionals<br />across India
        </h2>
        <div className="test-grid">
          {TESTIMONIALS.map((t, i) => (
            <div className="test-card" key={i}>
              <div className="test-stars">★★★★★</div>
              <div className="test-text">"{t.text}"</div>
              <div className="test-author">
                <div className="test-avatar" style={{ background: t.color }}>{t.avatar}</div>
                <div>
                  <div className="test-name">{t.name}</div>
                  <div className="test-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <div className="cta-banner">
        <h2>Ready to take control<br />of your financial future?</h2>
        <p>Join thousands of professionals simulating smarter wealth decisions.</p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onSignup} style={{ padding: '14px 40px', fontSize: '1rem' }}>
            Create Free Account
          </button>
          <button className="btn" onClick={onEnter} style={{ padding: '14px 40px', fontSize: '1rem' }}>
            Try Without Account →
          </button>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="land-footer">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div className="land-nav-logo-icon" style={{ width: 28, height: 28, fontSize: '0.8rem' }}>M</div>
            <span style={{ fontWeight: 700 }}>MileniumX</span>
          </div>
          <div className="land-footer-copy">© 2026 MileniumX. All rights reserved.</div>
        </div>
        <div className="land-footer-links">
          <span className="land-footer-link">Privacy Policy</span>
          <span className="land-footer-link">Terms of Service</span>
          <span className="land-footer-link">Contact</span>
        </div>
      </footer>
    </div>
  );
}
