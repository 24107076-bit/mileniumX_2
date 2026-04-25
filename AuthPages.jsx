import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

// Mock user store
const MOCK_USERS = [
  { email: 'demo@mileniumx.com', password: 'milenium123', name: 'Demo User' },
];

export function LoginPage({ onSuccess, onSignup, onBack }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }

    setLoading(true);
    
    if (email === 'demo@mileniumx.com' && password === 'milenium123') {
      await new Promise(r => setTimeout(r, 600));
      onSuccess({ name: 'Demo User', email });
      return;
    }

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const name = data.user.user_metadata?.name || 'MileniumX User';
    onSuccess({ name, email });
  };

  return (
    <div className="auth-page">
      {/* Left — promo panel */}
      <div className="auth-left">
        <div className="auth-promo">
          <div className="auth-promo-logo">
            <div className="land-nav-logo-icon">M</div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>Milenium<span style={{ color: 'var(--indigo)' }}>X</span></span>
          </div>
          <h2 className="auth-promo-title">
            Welcome<br />back to your<br /><span className="grad">wealth engine.</span>
          </h2>
          <p className="auth-promo-sub">
            Your milestones, projections, and AI insights are waiting.
            Log in to pick up exactly where you left off.
          </p>
          <div className="auth-promo-features">
            {[
              { icon: '📈', cls: 'feat-icon-indigo', label: 'Live net worth projection up to age 85' },
              { icon: '🎯', cls: 'feat-icon-amber',  label: 'Goal tracker with inflation-adjusted costs' },
              { icon: '🤖', cls: 'feat-icon-teal',   label: 'AI copilot with Debt Avalanche strategy' },
              { icon: '🎲', cls: 'feat-icon-purple', label: 'Monte Carlo probability analysis' },
            ].map((f, i) => (
              <div className="auth-promo-feat" key={i}>
                <div className={`auth-promo-feat-icon ${f.cls}`}>{f.icon}</div>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="auth-right">
        <div className="auth-form-box">
          {/* Back */}
          <button className="btn btn-sm" style={{ marginBottom: '28px' }} onClick={onBack}>
            ← Back to Home
          </button>

          <h1 className="auth-form-title">Sign In</h1>
          <p className="auth-form-sub">
            Don't have an account?{' '}
            <span className="auth-form-link" onClick={onSignup}>Create one free →</span>
          </p>

          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <input
                className={`auth-input ${error ? 'error' : ''}`}
                type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} autoFocus
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                className={`auth-input ${error ? 'error' : ''}`}
                type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              className="btn btn-primary" type="submit"
              style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: '4px' }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">or continue with</div>

          {/* Demo quick-login */}
          <button
            className="btn"
            style={{ width: '100%', padding: '13px', marginBottom: '8px' }}
            onClick={() => { setEmail('demo@mileniumx.com'); setPassword('milenium123'); }}
          >
            🪄 Fill Demo Credentials
          </button>

          <p className="auth-terms">
            By signing in you agree to our <a>Terms of Service</a> and <a>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Signup Page ──────────────────────────────────────────────────────────
const CITIES       = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Other'];
const PROFESSIONS  = ['Software Engineer', 'Doctor', 'Lawyer', 'Business Owner', 'Banker', 'Entrepreneur', 'Government Officer', 'Other'];
const RISK_OPTIONS = ['Conservative', 'Moderate', 'Aggressive', 'Very Aggressive'];

export function SignupPage({ onSuccess, onLogin, onBack }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    age: '', city: 'Mumbai', profession: 'Software Engineer',
    company: '', ctc: '', riskProfile: 'Moderate',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Enter a valid email';
    if (form.password.length < 8)  e.password = 'Min 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.age || Number(form.age) < 18 || Number(form.age) > 80) e.age = 'Enter a valid age (18-80)';
    if (!form.ctc || Number(form.ctc) < 100000) e.ctc = 'Enter a valid annual CTC';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          age: form.age,
          city: form.city,
          profession: form.profession,
          company: form.company,
          ctc: form.ctc,
          riskProfile: form.riskProfile
        }
      }
    });

    if (error) {
      setErrors({ ctc: error.message }); // Just show error at the bottom
      setLoading(false);
      return;
    }

    onSuccess({
      name:         form.name,
      email:        form.email,
      age:          Number(form.age),
      city:         form.city,
      profession:   form.profession,
      company:      form.company,
      ctc:          Number(form.ctc),
      riskProfile:  form.riskProfile,
    });
  };

  return (
    <div className="auth-page">
      {/* Left */}
      <div className="auth-left">
        <div className="auth-promo">
          <div className="auth-promo-logo">
            <div className="land-nav-logo-icon">M</div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>Milenium<span style={{ color: 'var(--indigo)' }}>X</span></span>
          </div>
          <h2 className="auth-promo-title">
            Start your<br />journey to<br /><span className="grad">financial freedom.</span>
          </h2>
          <p className="auth-promo-sub">
            Create your account in 2 minutes. Your profile powers a personalised
            simulation — from today's salary to your retirement corpus.
          </p>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '32px' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: step >= s ? 'linear-gradient(135deg, var(--indigo), var(--teal))' : 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.85rem',
                  color: step >= s ? '#fff' : 'var(--text-3)',
                  transition: 'all 0.3s',
                }}>
                  {s}
                </div>
                <span style={{ fontSize: '0.82rem', color: step >= s ? 'var(--text-1)' : 'var(--text-3)', fontWeight: step >= s ? 600 : 400 }}>
                  {s === 1 ? 'Account' : 'Profile'}
                </span>
                {s < 2 && <div style={{ width: 24, height: 1, background: step >= 2 ? 'var(--indigo)' : 'var(--border)' }} />}
              </div>
            ))}
          </div>

          <div className="auth-promo-features">
            {[
              { icon: '🔒', cls: 'feat-icon-green',  label: 'Your data never leaves your device' },
              { icon: '⚡', cls: 'feat-icon-indigo', label: 'Instant personalised simulation' },
              { icon: '🎯', cls: 'feat-icon-amber',  label: 'AI-driven milestone planning' },
            ].map((f, i) => (
              <div className="auth-promo-feat" key={i}>
                <div className={`auth-promo-feat-icon ${f.cls}`}>{f.icon}</div>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="auth-right">
        <div className="auth-form-box">
          <button className="btn btn-sm" style={{ marginBottom: '28px' }} onClick={onBack}>
            ← Back to Home
          </button>

          {step === 1 ? (
            <>
              <h1 className="auth-form-title">Create Account</h1>
              <p className="auth-form-sub">
                Already registered?{' '}
                <span className="auth-form-link" onClick={onLogin}>Sign in →</span>
              </p>

              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <input className={`auth-input ${errors.name ? 'error' : ''}`}
                  placeholder="Example Plan" value={form.name}
                  onChange={e => up('name', e.target.value)} autoFocus />
                {errors.name && <div className="auth-error">{errors.name}</div>}
              </div>
              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <input className={`auth-input ${errors.email ? 'error' : ''}`}
                  type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => up('email', e.target.value)} />
                {errors.email && <div className="auth-error">{errors.email}</div>}
              </div>
              <div className="auth-grid-2">
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <input className={`auth-input ${errors.password ? 'error' : ''}`}
                    type="password" placeholder="Min 8 chars" value={form.password}
                    onChange={e => up('password', e.target.value)} />
                  {errors.password && <div className="auth-error">{errors.password}</div>}
                </div>
                <div className="auth-field">
                  <label className="auth-label">Confirm Password</label>
                  <input className={`auth-input ${errors.confirm ? 'error' : ''}`}
                    type="password" placeholder="Repeat" value={form.confirm}
                    onChange={e => up('confirm', e.target.value)} />
                  {errors.confirm && <div className="auth-error">{errors.confirm}</div>}
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleNext}
                style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: '8px' }}>
                Continue →
              </button>

              <p className="auth-terms">
                By creating an account you agree to our <a>Terms</a> and <a>Privacy Policy</a>
              </p>
            </>
          ) : (
            <>
              <h1 className="auth-form-title">Your Financial Profile</h1>
              <p className="auth-form-sub">This powers your personalised simulation.</p>

              <div className="auth-grid-2">
                <div className="auth-field">
                  <label className="auth-label">Age</label>
                  <input className={`auth-input ${errors.age ? 'error' : ''}`}
                    type="number" placeholder="28" value={form.age}
                    onChange={e => up('age', e.target.value)} autoFocus />
                  {errors.age && <div className="auth-error">{errors.age}</div>}
                </div>
                <div className="auth-field">
                  <label className="auth-label">City</label>
                  <select className="auth-input" value={form.city} onChange={e => up('city', e.target.value)}>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">Profession</label>
                <select className="auth-input" value={form.profession}
                  onChange={e => up('profession', e.target.value)}>
                  {PROFESSIONS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="auth-field">
                <label className="auth-label">Company / Employer (optional)</label>
                <input className="auth-input" placeholder="e.g. Infosys, HDFC" value={form.company}
                  onChange={e => up('company', e.target.value)} />
              </div>
              <div className="auth-grid-2">
                <div className="auth-field">
                  <label className="auth-label">Annual CTC (₹)</label>
                  <input className={`auth-input ${errors.ctc ? 'error' : ''}`}
                    type="number" placeholder="1200000" value={form.ctc}
                    onChange={e => up('ctc', e.target.value)} />
                  {errors.ctc && <div className="auth-error">{errors.ctc}</div>}
                </div>
                <div className="auth-field">
                  <label className="auth-label">Risk Profile</label>
                  <select className="auth-input" value={form.riskProfile}
                    onChange={e => up('riskProfile', e.target.value)}>
                    {RISK_OPTIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn" style={{ flex: 1, padding: '13px' }}
                  onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 2, padding: '13px', fontSize: '0.95rem' }}
                  onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating account…' : '🚀 Start Simulating'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
