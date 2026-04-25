import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';

const RISK_OPTIONS = ['Conservative', 'Moderate', 'Aggressive', 'Very Aggressive'];
const PROFESSIONS  = ['Software Engineer', 'Doctor', 'Lawyer', 'Business Owner', 'Banker', 'Entrepreneur', 'Government Officer', 'Other'];
const CITIES       = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Other'];

function Field({ label, children }) {
  return (
    <div className="settings-group">
      <label className="settings-label">{label}</label>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { userProfile, setUserProfile, params, updateParam } = useSimulation();
  const [saved, setSaved] = useState(false);

  const up = (key, val) => setUserProfile(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    // Sync age & salary back to simulation params
    updateParam('currentAge', Number(userProfile.age));
    updateParam('monthlySalary', Math.round(userProfile.ctc / 12));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth: '860px' }}>
      {/* Profile header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '20px',
        padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', marginBottom: '20px',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--indigo), var(--teal))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', fontWeight: 800, color: '#fff', flexShrink: 0,
        }}>
          {userProfile.name ? userProfile.name[0].toUpperCase() : 'U'}
        </div>
        <div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{userProfile.name || 'Your Name'}</div>
          <div style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>
            {userProfile.profession} · {userProfile.city} · Age {userProfile.age}
          </div>
          <div style={{ marginTop: '6px' }}>
            <span className="stat-pill pill-green">
              {userProfile.riskProfile} Risk
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="window-panel" style={{ marginBottom: '18px' }}>
        <div className="window-bar">
          <div className="window-dots">
            <div className="dot dot-red" />
            <div className="dot dot-yellow" />
            <div className="dot dot-green" />
          </div>
          <div className="window-title">Personal Information</div>
        </div>
        <div className="window-body">
          <div className="settings-grid">
            <Field label="Full Name">
              <input className="input-field" value={userProfile.name}
                onChange={e => up('name', e.target.value)} placeholder="Your name" />
            </Field>
            <Field label="Age">
              <input className="input-field" type="number" value={userProfile.age}
                onChange={e => up('age', e.target.value)} min={18} max={80} />
            </Field>
            <Field label="City">
              <select value={userProfile.city} onChange={e => up('city', e.target.value)}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Profession">
              <select value={userProfile.profession} onChange={e => up('profession', e.target.value)}>
                {PROFESSIONS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Company / Employer">
              <input className="input-field" value={userProfile.company}
                onChange={e => up('company', e.target.value)} placeholder="Company name" />
            </Field>
            <Field label="Risk Profile">
              <select value={userProfile.riskProfile} onChange={e => up('riskProfile', e.target.value)}>
                {RISK_OPTIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </div>

      {/* Financial Details */}
      <div className="window-panel" style={{ marginBottom: '18px' }}>
        <div className="window-bar">
          <div className="window-dots">
            <div className="dot dot-red" />
            <div className="dot dot-yellow" />
            <div className="dot dot-green" />
          </div>
          <div className="window-title">Financial Details</div>
        </div>
        <div className="window-body">
          <div className="settings-grid">
            <Field label="Annual CTC / Salary (₹)">
              <input className="input-field" type="number" value={userProfile.ctc}
                onChange={e => up('ctc', Number(e.target.value))} step={50000} />
            </Field>
            <Field label="Monthly Take-Home (~70% of CTC)">
              <input className="input-field" type="number"
                value={Math.round(userProfile.ctc * 0.7 / 12)} readOnly
                style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </Field>
            <Field label="Monthly Expenses (₹)">
              <input className="input-field" type="number" value={params.monthlyExpenses}
                onChange={e => updateParam('monthlyExpenses', Number(e.target.value))} step={1000} />
            </Field>
            <Field label="Current Net Worth / Savings (₹)">
              <input className="input-field" type="number" value={params.initialNetWorth}
                onChange={e => updateParam('initialNetWorth', Number(e.target.value))} step={10000} />
            </Field>
            <Field label="Target Retirement Age">
              <input className="input-field" type="number"
                value={userProfile.retirementGoal}
                onChange={e => { up('retirementGoal', Number(e.target.value)); updateParam('retirementAge', Number(e.target.value)); }}
                min={40} max={75} />
            </Field>
            <Field label="Annual Salary Growth (%)">
              <input className="input-field" type="number"
                value={(params.annualStepUp * 100).toFixed(1)}
                onChange={e => updateParam('annualStepUp', Number(e.target.value) / 100)}
                step={0.5} min={0} max={30} />
            </Field>
          </div>
        </div>
      </div>

      {/* Simulation Parameters */}
      <div className="window-panel" style={{ marginBottom: '18px' }}>
        <div className="window-bar">
          <div className="window-dots">
            <div className="dot dot-red" />
            <div className="dot dot-yellow" />
            <div className="dot dot-green" />
          </div>
          <div className="window-title">Simulation Parameters</div>
        </div>
        <div className="window-body">
          <div className="settings-grid">
            <Field label="Inflation Rate (%)">
              <input className="input-field" type="number"
                value={(params.inflationRate * 100).toFixed(1)}
                onChange={e => updateParam('inflationRate', Number(e.target.value) / 100)}
                step={0.5} min={0} max={15} />
            </Field>
            <Field label="Capital Gains Tax (%)">
              <input className="input-field" type="number"
                value={(params.capitalGainsTaxRate * 100).toFixed(1)}
                onChange={e => updateParam('capitalGainsTaxRate', Number(e.target.value) / 100)}
                step={0.5} min={0} max={30} />
            </Field>
            <Field label="Phase 1 Return Rate (%)">
              <input className="input-field" type="number"
                value={(params.returns.phase1 * 100).toFixed(1)}
                onChange={e => updateParam('returns', { ...params.returns, phase1: Number(e.target.value) / 100 })}
                step={0.5} min={4} max={25} />
            </Field>
            <Field label="Phase 2 Return Rate (%)">
              <input className="input-field" type="number"
                value={(params.returns.phase2 * 100).toFixed(1)}
                onChange={e => updateParam('returns', { ...params.returns, phase2: Number(e.target.value) / 100 })}
                step={0.5} min={4} max={20} />
            </Field>
            <Field label="Phase 3 Return Rate (%)">
              <input className="input-field" type="number"
                value={(params.returns.phase3 * 100).toFixed(1)}
                onChange={e => updateParam('returns', { ...params.returns, phase3: Number(e.target.value) / 100 })}
                step={0.5} min={2} max={15} />
            </Field>
            <Field label="Simulation End Age">
              <input className="input-field" type="number" value={params.targetAge}
                onChange={e => updateParam('targetAge', Number(e.target.value))} min={60} max={100} />
            </Field>
          </div>
        </div>
      </div>

      {/* Save */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={handleSave} style={{ minWidth: '160px' }}>
          {saved ? '✓ Saved!' : 'Save & Apply'}
        </button>
        <span style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>
          Changes to salary and age are applied to your simulation automatically.
        </span>
      </div>
    </div>
  );
}
