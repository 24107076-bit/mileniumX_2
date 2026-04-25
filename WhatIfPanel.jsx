import React from 'react';
import { useSimulation } from '../context/SimulationContext';

const fmt = (v) => {
  if (Math.abs(v) >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (Math.abs(v) >= 100000)   return `₹${(v / 100000).toFixed(1)}L`;
  if (Math.abs(v) >= 1000)     return `₹${(v / 1000).toFixed(0)}k`;
  return `₹${v.toLocaleString()}`;
};

function Slider({ label, value, formatted, min, max, step, onChange, color = 'var(--indigo)' }) {
  return (
    <div className="ctrl-row">
      <div className="ctrl-label">
        <span>{label}</span>
        <span className="ctrl-val">{formatted}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ accentColor: color }}
      />
    </div>
  );
}

export default function WhatIfPanel() {
  const {
    params, updateParam, updateReturn,
    monteCarloEnabled, setMonteCarloEnabled,
  } = useSimulation();

  const savings = params.monthlySalary - params.monthlyExpenses;

  return (
    <div className="ctrl">
      {/* ── Core Financials ── */}
      <Slider label="Monthly Salary" value={params.monthlySalary}
        formatted={fmt(params.monthlySalary)} min={10000} max={600000} step={5000}
        onChange={v => updateParam('monthlySalary', v)} />

      <Slider label="Monthly Expenses" value={params.monthlyExpenses}
        formatted={fmt(params.monthlyExpenses)} min={5000} max={500000} step={5000}
        onChange={v => updateParam('monthlyExpenses', v)} color="var(--amber)" />

      {/* Savings summary */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', borderRadius: '10px',
        background: savings > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${savings > 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
        fontSize: '0.83rem',
      }}>
        <span style={{ color: 'var(--text-2)' }}>Net Monthly Savings</span>
        <span style={{ fontWeight: 800, color: savings > 0 ? 'var(--green)' : 'var(--red)' }}>
          {fmt(savings)}/mo
        </span>
      </div>

      <Slider label="Current Net Worth" value={params.initialNetWorth}
        formatted={fmt(params.initialNetWorth)} min={0} max={20000000} step={100000}
        onChange={v => updateParam('initialNetWorth', v)} color="var(--teal)" />

      <Slider label="Annual Salary Step-up" value={params.annualStepUp}
        formatted={`${(params.annualStepUp * 100).toFixed(1)}%`}
        min={0} max={0.3} step={0.005}
        onChange={v => updateParam('annualStepUp', v)} />

      <Slider label="Inflation Rate" value={params.inflationRate}
        formatted={`${(params.inflationRate * 100).toFixed(1)}%`}
        min={0} max={0.15} step={0.005}
        onChange={v => updateParam('inflationRate', v)} color="var(--amber)" />

      <Slider label="Capital Gains Tax" value={params.capitalGainsTaxRate}
        formatted={`${(params.capitalGainsTaxRate * 100).toFixed(1)}%`}
        min={0} max={0.30} step={0.01}
        onChange={v => updateParam('capitalGainsTaxRate', v)} color="var(--red)" />

      {/* ── Return glide path ── */}
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '4px' }}>
        Return Glide Path
      </div>

      <Slider label="Phase 1 (Age 20–40)" value={params.returns.phase1}
        formatted={`${(params.returns.phase1 * 100).toFixed(1)}%`}
        min={0.04} max={0.25} step={0.005}
        onChange={v => updateReturn('phase1', v)} color="var(--green)" />

      <Slider label="Phase 2 (Age 40–60)" value={params.returns.phase2}
        formatted={`${(params.returns.phase2 * 100).toFixed(1)}%`}
        min={0.04} max={0.20} step={0.005}
        onChange={v => updateReturn('phase2', v)} color="var(--teal)" />

      <Slider label="Phase 3 (Age 60+)" value={params.returns.phase3}
        formatted={`${(params.returns.phase3 * 100).toFixed(1)}%`}
        min={0.02} max={0.15} step={0.005}
        onChange={v => updateReturn('phase3', v)} color="var(--blue)" />

      {/* ── Toggles ── */}
      <div
        className={`toggle-row ${params.emiAutoConvert ? 'on' : ''}`}
        onClick={() => updateParam('emiAutoConvert', !params.emiAutoConvert)}
      >
        <span>EMI Auto-Conversion</span>
        <div className="toggle-pill" />
      </div>

      <div
        className={`toggle-row ${monteCarloEnabled ? 'on' : ''}`}
        onClick={() => setMonteCarloEnabled(!monteCarloEnabled)}
      >
        <span>Monte Carlo Cone</span>
        <div className="toggle-pill" />
      </div>
    </div>
  );
}
