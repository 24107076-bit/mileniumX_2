import React, { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { SimulationProvider, useSimulation, DEFAULT_PARAMS, AGGRESSIVE_PARAMS } from './context/SimulationContext';
import WhatIfPanel      from './components/WhatIfPanel';
import MilestoneTracker from './components/MilestoneTracker';
import AIInsights       from './components/AIInsights';
import SettingsPage     from './components/SettingsPage';
import LandingPage      from './pages/LandingPage';
import { LoginPage, SignupPage } from './pages/AuthPages';
import CardSwap, { Card } from './components/CardSwap';
import { NetWorthChart, CashflowChart, MilestoneProgressChart } from './components/Charts';
import { supabase } from './lib/supabase';
import ChatWidget       from './components/ChatWidget';
import QuizPage         from './pages/QuizPage';
import './landing.css';

// ── Route types ─────────────────────────────────────────────────────────
// 'landing' | 'login' | 'signup' | 'app'

const fmt = (v) => {
  if (Math.abs(v) >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (Math.abs(v) >= 100000)   return `₹${(v / 100000).toFixed(1)}L`;
  if (Math.abs(v) >= 1000)     return `₹${(v / 1000).toFixed(0)}k`;
  return `₹${v.toLocaleString()}`;
};

// ── Window Panel with minimize ──────────────────────────────────────────
function WinPanel({ title, children, extra }) {
  const [min, setMin] = useState(false);
  return (
    <div className="window-panel">
      <div className="window-bar">
        <div className="window-dots">
          <div className="dot dot-red" />
          <div className="dot dot-yellow" onClick={() => setMin(v => !v)} title="Minimize" />
          <div className="dot dot-green" />
        </div>
        <div className="window-title">{title}</div>
        {extra && <div style={{ marginLeft: 'auto' }}>{extra}</div>}
      </div>
      {!min && <div className="window-body">{children}</div>}
    </div>
  );
}

// ── Nav config ─────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard',  icon: '⬡',  label: 'Dashboard'  },
  { id: 'analysis',   icon: '📊', label: 'Analysis'    },
  { id: 'milestones', icon: '🎯', label: 'Milestones'  },
  { id: 'ai',         icon: '🤖', label: 'AI Copilot'  },
  { id: 'quiz',       icon: '🎓', label: 'IQ Quiz'     },
  { id: 'settings',   icon: '⚙️', label: 'Settings'    },
];

// ── App Shell (authenticated) ───────────────────────────────────────────
function Shell({ onLogout, page, setPage }) {
  const { params, setParams, simulationResult, userProfile } = useSimulation();
  const [chart, setChart] = useState(0);
  const [view3D, setView3D] = useState(true);
  const [splineOk, setSplineOk] = useState(true);

  const lastPt   = simulationResult.timeline[simulationResult.timeline.length - 1];
  const retPt    = simulationResult.timeline.find(t => t.age === params.retirementAge);
  const savings  = params.monthlySalary - params.monthlyExpenses;
  const savingsR = ((savings / params.monthlySalary) * 100).toFixed(1);
  const loans    = simulationResult.loanTracking || [];

  const CHARTS = [
    { key: 'nw',   label: '📈 Net Worth',  activeClass: 'active-indigo', component: <NetWorthChart /> },
    { key: 'cash', label: '💰 Cashflow',    activeClass: 'active-teal',   component: <CashflowChart /> },
    { key: 'mile', label: '🎯 Milestones',  activeClass: 'active-amber',  component: <MilestoneProgressChart /> },
  ];

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">M</div>
          <div className="sidebar-logo-text">Milenium<span>X</span></div>
        </div>

        <div className="sidebar-section-label">Navigation</div>
        {NAV.map(n => (
          <div key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`}
            onClick={() => setPage(n.id)}>
            <span className="nav-icon">{n.icon}</span>
            {n.label}
            {n.id === 'ai' && loans.length > 0 &&
              <span className="nav-badge">{loans.length}</span>}
          </div>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: '8px' }}>Presets</div>
        <div className="nav-item" onClick={() => setParams(DEFAULT_PARAMS)}>
          <span className="nav-icon">👤</span> Default
        </div>
        <div className="nav-item" onClick={() => setParams(AGGRESSIVE_PARAMS)}>
          <span className="nav-icon">⚡</span> Aggressive
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => setPage('settings')}>
            <div className="sidebar-avatar">
              {userProfile.name ? userProfile.name[0].toUpperCase() : 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{userProfile.name}</div>
              <div className="sidebar-user-sub">{userProfile.profession}</div>
            </div>
          </div>
          <div className="nav-item" onClick={onLogout} style={{ marginTop: '6px', color: 'var(--red)' }}>
            <span className="nav-icon">↩</span> Log Out
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">
            {NAV.find(n => n.id === page)?.label}
            <span>/ MileniumX</span>
          </div>
          <div className="topbar-actions">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', paddingRight: '8px' }}>
              Age {params.currentAge} → {params.targetAge}
            </span>
            <button className="btn btn-sm btn-primary" onClick={() => setPage('settings')}>
              ⚙ Settings
            </button>
          </div>
        </div>

        <div className="page-area">

          {/* ━━ DASHBOARD ━━ */}
          {page === 'dashboard' && (
            <>
              <div className="spline-hero">
                <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
                <div className="spline-overlay">
                  <div className="spline-title">Milenium<span>X</span></div>
                  <div className="spline-sub">Your personal wealth simulation engine</div>
                </div>
              </div>

              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-label">Monthly Savings</div>
                  <div className="stat-value" style={{ color: savings >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(savings)}</div>
                  <div className="stat-pill pill-green">{savingsR}% rate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Net Worth Today</div>
                  <div className="stat-value" style={{ color: 'var(--indigo)' }}>{fmt(params.initialNetWorth)}</div>
                  <div className="stat-sub">Current corpus</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">At Retirement ({params.retirementAge})</div>
                  <div className="stat-value" style={{ color: 'var(--teal)' }}>{retPt ? fmt(retPt.netWorth) : '—'}</div>
                  <div className="stat-sub">Projected corpus</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">At Age {params.targetAge}</div>
                  <div className="stat-value" style={{ color: 'var(--amber)' }}>{lastPt ? fmt(lastPt.netWorth) : '—'}</div>
                  <div className="stat-sub">Final projection</div>
                </div>
              </div>

              <div className="dash-grid">
                <div className="dash-left">
                  <WinPanel title="Net Worth Projection"
                    extra={<button className="btn btn-sm" onClick={() => setPage('analysis')}>Full Analysis →</button>}>
                    <NetWorthChart />
                  </WinPanel>
                </div>
                <div className="dash-right">
                  <WinPanel title="Finance Variables">
                    <WhatIfPanel />
                  </WinPanel>
                </div>
              </div>
            </>
          )}

          {/* ━━ ANALYSIS ━━ */}
          {page === 'analysis' && (
            <>
              <div className="tab-bar">
                <div style={{ display: 'flex', gap: '8px' }}>
                  {CHARTS.map((c, i) => (
                    <button key={c.key}
                      className={`tab-btn ${chart === i ? c.activeClass : ''}`}
                      onClick={() => { setChart(i); setView3D(false); }}>
                      {c.label}
                    </button>
                  ))}
                </div>
                <button 
                  className={`btn btn-sm ${view3D ? 'btn-primary' : ''}`} 
                  onClick={() => setView3D(!view3D)}
                  style={{ marginLeft: 'auto' }}
                >
                  {view3D ? '📱 Grid View' : '🃏 3D Card Mode'}
                </button>
              </div>

              {view3D ? (
                <div style={{ height: '620px', position: 'relative', overflow: 'hidden', padding: '40px 0' }}>
                  <CardSwap cardDistance={100} verticalDistance={40} activeIndex={chart}>
                    <Card onClick={() => setChart(0)} style={{ border: chart === 0 ? '1px solid var(--indigo)' : '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="window-bar"><div className="window-title">Net Worth Projection</div></div>
                      <div className="window-body"><NetWorthChart /></div>
                    </Card>
                    <Card onClick={() => setChart(1)} style={{ border: chart === 1 ? '1px solid var(--teal)' : '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="window-bar"><div className="window-title">Monthly Cashflow</div></div>
                      <div className="window-body"><CashflowChart /></div>
                    </Card>
                    <Card onClick={() => setChart(2)} style={{ border: chart === 2 ? '1px solid var(--amber)' : '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="window-bar"><div className="window-title">Milestone Progress</div></div>
                      <div className="window-body"><MilestoneProgressChart /></div>
                    </Card>
                  </CardSwap>
                </div>
              ) : (
                <WinPanel title={CHARTS[chart].label}>{CHARTS[chart].component}</WinPanel>
              )}
              <div className="stat-grid" style={{ marginTop: '18px' }}>
                <div className="stat-card">
                  <div className="stat-label">Monthly Salary</div>
                  <div className="stat-value">{fmt(params.monthlySalary)}</div>
                  <div className="stat-sub">Take-home / mo</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Monthly Expenses</div>
                  <div className="stat-value" style={{ color: 'var(--amber)' }}>{fmt(params.monthlyExpenses)}</div>
                  <div className="stat-sub">Fixed + variable</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Annual Step-up</div>
                  <div className="stat-value" style={{ color: 'var(--green)' }}>{(params.annualStepUp * 100).toFixed(1)}%</div>
                  <div className="stat-sub">Income growth rate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Inflation Rate</div>
                  <div className="stat-value" style={{ color: 'var(--red)' }}>{(params.inflationRate * 100).toFixed(1)}%</div>
                  <div className="stat-sub">Annual erosion</div>
                </div>
              </div>
            </>
          )}

          {/* ━━ MILESTONES ━━ */}
          {page === 'milestones' && (
            <div className="dash-grid">
              <div className="dash-left">
                <WinPanel title="Milestone Progress"><MilestoneProgressChart /></WinPanel>
              </div>
              <div className="dash-right">
                <WinPanel title="Manage Goals"><MilestoneTracker /></WinPanel>
              </div>
            </div>
          )}

          {/* ━━ AI COPILOT ━━ */}
          {page === 'ai' && (
            <div className="dash-grid">
              <div className="dash-left">
                <WinPanel title="AI Debt & Wealth Analysis"><AIInsights /></WinPanel>
              </div>
              <div className="dash-right">
                <WinPanel title="Quick Adjustments"><WhatIfPanel /></WinPanel>
              </div>
            </div>
          )}

          {/* ━━ SETTINGS ━━ */}
          {page === 'settings' && <SettingsPage />}

          {/* ━━ QUIZ ━━ */}
          {page === 'quiz' && <QuizPage />}

        </div>
      </div>
    </div>
  );
}

// ── Root router ─────────────────────────────────────────────────────────
export default function App() {
  const [route, setRoute] = useState('landing'); // landing | login | signup | app
  const [authUser, setAuthUser] = useState(null);
  const [page, setPage] = useState('dashboard');

  const handleNavigate = (target) => {
    if (route === 'landing' || route === 'login' || route === 'signup') {
      if (['dashboard', 'analysis', 'milestones', 'ai', 'quiz'].includes(target)) {
        // AI trying to navigate while logged out -> show login
        setRoute('login');
      }
    }
    setPage(target);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthUser(session.user.user_metadata);
        setRoute('app');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthUser(session.user.user_metadata);
        setRoute('app');
      } else {
        setAuthUser(null);
        setRoute('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (user) => {
    setAuthUser(user);
    setRoute('app');
  };

  const handleSignupSuccess = (user) => {
    setAuthUser(user);
    setRoute('app');
  };

  // Authenticated app
  return (
    <SimulationProvider initialUser={authUser}>
      <div className="app-container">
        {route === 'landing' && (
          <LandingPage
            onSuccess={handleLoginSuccess}
            onLogin={() => setRoute('login')}
            onSignup={() => setRoute('signup')}
            onEnter={() => setRoute('app')}
          />
        )}
        {route === 'login' && (
          <LoginPage
            onSuccess={handleLoginSuccess}
            onSignup={() => setRoute('signup')}
            onBack={() => setRoute('landing')}
          />
        )}
        {route === 'signup' && (
          <SignupPage
            onSuccess={handleSignupSuccess}
            onLogin={() => setRoute('login')}
            onBack={() => setRoute('landing')}
          />
        )}
        {route === 'app' && (
          <Shell 
            onLogout={() => { supabase.auth.signOut(); }} 
            page={page} 
            setPage={setPage} 
          />
        )}
        <ChatWidget onNavigate={handleNavigate} />
      </div>
    </SimulationProvider>
  );
}
