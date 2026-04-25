import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Legend,
} from 'recharts';
import { useSimulation } from '../context/SimulationContext';

const fmt = (v) => {
  if (Math.abs(v) >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (Math.abs(v) >= 100000)   return `₹${(v / 100000).toFixed(1)}L`;
  if (Math.abs(v) >= 1000)     return `₹${(v / 1000).toFixed(0)}k`;
  return `₹${v.toLocaleString()}`;
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">Age {label}</div>
      {payload.map((p, i) => (
        <div className="chart-tooltip-row" key={i}>
          <div className="chart-tooltip-dot" style={{ background: p.stroke || p.fill }} />
          <span style={{ color: 'var(--text-2)' }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Net Worth Projection (Area) ─────────────────────────────────────────
export function NetWorthChart() {
  const { simulationResult, monteCarloData, monteCarloEnabled, params } = useSimulation();
  const data = monteCarloEnabled ? monteCarloData : simulationResult.timeline;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gNW" x1="0" y1="0" x2="0" y2="1">
            <stop offset="10%" stopColor="#6366f1" stopOpacity={0.55} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="age" stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} />
        <YAxis stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={fmt} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        {monteCarloEnabled ? (
          <>
            <Area type="monotone" dataKey="nw_MC_Plus3"   name="+3%" stroke="rgba(34,197,94,0.5)"  fill="none" strokeDasharray="4 3" dot={false} />
            <Area type="monotone" dataKey="nw_MC_Plus-3"  name="-3%" stroke="rgba(239,68,68,0.5)"  fill="none" strokeDasharray="4 3" dot={false} />
            <Area type="monotone" name="Net Worth" dataKey="netWorth" stroke="#6366f1" fill="url(#gNW)" strokeWidth={2.5} dot={false} />
          </>
        ) : (
          <Area type="monotone" name="Net Worth" dataKey="netWorth" stroke="#6366f1" fill="url(#gNW)" strokeWidth={2.5} dot={false} />
        )}
        {!monteCarloEnabled && params.milestones.map(m => {
          const pt = data.find(d => d.age === m.age);
          if (!pt) return null;
          const hasSF = (simulationResult.trackedShortfalls[m.id] || 0) > 0;
          return (
            <ReferenceDot
              key={m.id} x={m.age} y={pt.netWorth} r={6}
              fill={hasSF ? '#f59e0b' : '#22c55e'} stroke="white" strokeWidth={2}
              label={{ value: m.name, position: 'top', fontSize: 10, fill: '#a1a1aa' }}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Finance Cashflow (Bar) ─────────────────────────────────────────────────
export function CashflowChart() {
  const { params } = useSimulation();
  const data = useMemo(() => {
    let inc = params.monthlySalary * 12;
    let exp = params.monthlyExpenses * 12;
    return Array.from({ length: 12 }, (_, i) => {
      const row = {
        year: `Y${i + 1}`,
        Income:   Math.round(inc),
        Expenses: Math.round(exp),
        Savings:  Math.round(Math.max(0, inc - exp)),
      };
      inc *= (1 + params.annualStepUp);
      exp *= (1 + params.inflationRate);
      return row;
    });
  }, [params]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="year" stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} />
        <YAxis stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={fmt} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#a1a1aa' }} />
        <Bar dataKey="Income"   fill="#6366f1" radius={[4,4,0,0]} />
        <Bar dataKey="Expenses" fill="#f59e0b" radius={[4,4,0,0]} />
        <Bar dataKey="Savings"  fill="#22c55e" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Milestone Progress ─────────────────────────────────────────────────────
export function MilestoneProgressChart() {
  const { params, simulationResult } = useSimulation();

  const data = useMemo(() => params.milestones.map(m => {
    const yrs = m.age - params.currentAge;
    const inflated = m.cost * Math.pow(1 + params.inflationRate, Math.max(0, yrs));
    const gap = simulationResult.trackedShortfalls[m.id] || 0;
    const funded = Math.max(0, inflated - gap);
    const pct = inflated > 0 ? Math.min(100, (funded / inflated) * 100) : 100;
    return { name: m.name, Funded: Math.round(funded), Gap: Math.round(gap), pct };
  }), [params, simulationResult]);

  if (data.length === 0)
    return <div style={{ color: 'var(--text-3)', textAlign: 'center', paddingTop: 60 }}>Add milestones to see progress</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '8px 0' }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
            <strong>{d.name}</strong>
            <span style={{ color: d.pct >= 100 ? 'var(--green)' : d.pct >= 60 ? 'var(--amber)' : 'var(--red)', fontWeight: 700 }}>
              {d.pct >= 100 ? '✓ Fully Funded' : `${d.pct.toFixed(1)}%`}
            </span>
          </div>
          <div className="progress-bar-bg" style={{ height: '12px', marginBottom: '6px' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${d.pct}%`,
                background: d.pct >= 100 ? 'linear-gradient(90deg,var(--teal),var(--green))' : d.pct >= 60 ? 'var(--amber)' : 'var(--red)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-2)' }}>
            <span>Funded: {fmt(d.Funded)}</span>
            {d.Gap > 0 && <span style={{ color: 'var(--red)' }}>Shortfall: {fmt(d.Gap)}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
